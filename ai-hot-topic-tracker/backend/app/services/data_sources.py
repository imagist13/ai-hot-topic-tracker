import httpx
import asyncio
from typing import List, Dict, Any
from ..core.config import settings

class NewsAPISource:
    def __init__(self):
        self.api_key = settings.NEWS_API_KEY
        self.base_url = "https://newsapi.org/v2"
    
    async def fetch_news(self, keywords: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch news articles from NewsAPI"""
        if not self.api_key:
            raise ValueError("News API key not configured")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/everything",
                    params={
                        "q": keywords,
                        "apiKey": self.api_key,
                        "pageSize": limit,
                        "sortBy": "publishedAt"
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                articles = []
                for article in data.get("articles", []):
                    articles.append({
                        "title": article.get("title"),
                        "content": article.get("description") or article.get("content", ""),
                        "url": article.get("url"),
                        "source": article.get("source", {}).get("name"),
                        "published_at": article.get("publishedAt"),
                        "type": "news"
                    })
                
                return articles
            except Exception as e:
                raise Exception(f"NewsAPI error: {str(e)}")

class RedditSource:
    def __init__(self):
        self.base_url = "https://www.reddit.com"
    
    async def fetch_reddit_posts(self, subreddit: str, keywords: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch Reddit posts (using public JSON API)"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/r/{subreddit}/search.json",
                    params={
                        "q": keywords,
                        "limit": limit,
                        "sort": "new"
                    },
                    headers={"User-Agent": "AI-Hot-Topic-Tracker/1.0"}
                )
                response.raise_for_status()
                data = response.json()
                
                posts = []
                for post in data.get("data", {}).get("children", []):
                    post_data = post.get("data", {})
                    posts.append({
                        "title": post_data.get("title"),
                        "content": post_data.get("selftext", ""),
                        "url": f"https://reddit.com{post_data.get('permalink')}",
                        "source": f"r/{subreddit}",
                        "score": post_data.get("score", 0),
                        "type": "reddit"
                    })
                
                return posts
            except Exception as e:
                raise Exception(f"Reddit API error: {str(e)}")

class DataSourceManager:
    def __init__(self):
        self.news_source = NewsAPISource()
        self.reddit_source = RedditSource()
    
    async def collect_data(self, keywords: str, sources: List[str]) -> List[Dict[str, Any]]:
        """Collect data from multiple sources"""
        all_data = []
        tasks = []
        
        if "news" in sources:
            tasks.append(self.news_source.fetch_news(keywords))
        
        if "reddit" in sources:
            # Default to popular subreddits for the keywords
            subreddits = ["technology", "news", "worldnews"]
            for subreddit in subreddits:
                tasks.append(self.reddit_source.fetch_reddit_posts(subreddit, keywords))
        
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for result in results:
                if isinstance(result, Exception):
                    print(f"Data collection error: {result}")
                else:
                    all_data.extend(result)
        
        return all_data

data_source_manager = DataSourceManager()
