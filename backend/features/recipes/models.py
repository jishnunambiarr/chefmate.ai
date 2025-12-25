from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class Ingredient(BaseModel):
    """Ingredient model with name, optional amount, and optional unit"""
    name: str = Field(..., min_length=1)
    amount: Optional[float] = None
    unit: Optional[str] = None


class RecipeCreate(BaseModel):
    """Recipe creation model (from frontend)"""
    userId: str
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="")
    ingredients: List[Dict[str, Any]] = Field(..., min_items=1)
    instructions: List[str] = Field(..., min_items=1)
    prepTime: Optional[int] = Field(None, ge=0)
    cookTime: Optional[int] = Field(None, ge=0)
    servings: Optional[int] = Field(None, ge=1)

    @field_validator('ingredients', mode='before')
    @classmethod
    def validate_ingredients(cls, v):
        """Validate ingredients format"""
        if not isinstance(v, list):
            raise ValueError('Ingredients must be a list')
        if len(v) == 0:
            raise ValueError('Ingredients list cannot be empty')
        
        validated = []
        for item in v:
            if isinstance(item, dict):
                # Validate ingredient object
                if 'name' not in item or not isinstance(item.get('name'), str) or not item['name'].strip():
                    raise ValueError('Each ingredient must have a non-empty name')
                validated.append({
                    'name': item['name'].strip(),
                    'amount': item.get('amount') if 'amount' in item else None,
                    'unit': item.get('unit') if 'unit' in item else None,
                })
            elif isinstance(item, str):
                # Backward compatibility: convert string to object format
                validated.append({
                    'name': item.strip(),
                    'amount': None,
                    'unit': None,
                })
            else:
                raise ValueError('Each ingredient must be an object with a name field')
        
        return validated

    @field_validator('instructions', mode='before')
    @classmethod
    def validate_instructions(cls, v: List[str]) -> List[str]:
        """Ensure all instructions are non-empty strings"""
        if not isinstance(v, list):
            raise ValueError('Must be a list')
        if not all(isinstance(item, str) and item.strip() for item in v):
            raise ValueError('All items must be non-empty strings')
        return [item.strip() for item in v]


class RecipeResponse(BaseModel):
    """Recipe response model (to frontend)"""
    id: str
    userId: str
    title: str
    description: str
    ingredients: List[Dict[str, Any]]
    instructions: List[str]
    prepTime: Optional[int] = None
    cookTime: Optional[int] = None
    servings: Optional[int] = None
    createdAt: str  # ISO format datetime string
