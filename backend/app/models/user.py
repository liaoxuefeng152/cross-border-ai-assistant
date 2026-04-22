"""
用户模型
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class User(BaseModel):
    """用户模型"""
    id: Optional[int] = None
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None


# 简单的用户存储（演示用）
users_db = {}
