"""
配置管理模块
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """应用配置"""

    # 应用基本信息
    APP_NAME: str = "龙掌柜智能运营助手"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # 大模型配置
    API_KEY: str = os.getenv("COZE_WORKLOAD_IDENTITY_API_KEY", "")
    BASE_URL: str = os.getenv("COZE_INTEGRATION_MODEL_BASE_URL", "")
    MODEL_NAME: str = "doubao-seed-1-8-251228"
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 10000

    # CORS配置
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "https://longzhangguai-ai.loca.lt",
        "https://longzhang-ai-final.loca.lt",
        "https://longzhangai3.loca.lt",
        "https://longzhangai-upload.loca.lt",
        "https://wet-warthog-66.loca.lt",
        "https://dangerous-lionfish-6.loca.lt",
        "https://yellow-insect-79.loca.lt",
        "*"  # 开发环境允许所有来源
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


# 全局配置实例
settings = Settings()
