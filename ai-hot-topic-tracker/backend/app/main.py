from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, Any, List
import json
import asyncio
from contextlib import asynccontextmanager

from .agents.ui_agent import UIAgent
from .agents.task_agent import TaskAgent
from .agents.data_collection_agent import DataCollectionAgent
from .agents.analysis_agent import AnalysisAgent
from .agents.results_agent import ResultsAgent
from .core.config import settings
from .core.db import engine, Base
from .models.task import Task, TaskResult

class MCP:
    """Master Control Program - Central orchestrator for all agents"""
    
    def __init__(self):
        self.ui_agent = UIAgent(self)
        self.task_agent = TaskAgent(self)
        self.data_collection_agent = DataCollectionAgent(self)
        self.analysis_agent = AnalysisAgent(self)
        self.results_agent = ResultsAgent(self)
        
        # WebSocket connections for real-time updates
        self.active_connections: List[WebSocket] = []
    
    async def create_task(self, task_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new task via Task Agent"""
        return await self.task_agent.create_task(task_config)
    
    async def list_tasks(self) -> List[Dict[str, Any]]:
        """List all tasks via Task Agent"""
        return await self.task_agent.list_tasks()
    
    async def delete_task(self, task_id: int) -> Dict[str, Any]:
        """Delete a task via Task Agent"""
        return await self.task_agent.delete_task(task_id)
    
    async def collect_data(self, keywords: str, sources: List[str]) -> List[Dict[str, Any]]:
        """Collect data via Data Collection Agent"""
        return await self.data_collection_agent.collect_data(keywords, sources)
    
    async def analyze_data(self, data: List[Dict[str, Any]], analysis_type: str = "summary") -> Dict[str, Any]:
        """Analyze data via Analysis Agent"""
        return await self.analysis_agent.analyze_data(data, analysis_type)
    
    async def process_user_message(self, message: str) -> Dict[str, Any]:
        """Process user message via UI Agent"""
        return await self.ui_agent.process_user_message(message)
    
    async def notify_frontend(self, data: Dict[str, Any]):
        """Send real-time updates to connected frontend clients"""
        if self.active_connections:
            message = json.dumps(data)
            # Send to all connected clients
            for connection in self.active_connections[:]:  # Copy list to avoid modification during iteration
                try:
                    await connection.send_text(message)
                except:
                    # Remove disconnected clients
                    self.active_connections.remove(connection)
    
    async def connect_websocket(self, websocket: WebSocket):
        """Add a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect_websocket(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

# Initialize MCP
mcp = MCP()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup if needed

# Initialize FastAPI app
app = FastAPI(
    title="AI Hot Topic Tracker",
    description="An AI-powered application for tracking and analyzing hot topics",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket endpoint for real-time communication
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await mcp.connect_websocket(websocket)
    try:
        while True:
            # Receive message from frontend
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "chat_message":
                # Process chat message via MCP
                response = await mcp.process_user_message(message_data.get("message", ""))
                await websocket.send_text(json.dumps(response))
            
    except WebSocketDisconnect:
        mcp.disconnect_websocket(websocket)

# REST API endpoints
@app.get("/")
async def read_root():
    return {"message": "AI Hot Topic Tracker Backend is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "agents": "operational"}

@app.get("/api/tasks")
async def get_tasks():
    """Get all active tasks"""
    try:
        tasks = await mcp.list_tasks()
        return {"tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tasks")
async def create_task(task_data: dict):
    """Create a new task"""
    try:
        result = await mcp.create_task(task_data)
        if result["success"]:
            return {"message": "Task created successfully", "task_id": result["task_id"]}
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int):
    """Delete a task"""
    try:
        result = await mcp.delete_task(task_id)
        if result["success"]:
            return {"message": "Task deleted successfully"}
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/results")
async def get_recent_results():
    """Get recent analysis results"""
    try:
        results = await mcp.results_agent.get_recent_results()
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tasks/{task_id}/results")
async def get_task_results(task_id: int):
    """Get results for a specific task"""
    try:
        results = await mcp.task_agent.get_task_results(task_id)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sources")
async def get_data_sources():
    """Get available data sources"""
    try:
        sources = await mcp.data_collection_agent.get_available_sources()
        return {"sources": sources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analysis-types")
async def get_analysis_types():
    """Get available analysis types"""
    try:
        types = await mcp.analysis_agent.get_available_analysis_types()
        return {"analysis_types": types}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

