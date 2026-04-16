"""飞书机器人事件接收服务"""
import json
import hmac
import hashlib
import base64
from flask import Flask, request, jsonify
from typing import Optional
from config.feishu_config import FEISHU_CONFIG
from agents.agent import build_agent
from langchain_core.messages import HumanMessage, AIMessage

app = Flask(__name__)

# 存储已处理的事件ID，防止重复处理
processed_event_ids = set()


def verify_signature(timestamp: str, nonce: str, body: str, signature: str) -> bool:
    """验证请求签名"""
    token = FEISHU_CONFIG["verification_token"]
    sign_str = f"{timestamp}{nonce}{token}"
    sign_bytes = sign_str.encode('utf-8')
    sha256 = hashlib.sha256()
    sha256.update(sign_bytes)
    digest = sha256.digest()
    b64_digest = base64.b64encode(digest).decode('utf-8')
    return b64_digest == signature


def get_user_content(event_data: dict) -> Optional[str]:
    """从事件数据中提取用户消息内容"""
    try:
        # 获取消息内容
        message = event_data.get("message", {})
        content = message.get("content", "")

        # content是JSON字符串，需要解析
        content_dict = json.loads(content)

        # 提取文本内容
        text = content_dict.get("text", "")

        # 去除@机器人的部分
        if "@" in text:
            text = text.split(">", maxsplit=1)[-1].strip()

        return text if text else None
    except Exception as e:
        print(f"提取用户消息失败: {e}")
        return None


def process_message(event_data: dict):
    """处理接收到的消息"""
    try:
        # 1. 提取消息内容
        user_message = get_user_content(event_data)
        if not user_message:
            print("消息内容为空，跳过处理")
            return

        print(f"收到用户消息: {user_message}")

        # 2. 获取接收者信息
        sender = event_data.get("sender", {})
        open_id = sender.get("sender_id", {}).get("open_id", "")
        chat_id = event_data.get("chat_id", "")

        # 3. 判断消息类型（群组消息还是个人消息）
        chat_type = event_data.get("chat_type", "")
        is_group_message = (chat_type == "group")

        # 4. 生成唯一的thread_id（用于会话记忆）
        if is_group_message:
            thread_id = chat_id
        else:
            thread_id = open_id

        print(f"消息类型: {'群组' if is_group_message else '个人'}, thread_id: {thread_id}")

        # 5. 构建Agent并调用
        agent = build_agent()
        result = agent.invoke(
            {"messages": [HumanMessage(content=user_message)]},
            config={"configurable": {"thread_id": thread_id}}
        )

        # 6. 提取回复内容
        messages = result.get("messages", [])
        ai_messages = [msg for msg in messages if isinstance(msg, AIMessage)]

        if not ai_messages:
            print("Agent未返回消息")
            return

        # 获取最后一条AI消息
        last_ai_message = ai_messages[-1]
        reply_content = last_ai_message.content

        print(f"Agent回复: {reply_content}")

        # 7. 发送回复消息
        # 群组消息使用chat_id回复，个人消息使用open_id回复
        receiver_id = chat_id if is_group_message else open_id

        from tools.feishu_message_tool import get_tenant_access_token

        token = get_tenant_access_token()
        receiver_type = "chat_id" if is_group_message else "open_id"

        url = f"https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type={receiver_type}"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8"
        }

        data = {
            "receive_id": receiver_id,
            "msg_type": "text",
            "content": json.dumps({"text": reply_content})
        }

        response = requests.post(url, headers=headers, json=data)
        result = response.json()

        if result.get("code") != 0:
            print(f"发送消息失败: {result.get('msg')}")
        else:
            print("消息发送成功")

    except Exception as e:
        print(f"处理消息时出错: {e}")
        import traceback
        traceback.print_exc()


@app.route('/feishu/events', methods=['POST'])
def handle_events():
    """处理飞书事件"""
    try:
        # 1. 获取请求参数
        timestamp = request.headers.get('X-Lark-Request-Timestamp', '')
        nonce = request.headers.get('X-Lark-Request-Nonce', '')
        signature = request.headers.get('X-Lark-Signature', '')

        body = request.get_data(as_text=True)
        print(f"收到事件: {body}")

        # 2. 验证签名
        if not verify_signature(timestamp, nonce, body, signature):
            print("签名验证失败")
            return jsonify({"code": 1, "msg": "签名验证失败"}), 401

        # 3. 解析JSON数据
        data = json.loads(body)
        challenge = data.get("challenge", "")

        # 4. 如果是URL验证请求，直接返回challenge
        if "url_verification" in data.get("type", ""):
            print("收到URL验证请求")
            return jsonify({"challenge": challenge})

        # 5. 如果是事件推送，处理事件
        if "event" in data:
            event = data.get("event", {})
            event_type = event.get("type", "")

            # 6. 获取事件ID，防止重复处理
            event_id = data.get("uuid", "")
            if event_id in processed_event_ids:
                print(f"事件已处理过，跳过: {event_id}")
                return jsonify({"code": 0, "msg": "success"})

            processed_event_ids.add(event_id)
            print(f"新事件: {event_type}, 事件ID: {event_id}")

            # 7. 处理消息接收事件
            if event_type == "im.message.receive_v1":
                print("收到消息事件")
                process_message(event)
            else:
                print(f"未处理的事件类型: {event_type}")

        return jsonify({"code": 0, "msg": "success"})

    except Exception as e:
        print(f"处理事件时出错: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"code": 1, "msg": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({"status": "ok", "service": "feishu_bot"})


if __name__ == '__main__':
    print("飞书机器人服务启动中...")
    print(f"监听地址: http://0.0.0.0:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
