"""
商品链接分析工具

通过AI分析商品链接，提取关键信息
支持：1688、淘宝、天猫、京东、拼多多等平台
"""
from langchain.tools import tool
from coze_coding_utils.log.write_log import request_context
from coze_coding_utils.runtime_ctx.context import new_context
import re
from typing import Optional

# 平台识别规则
PLATFORM_PATTERNS = {
    "1688": r"1688\.com",
    "淘宝": r"taobao\.com",
    "天猫": r"tmall\.com",
    "京东": r"jd\.com",
    "拼多多": r"pinduoduo\.com|yangkeduo\.com",
    "Shopee": r"shopee\.",
    "Lazada": r"lazada\.",
    "Amazon": r"amazon\.com|amazon\.cn"
}

@tool
def analyze_product_link(product_link: str) -> str:
    """
    分析商品链接，识别平台并提取关键信息

    Args:
        product_link: 商品链接URL

    Returns:
        包含平台识别和关键信息的分析结果
    """
    ctx = request_context.get() or new_context(method="analyze_product_link")

    if not product_link:
        return "请提供商品链接"

    # 识别平台
    platform = "未知平台"
    for name, pattern in PLATFORM_PATTERNS.items():
        if re.search(pattern, product_link, re.IGNORECASE):
            platform = name
            break

    # 提取商品ID（简化版本，各平台规则不同）
    product_id = None
    if platform == "淘宝" or platform == "天猫":
        match = re.search(r"id=(\d+)", product_link)
        if match:
            product_id = match.group(1)
    elif platform == "京东":
        match = re.search(r"/(\d+)\.html", product_link)
        if match:
            product_id = match.group(1)
    elif platform == "拼多多":
        match = re.search(r"goods_id=(\d+)", product_link)
        if match:
            product_id = match.group(1)

    # 生成分析报告
    result = f"""
📦 商品链接分析结果
━━━━━━━━━━━━━━━━━━━━━━━━

🔗 原始链接：{product_link}
🏪 识别平台：{platform}
🆔 商品ID：{product_id or '无法识别'}

💡 采集建议：
由于各电商平台的反爬机制较严格，建议采用以下方式获取商品信息：

1. **手动采集**（推荐）：
   - 打开商品链接
   - 截图商品主图和详情
   - 复制商品标题、价格、销量等信息
   - 使用AI工具整理和分析

2. **使用官方API**（如有权限）：
   - 申请平台开放平台权限
   - 使用官方API获取数据

3. **第三方数据服务**：
   - 使用火山引擎数据服务
   - 使用聚合数据等服务

📋 你现在可以：
- 发送商品截图，我会帮你分析
- 发送商品信息（标题、价格等），我会帮你整理
- 发送竞品链接，我会帮你对比分析
    """

    return result.strip()


@tool
def extract_product_info_from_text(text: str) -> str:
    """
    从文本中提取商品关键信息

    Args:
        text: 包含商品信息的文本

    Returns:
        结构化的商品信息
    """
    ctx = request_context.get() or new_context(method="extract_product_info_from_text")

    if not text:
        return "请提供商品信息"

    # 使用AI提取关键信息（实际使用时需要调用LLM）
    result = f"""
📦 商品信息提取结果
━━━━━━━━━━━━━━━━━━━━━━━━

📝 原始信息：
{text}

📊 提取建议：
为了更准确地提取商品信息，建议提供以下格式：

标题：商品标题
价格：¥XX.XX
销量：XX件
库存：XX件
规格：规格信息
店铺：店铺名称

我会帮你整理成标准的商品数据格式！
    """

    return result.strip()
