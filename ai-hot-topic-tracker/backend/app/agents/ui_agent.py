from typing import Dict, Any
import json

class UIAgent:
    """User Interface Agent - Handles communication with the frontend"""
    
    def __init__(self, mcp):
        self.mcp = mcp
    
    async def process_user_message(self, message: str) -> Dict[str, Any]:
        """Process user message and return appropriate response"""
        message = message.strip().lower()
        
        # Parse user intent
        if "create task" in message or "track" in message:
            return await self._handle_create_task(message)
        elif "list tasks" in message or "show tasks" in message:
            return await self._handle_list_tasks()
        elif "delete task" in message or "remove task" in message:
            return await self._handle_delete_task(message)
        elif "help" in message:
            return self._handle_help()
        else:
            return {
                "type": "response",
                "message": "I didn't understand that. Type 'help' to see what I can do."
            }
    
    async def _handle_create_task(self, message: str) -> Dict[str, Any]:
        """Handle task creation requests"""
        # Simple keyword extraction (in real app, use NLP)
        keywords = self._extract_keywords(message)
        
        if not keywords:
            return {
                "type": "response",
                "message": "Please specify what keywords you'd like me to track. For example: 'Track AI breakthroughs'"
            }
        
        # Create task via MCP
        task_config = {
            "keywords": keywords,
            "sources": ["news", "reddit"],
            "analysis_type": "summary",
            "schedule_interval": 3600  # 1 hour
        }
        
        result = await self.mcp.create_task(task_config)
        
        if result["success"]:
            return {
                "type": "response",
                "message": f"✅ Created task to track '{keywords}'. I'll check for updates every hour."
            }
        else:
            return {
                "type": "response",
                "message": f"❌ Failed to create task: {result['error']}"
            }
    
    async def _handle_list_tasks(self) -> Dict[str, Any]:
        """Handle list tasks requests"""
        tasks = await self.mcp.list_tasks()
        
        if not tasks:
            return {
                "type": "response",
                "message": "You don't have any active tasks yet. Say 'track [keywords]' to create one!"
            }
        
        task_list = "\n".join([
            f"• {task['name']} (every {task['schedule_interval']//60} minutes)"
            for task in tasks
        ])
        
        return {
            "type": "response",
            "message": f"Your active tasks:\n{task_list}"
        }
    
    async def _handle_delete_task(self, message: str) -> Dict[str, Any]:
        """Handle delete task requests"""
        # Extract task identifier from message
        # For simplicity, assume user says "delete task 1" or similar
        words = message.split()
        task_id = None
        
        for i, word in enumerate(words):
            if word == "task" and i + 1 < len(words):
                try:
                    task_id = int(words[i + 1])
                    break
                except ValueError:
                    pass
        
        if task_id is None:
            return {
                "type": "response",
                "message": "Please specify which task to delete. For example: 'delete task 1'"
            }
        
        result = await self.mcp.delete_task(task_id)
        
        if result["success"]:
            return {
                "type": "response",
                "message": f"✅ Deleted task {task_id}"
            }
        else:
            return {
                "type": "response",
                "message": f"❌ Failed to delete task: {result['error']}"
            }
    
    def _handle_help(self) -> Dict[str, Any]:
        """Return help message"""
        help_text = """
🤖 AI Hot Topic Tracker Commands:

• **Track topics**: "Track AI breakthroughs" or "Create task for cryptocurrency news"
• **List tasks**: "Show my tasks" or "List all tasks"
• **Delete tasks**: "Delete task 1" or "Remove task 2"
• **Help**: "Help" or "What can you do?"

I'll automatically collect data and provide AI-powered analysis for your tracked topics!
        """
        
        return {
            "type": "response",
            "message": help_text.strip()
        }
    
    def _extract_keywords(self, message: str) -> str:
        """Extract keywords from user message (simple implementation)"""
        # Remove common words and commands
        stop_words = {"track", "create", "task", "for", "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "of"}
        words = [word for word in message.split() if word.lower() not in stop_words]
        
        # Join remaining words
        keywords = " ".join(words)
        return keywords if keywords else None

