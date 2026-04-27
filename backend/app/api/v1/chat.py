"""
聊天API路由
"""
from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
import httpx
import json
import os
import re

router = APIRouter(prefix="/chat", tags=["chat"])

# 豆包API配置
API_KEY = os.getenv("COZE_WORKLOAD_IDENTITY_API_KEY", "")
BASE_URL = os.getenv("COZE_INTEGRATION_MODEL_BASE_URL", "")


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
        # 系统提示词
        system_prompt = """你是龙掌柜智能运营助手，专为跨境卖家提供一站式运营服务。

# 你的能力：
1. 智能选品：分析市场趋势，推荐有潜力的商品
2. 商品采集：从1688、淘宝等平台采集商品信息
3. Listing优化：生成高质量的标题和描述
4. 智能定价：计算保本价，分析利润空间
5. 竞品分析：分析竞争对手，制定差异化策略
6. 蓝海挖掘：发现高利润、低竞争的蓝海类目

# 回复要求：
- 使用Markdown格式
- 适当使用表情符号
- 重要的信息用加粗强调
- 如果用户问定价相关，提供具体的数字计算
- 如果用户问选品相关，提供具体的类目推荐
- 回复要简洁明了，不要太长

开始回答用户的问题吧！"""

        # 调用豆包API
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "doubao-seed-1-8-251228",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": request.message}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "stream": True
                }
            )

            print(f"状态码: {response.status_code}")
            print(f"响应头: {dict(response.headers)}")

            if response.status_code != 200:
                error_text = response.text
                print(f"API调用失败: {response.status_code}, {error_text}")
                raise HTTPException(status_code=500, detail=f"API调用失败: {response.status_code}")

            # 处理流式响应（SSE格式）
            content = response.text
            print(f"原始响应前200字符: {content[:200]}...")

            # 解析SSE格式的流式响应
            full_content = ""
            for line in content.split("\n"):
                line = line.strip()
                if line.startswith("data:"):
                    try:
                        data_str = line[5:].strip()  # 移除 "data: " 前缀
                        if data_str == "[DONE]":
                            continue
                        data = json.loads(data_str)
                        if "choices" in data and len(data["choices"]) > 0:
                            delta = data["choices"][0].get("delta", {})
                            # 提取content字段（不是reasoning_content）
                            if "content" in delta:
                                full_content += delta["content"]
                    except json.JSONDecodeError:
                        continue
                    except Exception as e:
                        print(f"解析行失败: {line}, 错误: {e}")
                        continue

            if not full_content:
                raise HTTPException(status_code=500, detail="API返回内容为空")

            reply = full_content

            # 如果没有session_id，使用默认值
            session_id = request.session_id or "default"

            print(f"最终回复: {reply[:200]}...")

            return ChatResponse(
                message=reply,
                session_id=session_id,
                tools_used=[]
            )

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="请求超时，请重试")
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
