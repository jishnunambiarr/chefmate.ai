import os
from typing import Dict, Any, Optional
from datetime import datetime

import firebase_admin
from firebase_admin import firestore

# Initialize Firestore Admin client
# This uses the same Firebase Admin app initialized in auth.firebase
if not firebase_admin._apps:
    firebase_admin.initialize_app(options={
        'projectId': os.getenv('FIREBASE_PROJECT_ID', 'chefmate-ai-fac55')
    })

db = firestore.client()


def save_recipe(recipe_data: Dict[str, Any], user_id: str) -> str:
    """
    Save a recipe to Firestore.
    
    Args:
        recipe_data: Recipe data dictionary
        user_id: User ID from Firebase auth
        
    Returns:
        Document ID of the saved recipe
    """
    # Add user ID and timestamp
    recipe_data['userId'] = user_id
    recipe_data['createdAt'] = firestore.SERVER_TIMESTAMP
    
    # Add to recipes collection
    # add() returns a tuple: (write_result, document_reference)
    _, doc_ref = db.collection('recipes').add(recipe_data)
    return doc_ref.id


def get_recipe(recipe_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a recipe by ID.
    
    Args:
        recipe_id: Recipe document ID
        
    Returns:
        Recipe data dictionary or None if not found
    """
    doc_ref = db.collection('recipes').document(recipe_id)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        data['id'] = doc.id
        return data
    return None


def get_user_recipes(user_id: str) -> list[Dict[str, Any]]:
    """
    Get all recipes for a user.
    
    Args:
        user_id: User ID from Firebase auth
        
    Returns:
        List of recipe dictionaries
    """
    recipes_ref = db.collection('recipes').where('userId', '==', user_id)
    docs = recipes_ref.stream()
    
    recipes = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        recipes.append(data)
    
    return recipes
