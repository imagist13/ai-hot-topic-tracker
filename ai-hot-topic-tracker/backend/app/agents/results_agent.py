from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.task import TaskResult
from ..core.db import SessionLocal
import json

class ResultsAgent:
    """Results Agent - Formats and stores results"""
    
    def __init__(self, mcp):
        self.mcp = mcp
    
    async def format_result(self, analysis_result: Dict[str, Any], task_info: Dict[str, Any]) -> Dict[str, Any]:
        """Format analysis result for frontend display"""
        formatted_result = {
            "task_id": task_info.get("id"),
            "task_name": task_info.get("name"),
            "keywords": task_info.get("keywords"),
            "timestamp": analysis_result.get("timestamp"),
            "data_count": analysis_result.get("data_count", 0),
            "sources": analysis_result.get("sources", []),
            "analysis": {
                "summary": analysis_result.get("summary", ""),
                "key_points": analysis_result.get("key_points", []),
                "sentiment": analysis_result.get("sentiment", "neutral"),
                "type": analysis_result.get("analysis_type", "summary")
            },
            "status": "completed"
        }
        
        # Add visual indicators for sentiment
        sentiment_emoji = {
            "positive": "📈",
            "negative": "📉",
            "neutral": "📊"
        }
        
        formatted_result["analysis"]["sentiment_emoji"] = sentiment_emoji.get(
            analysis_result.get("sentiment", "neutral"), "📊"
        )
        
        return formatted_result
    
    async def store_result(self, task_id: int, raw_data: List[Dict[str, Any]], analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Store result in database"""
        try:
            db = SessionLocal()
            
            result = TaskResult(
                task_id=task_id,
                raw_data=json.dumps(raw_data),
                analysis_result=json.dumps(analysis_result)
            )
            
            db.add(result)
            db.commit()
            db.refresh(result)
            db.close()
            
            return {
                "success": True,
                "result_id": result.id
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_recent_results(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent results across all tasks"""
        db = SessionLocal()
        
        results = (
            db.query(TaskResult)
            .order_by(TaskResult.created_at.desc())
            .limit(limit)
            .all()
        )
        
        formatted_results = []
        for result in results:
            try:
                analysis_data = json.loads(result.analysis_result)
                formatted_results.append({
                    "id": result.id,
                    "task_id": result.task_id,
                    "summary": analysis_data.get("summary", ""),
                    "sentiment": analysis_data.get("sentiment", "neutral"),
                    "data_count": analysis_data.get("data_count", 0),
                    "created_at": result.created_at.isoformat()
                })
            except json.JSONDecodeError:
                continue
        
        db.close()
        return formatted_results
    
    async def get_task_history(self, task_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        """Get historical results for a specific task"""
        db = SessionLocal()
        
        results = (
            db.query(TaskResult)
            .filter(TaskResult.task_id == task_id)
            .order_by(TaskResult.created_at.desc())
            .limit(limit)
            .all()
        )
        
        history = []
        for result in results:
            try:
                analysis_data = json.loads(result.analysis_result)
                history.append({
                    "id": result.id,
                    "analysis": analysis_data,
                    "created_at": result.created_at.isoformat()
                })
            except json.JSONDecodeError:
                continue
        
        db.close()
        return history
    
    async def generate_summary_report(self, task_id: int, days: int = 7) -> Dict[str, Any]:
        """Generate a summary report for a task over specified days"""
        from datetime import datetime, timedelta
        
        db = SessionLocal()
        
        # Get results from the last N days
        since_date = datetime.now() - timedelta(days=days)
        results = (
            db.query(TaskResult)
            .filter(
                TaskResult.task_id == task_id,
                TaskResult.created_at >= since_date
            )
            .order_by(TaskResult.created_at.desc())
            .all()
        )
        
        if not results:
            db.close()
            return {
                "task_id": task_id,
                "period": f"Last {days} days",
                "total_runs": 0,
                "summary": "No data available for this period"
            }
        
        # Analyze trends
        sentiments = []
        data_counts = []
        key_topics = {}
        
        for result in results:
            try:
                analysis_data = json.loads(result.analysis_result)
                sentiments.append(analysis_data.get("sentiment", "neutral"))
                data_counts.append(analysis_data.get("data_count", 0))
                
                # Collect key points
                for point in analysis_data.get("key_points", []):
                    key_topics[point] = key_topics.get(point, 0) + 1
                    
            except json.JSONDecodeError:
                continue
        
        # Calculate summary statistics
        avg_data_count = sum(data_counts) / len(data_counts) if data_counts else 0
        sentiment_counts = {
            "positive": sentiments.count("positive"),
            "negative": sentiments.count("negative"),
            "neutral": sentiments.count("neutral")
        }
        
        dominant_sentiment = max(sentiment_counts, key=sentiment_counts.get)
        top_topics = sorted(key_topics.items(), key=lambda x: x[1], reverse=True)[:5]
        
        db.close()
        
        return {
            "task_id": task_id,
            "period": f"Last {days} days",
            "total_runs": len(results),
            "avg_data_per_run": round(avg_data_count, 1),
            "sentiment_distribution": sentiment_counts,
            "dominant_sentiment": dominant_sentiment,
            "top_topics": [topic for topic, count in top_topics],
            "summary": f"Analyzed {len(results)} data collections with an average of {round(avg_data_count, 1)} items per run. Overall sentiment: {dominant_sentiment}."
        }
