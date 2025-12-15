from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status

from features.auth.firebase import get_current_user
from features.database.firestore import save_recipe
from features.recipes.models import RecipeCreate, RecipeResponse

router = APIRouter(prefix="/recipes", tags=["Recipes"])


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
    
    try:
        # Save to Firestore
        recipe_id = save_recipe(recipe_dict, user_id)
        
        # Fetch the saved recipe to get the timestamp
        from features.database.firestore import get_recipe
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
            imageUrl=saved_recipe.get('imageUrl'),
            createdAt=created_at_str,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save recipe: {str(e)}"
        )
