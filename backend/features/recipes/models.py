from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class RecipeCreate(BaseModel):
    """Recipe creation model (from frontend)"""
    userId: str
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="")
    ingredients: List[str] = Field(..., min_items=1)
    instructions: List[str] = Field(..., min_items=1)
    prepTime: Optional[int] = Field(None, ge=0)
    cookTime: Optional[int] = Field(None, ge=0)
    servings: Optional[int] = Field(None, ge=1)

    @field_validator('ingredients', 'instructions', mode='before')
    @classmethod
    def validate_non_empty_strings(cls, v: List[str]) -> List[str]:
        """Ensure all items in lists are non-empty strings"""
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
    ingredients: List[str]
    instructions: List[str]
    prepTime: Optional[int] = None
    cookTime: Optional[int] = None
    servings: Optional[int] = None
    createdAt: str  # ISO format datetime string
