import openai
import httpx
from typing import List, Dict, Any
from ..core.config import settings

class AIService:
    def __init__(self):
        self.openai_client = None
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
            self.openai_client = openai
    
    async def analyze_with_openai(self, data: List[Dict], analysis_type: str = "summary") -> Dict[str, Any]:
        """Analyze data using OpenAI API"""
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")
        
        prompt = self._build_prompt(data, analysis_type)
        
        try:
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an AI analyst that provides structured analysis of text data."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000
            )
            return {
                "analysis": response.choices[0].message.content,
                "model": "gpt-3.5-turbo",
                "tokens_used": response.usage.total_tokens
            }
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def analyze_with_deepseek(self, data: List[Dict], analysis_type: str = "summary") -> Dict[str, Any]:
        """Analyze data using DeepSeek API"""
        if not settings.DEEPSEEK_API_KEY:
            raise ValueError("DeepSeek API key not configured")
        
        prompt = self._build_prompt(data, analysis_type)
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.deepseek.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {"role": "system", "content": "You are an AI analyst that provides structured analysis of text data."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 1000
                    }
                )
                response.raise_for_status()
                result = response.json()
                
                return {
                    "analysis": result["choices"][0]["message"]["content"],
                    "model": "deepseek-chat",
                    "tokens_used": result.get("usage", {}).get("total_tokens", 0)
                }
            except Exception as e:
                raise Exception(f"DeepSeek API error: {str(e)}")
    
    def _build_prompt(self, data: List[Dict], analysis_type: str) -> str:
        """Build prompt based on analysis type"""
        data_text = "\n".join([item.get("content", str(item)) for item in data])
        
        if analysis_type == "summary":
            return f"Please provide a concise summary of the following content:\n\n{data_text}"
        elif analysis_type == "sentiment":
            return f"Please analyze the sentiment of the following content and provide insights:\n\n{data_text}"
        elif analysis_type == "trends":
            return f"Please identify key trends and patterns in the following content:\n\n{data_text}"
        else:
            return f"Please analyze the following content:\n\n{data_text}"

ai_service = AIService()
