# 飞书机器人对接完整指南

## 目录
- [一、准备工作](#一准备工作)
- [二、创建飞书应用](#二创建飞书应用)
- [三、配置应用权限](#三配置应用权限)
- [四、配置事件订阅](#四配置事件订阅)
- [五、代码实现](#五代码实现)
- [六、启动服务](#六启动服务)
- [七、测试验证](#七测试验证)
- [八、常见问题](#八常见问题)

---

## 一、准备工作

### 1.1 必需信息
在开始之前，请确保你已准备好以下信息：
- **APP ID**：飞书应用的唯一标识
- **App Secret**：应用密钥
- **Verification Token**：验证令牌
- **Encrypt Key**：加密密钥（可选）

### 1.2 环境要求
- Python 3.8+
- 已安装依赖包：`requests`, `langchain`, `langgraph`, `langchain-openai`

---

## 二、创建飞书应用

### 2.1 访问飞书开放平台
打开浏览器，访问：https://open.feishu.cn/

### 2.2 创建应用
1. 点击右上角"创建企业自建应用"
2. 填写应用名称（如：跨境电商AI图片助手）
3. 上传应用图标
4. 选择应用所属企业
5. 点击"创建"

### 2.3 获取凭证信息
创建成功后，在应用详情页找到以下信息并保存：
```
APP ID: cli_a96a7376093a9cb3
App Secret: ReRKKCPDBW3M1SiDVZBcQhHhgzHDH2mO
Verification Token: S1MQudLYgMieFnbu07LvkffMTBkr5Ccu
```

---

## 三、配置应用权限

### 3.1 开通机器人能力
1. 在左侧导航栏点击"权限管理"
2. 搜索并开通以下权限：
   - `im:chat`（获取群组信息）
   - `im:chat:group:msg`（在群组中发送消息）
   - `im:message`（接收和发送消息）
   - `im:message:group_at_msg`（接收群组@消息）

### 3.2 配置消息接收
1. 点击左侧"事件订阅"
2. 配置订阅事件（详见下文"四、配置事件订阅"）

---

## 四、配置事件订阅

### 4.1 启动本地服务并创建公网地址

#### 方案一：使用内网穿透工具（推荐）
```bash
# 方法1：使用localtunnel
npx localtunnel --port 5000

# 方法2：使用ngrok
ngrok http 5000
```

服务启动后会获得一个公网地址，例如：
```
https://twelve-islands-send.loca.lt
```

#### 方案二：部署到公网服务器
将服务部署到有公网IP的服务器上，使用服务器的域名或IP。

### 4.2 配置飞书事件订阅

1. 在飞书开放平台，进入"事件订阅"页面
2. 在"请求地址"输入框中填入：
   ```
   https://your-public-domain.com/feishu/events
   ```
   注意：`your-public-domain.com` 替换为你实际的公网地址

3. 勾选需要订阅的事件类型：
   - ✅ `im.message.receive_v1`：接收消息事件

4. 点击"保存"进行验证
   - 飞书会向你的地址发送一个URL验证请求
   - 你的服务需要返回正确的响应（见下方代码实现）

5. 验证成功后，事件订阅状态变为"已启用"

---

## 五、代码实现

### 5.1 创建飞书配置文件
创建 `src/config/feishu_config.py`：

```python
"""飞书机器人配置"""
FEISHU_CONFIG = {
    "app_id": "cli_a96a7376093a9cb3",
    "app_secret": "ReRKKCPDBW3M1SiDVZBcQhHhgzHDH2mO",
    "verification_token": "S1MQudLYgMieFnbu07LvkffMTBkr5Ccu",
    "encrypt_key": "",  # 可选，如果未启用加密则留空
}

# 飞书API基础URL
FEISHU_API_BASE_URL = "https://open.feishu.cn/open-apis"
```

### 5.2 创建飞书消息工具
创建 `src/tools/feishu_message_tool.py`：

```python
"""飞书消息发送工具"""
import requests
import json
from typing import Optional, List, Dict
from langchain.tools import tool
from src.config.feishu_config import FEISHU_CONFIG, FEISHU_API_BASE_URL


def get_tenant_access_token():
    """获取租户访问令牌"""
    url = f"{FEISHU_API_BASE_URL}/auth/v3/tenant_access_token/internal"
    headers = {"Content-Type": "application/json; charset=utf-8"}
    data = {
        "app_id": FEISHU_CONFIG["app_id"],
        "app_secret": FEISHU_CONFIG["app_secret"]
    }

    response = requests.post(url, headers=headers, json=data)
    result = response.json()

    if result.get("code") != 0:
        raise Exception(f"获取租户访问令牌失败: {result.get('msg')}")

    return result.get("tenant_access_token")


@tool
def send_feishu_message(
    receiver: str,
    content: str,
    msg_type: str = "text"
) -> str:
    """
    发送飞书消息

    Args:
        receiver: 接收者ID（open_id或chat_id）
        content: 消息内容
        msg_type: 消息类型（text/text/image）

    Returns:
        发送结果
    """
    token = get_tenant_access_token()

    url = f"{FEISHU_API_BASE_URL}/im/v1/messages?receive_id_type={receiver[:2] == 'oc' and 'open_id' or 'chat_id'}"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8"
    }

    data = {
        "receive_id": receiver,
        "msg_type": msg_type,
        "content": json.dumps({"text": content})
    }

    response = requests.post(url, headers=headers, json=data)
    result = response.json()

    if result.get("code") != 0:
        return f"❌ 发送失败: {result.get('msg')}"

    return "✅ 消息发送成功"


@tool
def send_feishu_card(
    receiver: str,
    title: str,
    content: str,
    buttons: Optional[List[Dict]] = None
) -> str:
    """
    发送飞书卡片消息

    Args:
        receiver: 接收者ID
        title: 卡片标题
        content: 卡片内容
        buttons: 按钮列表（可选）

    Returns:
        发送结果
    """
    token = get_tenant_access_token()

    url = f"{FEISHU_API_BASE_URL}/im/v1/messages?receive_id_type=open_id"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8"
    }

    card_content = {
        "config": {
            "wide_screen_mode": True
        },
        "header": {
            "title": {
                "content": title,
                "tag": "plain_text"
            }
        },
        "elements": [
            {
                "tag": "div",
                "text": {
                    "content": content,
                    "tag": "lark_md"
                }
            }
        ]
    }

    if buttons:
        card_content["elements"].append({
            "tag": "action",
            "actions": buttons
        })

    data = {
        "receive_id": receiver,
        "msg_type": "interactive",
        "content": json.dumps(card_content)
    }

    response = requests.post(url, headers=headers, json=data)
    result = response.json()

    if result.get("code") != 0:
        return f"❌ 卡片发送失败: {result.get('msg')}"

    return "✅ 卡片发送成功"
```

### 5.3 创建飞书机器人服务
创建 `src/feishu_bot_server.py`：

```python
"""飞书机器人事件接收服务"""
import json
import hmac
import hashlib
import base64
from flask import Flask, request, jsonify
from typing import Optional
from src.config.feishu_config import FEISHU_CONFIG
from src.agents.agent import build_agent
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
        import requests

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
    print(f"监听地址: http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### 5.4 将工具集成到Agent
在 `src/agents/agent.py` 中导入并添加工具：

```python
# 导入工具
from tools.feishu_message_tool import send_feishu_message, send_feishu_card

# 在build_agent函数中添加到tools列表
tools = [
    # ... 其他工具
    send_feishu_message,
    send_feishu_card,
]
```

---

## 六、启动服务

### 6.1 安装依赖
```bash
uv add flask requests
```

### 6.2 启动本地服务
```bash
python src/feishu_bot_server.py
```

服务将在 `http://0.0.0.0:5000` 启动

### 6.3 创建公网地址
```bash
# 使用localtunnel
npx localtunnel --port 5000

# 或使用ngrok
ngrok http 5000
```

记录生成的公网地址，例如：
```
https://twelve-islands-send.loca.lt
```

---

## 七、测试验证

### 7.1 健康检查
访问：`https://your-public-domain.com/health`
预期返回：
```json
{
  "status": "ok",
  "service": "feishu_bot"
}
```

### 7.2 配置事件订阅
在飞书开放平台配置事件订阅：
- 请求地址：`https://your-public-domain.com/feishu/events`
- 勾选事件：`im.message.receive_v1`

点击保存，等待验证通过。

### 7.3 测试机器人

#### 在群组中测试
1. 将机器人添加到群组
2. 在群组中@机器人，发送消息："你好"
3. 等待机器人回复

#### 在个人聊天中测试
1. 在飞书中搜索机器人应用
2. 点击进入个人聊天
3. 发送消息："你好"
4. 等待机器人回复

### 7.4 检查日志
查看服务日志，确认：
- ✅ 收到事件请求
- ✅ 签名验证通过
- ✅ 提取到用户消息
- ✅ Agent成功调用
- ✅ 回复消息发送成功

---

## 八、常见问题

### Q1: 事件订阅验证失败
**现象**：配置事件订阅时提示验证失败

**解决方案**：
1. 检查公网地址是否可访问
2. 检查服务是否正常运行：`curl https://your-public-domain.com/health`
3. 检查签名验证逻辑是否正确
4. 查看服务日志，确认收到验证请求

### Q2: 机器人不回复消息
**现象**：在飞书中发送消息后机器人没有回复

**排查步骤**：
1. 检查是否@机器人（群组消息必须@机器人）
2. 检查服务日志，确认是否收到消息事件
3. 检查消息内容是否为空
4. 检查Agent是否正常调用
5. 检查发送消息的API调用是否成功

### Q3: 机器人重复回复
**现象**：发送一条消息，机器人回复多次

**解决方案**：
- 添加事件去重逻辑（使用`processed_event_ids`集合）
- 确保事件ID的唯一性

### Q4: 回复发到私聊而非群组
**现象**：在群组中@机器人，回复却发到私聊

**解决方案**：
- 检查消息类型判断逻辑：`chat_type == "group"`
- 群组消息使用`chat_id`回复，个人消息使用`open_id`回复
- 确认`receive_id_type`参数正确

### Q5: localtunnel 503错误
**现象**：使用localtunnel时出现503错误

**解决方案**：
```bash
# 重启localtunnel服务
pkill -f "lt --port 5000"
npx localtunnel --port 5000

# 或尝试其他端口
npx localtunnel --port 5001
```

### Q6: Agent调用报错
**现象**：处理消息时报错

**解决方案**：
1. 检查Agent配置文件是否存在
2. 检查模型配置是否正确
3. 检查API Key是否配置
4. 查看完整错误堆栈进行定位

### Q7: 权限不足
**现象**：发送消息时报权限不足错误

**解决方案**：
1. 检查应用是否开通了相关权限：
   - `im:chat`
   - `im:chat:group:msg`
   - `im:message`
   - `im:message:group_at_msg`
2. 发布应用权限配置
3. 重新获取access token

---

## 附录

### A. 完整目录结构
```
.
├── src
│   ├── agents
│   │   └── agent.py              # Agent主逻辑
│   ├── tools
│   │   └── feishu_message_tool.py # 飞书消息工具
│   ├── config
│   │   └── feishu_config.py      # 飞书配置
│   └── feishu_bot_server.py      # 飞书机器人服务
├── config
│   └── agent_llm_config.json     # Agent配置
└── pyproject.toml                # 项目配置
```

### B. 常用API端点
```
获取访问令牌：https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal
发送消息：https://open.feishu.cn/open-apis/im/v1/messages
获取用户信息：https://open.feishu.cn/open-apis/contact/v3/users/:user_id
```

### C. 参考文档
- [飞书开放平台文档](https://open.feishu.cn/document/)
- [事件订阅说明](https://open.feishu.cn/document/common-capabilities/message-push/event-subscription-guide)
- [发送消息接口](https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot)

---

## 总结

完成以上步骤后，你将成功对接飞书机器人，具备以下能力：
- ✅ 接收群组和私聊消息
- ✅ 使用Agent处理用户请求
- ✅ 将回复发送到飞书
- ✅ 支持文本、富文本、卡片等多种消息格式

祝你对接顺利！🎉
