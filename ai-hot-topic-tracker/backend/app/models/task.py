from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from ..core.db import Base

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    keywords = Column(String)
    sources = Column(String)  # JSON string of source types
    analysis_type = Column(String, default="summary")
    schedule_interval = Column(Integer, default=3600)  # in seconds
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class TaskResult(Base):
    __tablename__ = "task_results"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, index=True)
    raw_data = Column(Text)  # JSON string of collected data
    analysis_result = Column(Text)  # JSON string of AI analysis
    created_at = Column(DateTime(timezone=True), server_default=func.now())
