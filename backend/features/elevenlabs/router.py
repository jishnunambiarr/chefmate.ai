import os
import httpx

from fastapi import APIRouter, Depends, HTTPException

from features.auth.firebase import get_current_user

router = APIRouter(prefix="/elevenlabs", tags=["ElevenLabs"])


@router.get("/conversation-token")
async def get_conversation_token(user: dict = Depends(get_current_user)):
    """Get ElevenLabs conversation token for authenticated users."""
    api_key = os.getenv("ELEVENLABS_API_KEY")
    agent_id = os.getenv("ELEVENLABS_DISCOVER_AGENT_ID")
    
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_API_KEY not configured"
        )
    
    if not agent_id:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_DISCOVER_AGENT_ID not configured"
        )
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.elevenlabs.io/v1/convai/conversation/token?agent_id={agent_id}",
            headers={"xi-api-key": api_key}
        )
        
        if response.status_code != 200:
            error_detail = f"ElevenLabs API error: {response.status_code}"
            if response.status_code == 404:
                error_detail = f"ElevenLabs agent not found. Check ELEVENLABS_DISCOVER_AGENT_ID: {agent_id}"
            raise HTTPException(
                status_code=502,  # Return 502 Bad Gateway for upstream errors
                detail=error_detail
            )
        
        data = response.json()
        
        if "token" not in data:
            raise HTTPException(
                status_code=502,
                detail="Invalid response from ElevenLabs: missing token"
            )
        
        return {"token": data["token"]}


@router.get("/conversation-token-cook")
async def get_conversation_token(user: dict = Depends(get_current_user)):
    """Get ElevenLabs conversation token for authenticated users."""
    api_key = os.getenv("ELEVENLABS_API_KEY")
    agent_id = os.getenv("ELEVENLABS_COOK_AGENT_ID")
    
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_API_KEY not configured"
        )
    
    if not agent_id:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_COOK_AGENT_ID not configured"
        )
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.elevenlabs.io/v1/convai/conversation/token?agent_id={agent_id}",
            headers={"xi-api-key": api_key}
        )
        
        if response.status_code != 200:
            error_detail = f"ElevenLabs API error: {response.status_code}"
            if response.status_code == 404:
                error_detail = f"ElevenLabs agent not found. Check ELEVENLABS_COOK_AGENT_ID: {agent_id}"
            raise HTTPException(
                status_code=502,  # Return 502 Bad Gateway for upstream errors
                detail=error_detail
            )
        
        data = response.json()
        
        if "token" not in data:
            raise HTTPException(
                status_code=502,
                detail="Invalid response from ElevenLabs: missing token"
            )
        
        return {"token": data["token"]}


@router.get("/conversation-token-planner")
async def get_conversation_token_planner(user: dict = Depends(get_current_user)):
    """Get ElevenLabs conversation token for planner agent."""
    api_key = os.getenv("ELEVENLABS_API_KEY")
    agent_id = os.getenv("ELEVENLABS_PLANNER_AGENT_ID")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="ELEVENLABS_API_KEY not configured")
    
    if not agent_id:
        raise HTTPException(
            status_code=500, 
            detail="ELEVENLABS_PLANNER_AGENT_ID not configured"
        )
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.elevenlabs.io/v1/convai/conversation/token?agent_id={agent_id}",
            headers={"xi-api-key": api_key}
        )
        
        if response.status_code != 200:
            logger.error(f"ElevenLabs Error: {response.text}")
            raise HTTPException(
                status_code=502,
                detail=f"ElevenLabs API error: {response.status_code}"
            )
        
        data = response.json()
        return {"token": data["token"]}
