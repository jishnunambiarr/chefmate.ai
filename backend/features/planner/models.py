from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class MealItem(BaseModel):
    name: str
    emoji: str = "🍽️"
    recipe_id: Optional[str] = None

class DayPlan(BaseModel):
    day: str
    breakfast: List[MealItem] = []
    lunch: List[MealItem] = []
    dinner: List[MealItem] = []

class WeeklyPlan(BaseModel):
    week_start_date: Optional[datetime] = None
    days: List[DayPlan]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str

class WeeklyPlanCreate(BaseModel):
    days: Dict[str, Dict[str, List[str]]] 
    # Structure: { "monday": { "breakfast": ["Eggs"], ... } }
    # Simplified input to make it easier for the Agent to generate JSON
