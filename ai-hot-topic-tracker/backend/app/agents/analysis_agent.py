from typing import List, Dict, Any
from ..services.ai_service import ai_service

class AnalysisAgent:
    """AI Analysis Agent - Performs analysis using AI models"""
    
    def __init__(self, mcp):
        self.mcp = mcp
        self.ai_service = ai_service
    
    async def analyze_data(self, data: List[Dict[str, Any]], analysis_type: str = "summary") -> Dict[str, Any]:
        """Analyze collected data using AI models"""
        if not data:
            return {
                "analysis": "No data to analyze",
                "summary": "No content found for the specified keywords and sources.",
                "key_points": [],
                "sentiment": "neutral",
                "data_count": 0
            }
        
        try:
            # Try OpenAI first, fallback to DeepSeek
            result = await self._try_analysis_with_fallback(data, analysis_type)
            
            # Enhance result with metadata
            result.update({
                "data_count": len(data),
                "sources": list(set([item.get("source", "unknown") for item in data])),
                "analysis_type": analysis_type,
                "timestamp": self._get_current_timestamp()
            })
            
            return result
            
        except Exception as e:
            return {
                "analysis": f"Analysis failed: {str(e)}",
                "summary": "Unable to analyze data due to technical issues.",
                "key_points": [],
                "sentiment": "neutral",
                "data_count": len(data),
                "error": str(e)
            }
    
    async def _try_analysis_with_fallback(self, data: List[Dict[str, Any]], analysis_type: str) -> Dict[str, Any]:
        """Try analysis with OpenAI, fallback to DeepSeek"""
        try:
            # Try OpenAI first
            result = await self.ai_service.analyze_with_openai(data, analysis_type)
            return self._parse_ai_response(result["analysis"], analysis_type)
        except Exception as openai_error:
            print(f"OpenAI failed: {openai_error}")
            try:
                # Fallback to DeepSeek
                result = await self.ai_service.analyze_with_deepseek(data, analysis_type)
                return self._parse_ai_response(result["analysis"], analysis_type)
            except Exception as deepseek_error:
                print(f"DeepSeek failed: {deepseek_error}")
                # Final fallback - basic analysis
                return self._basic_analysis(data, analysis_type)
    
    def _parse_ai_response(self, ai_response: str, analysis_type: str) -> Dict[str, Any]:
        """Parse AI response into structured format"""
        # This is a simple parser - in production, you'd want more sophisticated parsing
        lines = ai_response.split('\n')
        
        result = {
            "analysis": ai_response,
            "summary": "",
            "key_points": [],
            "sentiment": "neutral"
        }
        
        # Extract summary (first paragraph)
        summary_lines = []
        for line in lines:
            line = line.strip()
            if line and not line.startswith(('•', '-', '*', '1.', '2.', '3.')):
                summary_lines.append(line)
            if len(summary_lines) >= 3:  # First few lines as summary
                break
        
        result["summary"] = " ".join(summary_lines)
        
        # Extract key points (bullet points or numbered lists)
        for line in lines:
            line = line.strip()
            if line.startswith(('•', '-', '*')) or (line and line[0].isdigit() and '.' in line):
                point = line.lstrip('•-*0123456789. ')
                if point:
                    result["key_points"].append(point)
        
        # Simple sentiment detection
        positive_words = ['positive', 'good', 'growth', 'increase', 'success', 'breakthrough']
        negative_words = ['negative', 'decline', 'problem', 'issue', 'concern', 'crisis']
        
        text_lower = ai_response.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            result["sentiment"] = "positive"
        elif negative_count > positive_count:
            result["sentiment"] = "negative"
        
        return result
    
    def _basic_analysis(self, data: List[Dict[str, Any]], analysis_type: str) -> Dict[str, Any]:
        """Basic fallback analysis when AI services fail"""
        titles = [item.get("title", "") for item in data if item.get("title")]
        contents = [item.get("content", "") for item in data if item.get("content")]
        
        # Simple word frequency analysis
        all_text = " ".join(titles + contents).lower()
        words = all_text.split()
        word_freq = {}
        
        for word in words:
            if len(word) > 4:  # Only consider longer words
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Get top keywords
        top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "analysis": f"Found {len(data)} items. Most frequent topics: {', '.join([w[0] for w in top_words[:5]])}",
            "summary": f"Collected {len(data)} items from {len(set([item.get('source') for item in data]))} sources.",
            "key_points": [f"Topic: {word}" for word, count in top_words[:5]],
            "sentiment": "neutral"
        }
    
    def _get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    async def get_available_analysis_types(self) -> List[Dict[str, Any]]:
        """Get list of available analysis types"""
        return [
            {
                "id": "summary",
                "name": "Summary",
                "description": "Provide a concise summary of the content"
            },
            {
                "id": "sentiment",
                "name": "Sentiment Analysis",
                "description": "Analyze the sentiment and emotional tone"
            },
            {
                "id": "trends",
                "name": "Trend Analysis",
                "description": "Identify key trends and patterns"
            }
        ]

