from typing import Dict, Any, List
from sqlalchemy.orm import Session
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import json
import asyncio
from ..models.task import Task, TaskResult
from ..core.db import SessionLocal

class TaskAgent:
    """Task Management Agent - Manages task lifecycle and scheduling"""
    
    def __init__(self, mcp):
        self.mcp = mcp
        self.scheduler = AsyncIOScheduler()
        self.scheduler.start()
    
    async def create_task(self, task_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new tracking task"""
        try:
            db = SessionLocal()
            
            # Create task record
            task = Task(
                name=f"Track: {task_config['keywords']}",
                keywords=task_config["keywords"],
                sources=json.dumps(task_config["sources"]),
                analysis_type=task_config.get("analysis_type", "summary"),
                schedule_interval=task_config.get("schedule_interval", 3600),
                is_active=True
            )
            
            db.add(task)
            db.commit()
            db.refresh(task)
            
            # Schedule the task
            self.scheduler.add_job(
                self._execute_task,
                trigger=IntervalTrigger(seconds=task.schedule_interval),
                args=[task.id],
                id=f"task_{task.id}",
                replace_existing=True
            )
            
            db.close()
            
            return {
                "success": True,
                "task_id": task.id,
                "message": f"Task created and scheduled"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def list_tasks(self) -> List[Dict[str, Any]]:
        """List all active tasks"""
        db = SessionLocal()
        tasks = db.query(Task).filter(Task.is_active == True).all()
        
        result = []
        for task in tasks:
            result.append({
                "id": task.id,
                "name": task.name,
                "keywords": task.keywords,
                "sources": json.loads(task.sources),
                "analysis_type": task.analysis_type,
                "schedule_interval": task.schedule_interval,
                "created_at": task.created_at.isoformat()
            })
        
        db.close()
        return result
    
    async def delete_task(self, task_id: int) -> Dict[str, Any]:
        """Delete a task"""
        try:
            db = SessionLocal()
            task = db.query(Task).filter(Task.id == task_id).first()
            
            if not task:
                db.close()
                return {
                    "success": False,
                    "error": "Task not found"
                }
            
            # Remove from scheduler
            try:
                self.scheduler.remove_job(f"task_{task_id}")
            except:
                pass  # Job might not exist
            
            # Mark as inactive
            task.is_active = False
            db.commit()
            db.close()
            
            return {
                "success": True,
                "message": f"Task {task_id} deleted"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _execute_task(self, task_id: int):
        """Execute a scheduled task"""
        try:
            db = SessionLocal()
            task = db.query(Task).filter(Task.id == task_id, Task.is_active == True).first()
            
            if not task:
                db.close()
                return
            
            # Collect data via MCP
            sources = json.loads(task.sources)
            raw_data = await self.mcp.collect_data(task.keywords, sources)
            
            if raw_data:
                # Analyze data via MCP
                analysis_result = await self.mcp.analyze_data(raw_data, task.analysis_type)
                
                # Store result
                result = TaskResult(
                    task_id=task.id,
                    raw_data=json.dumps(raw_data),
                    analysis_result=json.dumps(analysis_result)
                )
                
                db.add(result)
                db.commit()
                
                # Notify frontend via MCP
                await self.mcp.notify_frontend({
                    "type": "task_result",
                    "task_id": task.id,
                    "task_name": task.name,
                    "result": analysis_result
                })
            
            db.close()
            
        except Exception as e:
            print(f"Error executing task {task_id}: {e}")
    
    async def get_task_results(self, task_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent results for a task"""
        db = SessionLocal()
        results = (
            db.query(TaskResult)
            .filter(TaskResult.task_id == task_id)
            .order_by(TaskResult.created_at.desc())
            .limit(limit)
            .all()
        )
        
        result_list = []
        for result in results:
            result_list.append({
                "id": result.id,
                "task_id": result.task_id,
                "analysis_result": json.loads(result.analysis_result),
                "created_at": result.created_at.isoformat()
            })
        
        db.close()
        return result_list

