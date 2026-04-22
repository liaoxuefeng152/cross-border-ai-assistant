"""
聊天API路由
"""
from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.agents.agent import build_agent
from langchain_core.messages import HumanMessage, AIMessage

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    """
    发送消息并获取AI回复

    Args:
        request: 聊天请求，包含消息和会话ID

    Returns:
        ChatResponse: AI回复和会话信息
    """
    try:
        # 构建Agent
        agent = build_agent()

        # 调用Agent
        result = await agent.ainvoke(
            {"messages": [HumanMessage(content=request.message)]},
            config={"configurable": {"thread_id": request.session_id or "default"}}
        )

        # 提取回复
        messages = result.get("messages", [])
        ai_messages = [msg for msg in messages if isinstance(msg, AIMessage)]

        if not ai_messages:
            raise HTTPException(status_code=500, detail="AI未生成回复")

        reply = ai_messages[-1].content

        # 提取使用的工具
        tools_used = []
        for msg in messages:
            if hasattr(msg, 'tool_calls') and msg.tool_calls:
                for tool_call in msg.tool_calls:
                    tools_used.append(tool_call.get('name', ''))

        # 如果没有session_id，从config中获取
        session_id = request.session_id or "default"

        return ChatResponse(
            message=reply,
            session_id=session_id,
            tools_used=list(set(tools_used))
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")


@router.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "ok",
        "service": "龙掌柜智能运营助手",
        "version": "1.0.0"
    }
