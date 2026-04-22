"""
聊天相关的Schema
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class ChatRequest(BaseModel):
    """聊天请求"""
    message: str = Field(..., description="用户消息", min_length=1)
    session_id: Optional[str] = Field(None, description="会话ID")


class ChatResponse(BaseModel):
    """聊天响应"""
    message: str = Field(..., description="AI回复")
    session_id: str = Field(..., description="会话ID")
    tools_used: List[str] = Field(default_factory=list, description="使用的工具")


class ChatHistoryResponse(BaseModel):
    """聊天历史响应"""
    session_id: str
    messages: List[dict]
