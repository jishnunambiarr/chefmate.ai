import os
import secrets
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status

from features.auth.firebase import get_current_user
from features.database.firestore import save_recipe, get_recipe
from features.recipes.models import RecipeCreate, RecipeResponse

router = APIRouter(prefix="/recipes", tags=["Recipes"])


async def verify_agent_endpoint_key(request: Request):
    """
    Verify the discover-agent-endpoint-key header matches the environment variable.
    Uses constant-time string comparison to prevent timing attacks.
    """
    header_key = request.headers.get("discover-agent-endpoint-key")
    expected_key = os.getenv("DISCOVER_AGENT_ENDPOINT_KEY")
    
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Agent endpoint key not configured"
        )
    
    if not header_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing discover-agent-endpoint-key header"
        )
    
    # Use constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(header_key, expected_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid discover-agent-endpoint-key"
        )
    
    return True


def _save_and_return_recipe(recipe_dict: dict, user_id: str) -> RecipeResponse:
    """
    Helper function to save a recipe and return the response.
    Reused by both user and agent endpoints.
    """
    try:
        # Save to Firestore
        recipe_id = save_recipe(recipe_dict, user_id)
        
        # Fetch the saved recipe to get the timestamp
        saved_recipe = get_recipe(recipe_id)
        
        if not saved_recipe:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve saved recipe"
            )
        
        # Convert Firestore timestamp to ISO string
        created_at = saved_recipe.get('createdAt')
        if created_at is None:
            created_at_str = datetime.now().isoformat()
        elif hasattr(created_at, 'to_datetime'):
            # Firestore Timestamp object
            created_at_str = created_at.to_datetime().isoformat()
        elif isinstance(created_at, datetime):
            created_at_str = created_at.isoformat()
        else:
            # Fallback: try to convert to datetime
            try:
                created_at_str = datetime.fromtimestamp(created_at).isoformat()
            except (TypeError, ValueError):
                created_at_str = datetime.now().isoformat()
        
        # Return recipe response
        return RecipeResponse(
            id=recipe_id,
            userId=saved_recipe['userId'],
            title=saved_recipe['title'],
            description=saved_recipe.get('description', ''),
            ingredients=saved_recipe['ingredients'],
            instructions=saved_recipe['instructions'],
            prepTime=saved_recipe.get('prepTime'),
            cookTime=saved_recipe.get('cookTime'),
            servings=saved_recipe.get('servings'),
            createdAt=created_at_str,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save recipe: {str(e)}"
        )


@router.post("", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe: RecipeCreate,
    user: dict = Depends(get_current_user)
):
    """
    Create a new recipe.
    
    The userId in the recipe must match the authenticated user's ID.
    """
    user_id = user.get('uid') or user.get('user_id')
    
    # Verify that the userId in the recipe matches the authenticated user
    if recipe.userId != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recipe userId must match authenticated user"
        )
    
    # Convert Pydantic model to dict for Firestore
    recipe_dict = recipe.model_dump()
    
    # Save and return recipe using shared helper function
    return _save_and_return_recipe(recipe_dict, user_id)


@router.post("/agent", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
async def create_recipe_agent(
    recipe: RecipeCreate,
    request: Request,
    _: bool = Depends(verify_agent_endpoint_key)
):
    """
    Create a new recipe via AI agent.
    
    This endpoint is for private AI agents only and uses header-based authentication.
    The request must include the discover-agent-endpoint-key header.
    """
    # Convert Pydantic model to dict for Firestore
    recipe_dict = recipe.model_dump()
    
    # Use userId from the recipe (no authentication check needed for agent endpoint)
    user_id = recipe.userId
    
    # Save and return recipe using shared helper function
    return _save_and_return_recipe(recipe_dict, user_id)
