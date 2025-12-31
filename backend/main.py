from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging

from features.elevenlabs.router import router as elevenlabs_router
from features.recipes.router import router as recipes_router

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ChefMate API",
    version="1.0.0",
)


# Debug middleware to log all requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f">>> Request: {request.method} {request.url.path}")
    headers = dict(request.headers)
    if "authorization" in headers:
        headers["authorization"] = "[REDACTED]"
    if "Authorization" in headers:
        headers["Authorization"] = "[REDACTED]"
    logger.info(f">>> Headers: {headers}")
    response = await call_next(request)
    logger.info(f"<<< Response: {response.status_code}")
    return response


# CORS for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(elevenlabs_router)
app.include_router(recipes_router)
from features.planner.router import router as planner_router
app.include_router(planner_router)


@app.on_event("startup")
async def startup_event():
    """Log registered routes on startup for debugging."""
    import logging
    logger = logging.getLogger("uvicorn")
    routes = [r.path for r in app.routes if hasattr(r, 'path')]
    logger.info(f"Registered routes: {', '.join(sorted(routes))}")


@app.get("/")
async def root():
    return {"message": "ChefMate API"}


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
