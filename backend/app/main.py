"""
FastAPI主应用
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config.settings import settings
from app.api.v1.chat import router as chat_router

# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="龙掌柜智能运营助手后端API - 专业的跨境电商AI运营助手",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(chat_router, prefix="/api/v1")

# 健康检查
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "message": "龙掌柜智能运营助手运行正常"
    }

# 根路径 - 提供前端页面
@app.get("/")
async def root():
    index_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "龙掌柜智能运营助手 - 跨境电商AI运营专家",
        "docs": "/docs",
        "health": "/health"
    }

# 启动事件
@app.on_event("startup")
async def startup_event():
    """应用启动时的初始化"""
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} 启动中...")
    print(f"📚 API文档: http://localhost:8000/docs")
    print(f"🔍 ReDoc文档: http://localhost:8000/redoc")

# 关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时的清理"""
    print(f"👋 {settings.APP_NAME} 正在关闭...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
