from typing import List, Dict, Any
from ..services.data_sources import data_source_manager

class DataCollectionAgent:
    """Data Collection Agent - Fetches data from various sources"""
    
    def __init__(self, mcp):
        self.mcp = mcp
        self.data_source_manager = data_source_manager
    
    async def collect_data(self, keywords: str, sources: List[str]) -> List[Dict[str, Any]]:
        """Collect data from specified sources"""
        try:
            data = await self.data_source_manager.collect_data(keywords, sources)
            
            # Filter and clean data
            cleaned_data = []
            for item in data:
                if item.get("title") and item.get("content"):
                    cleaned_data.append({
                        "title": item["title"][:200],  # Truncate long titles
                        "content": item["content"][:1000],  # Truncate long content
                        "url": item.get("url"),
                        "source": item.get("source"),
                        "type": item.get("type"),
                        "published_at": item.get("published_at"),
                        "score": item.get("score", 0)
                    })
            
            return cleaned_data
            
        except Exception as e:
            print(f"Data collection error: {e}")
            return []
    
    async def get_available_sources(self) -> List[Dict[str, Any]]:
        """Get list of available data sources"""
        return [
            {
                "id": "news",
                "name": "News Articles",
                "description": "Latest news articles from various sources",
                "requires_api_key": True
            },
            {
                "id": "reddit",
                "name": "Reddit Posts",
                "description": "Posts from relevant subreddits",
                "requires_api_key": False
            }
        ]
    
    async def validate_source_config(self, source_id: str) -> Dict[str, Any]:
        """Validate if a data source is properly configured"""
        if source_id == "news":
            from ..core.config import settings
            return {
                "valid": bool(settings.NEWS_API_KEY),
                "message": "News API key required" if not settings.NEWS_API_KEY else "Ready"
            }
        elif source_id == "reddit":
            return {
                "valid": True,
                "message": "Ready (using public API)"
            }
        else:
            return {
                "valid": False,
                "message": "Unknown source"
            }

