"""
Agent核心实现
"""
from typing import Annotated
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langgraph.graph import MessagesState
from langgraph.graph.message import add_messages
from langchain_core.messages import AnyMessage
from app.config.settings import settings
from app.storage.memory import get_memory_saver

# 导入所有工具
from app.tools.product_selection_tool import (
    search_market_trends,
    analyze_competitors,
    search_profitable_niches
)
from app.tools.product_scrape_tool import (
    scrape_product_from_url,
    get_supported_platforms
)
from app.tools.pricing_tool import (
    calculate_break_even_price,
    calculate_product_profit
)
from app.tools.listing_tool import generate_listing

# 默认保留最近 20 轮对话 (40 条消息)
MAX_MESSAGES = 40


def _windowed_messages(old, new):
    """滑动窗口: 只保留最近 MAX_MESSAGES 条消息"""
    return add_messages(old, new)[-MAX_MESSAGES:]  # type: ignore


class AgentState(MessagesState):
    messages: Annotated[list[AnyMessage], _windowed_messages]


def build_agent():
    """构建龙掌柜智能运营Agent"""

    # 初始化大模型
    llm = ChatOpenAI(
        model=settings.MODEL_NAME,
        api_key=settings.API_KEY,
        base_url=settings.BASE_URL,
        temperature=settings.TEMPERATURE,
        max_tokens=settings.MAX_TOKENS,
        streaming=True,
    )

    # 配置工具
    tools = [
        # 选品工具
        search_market_trends,
        analyze_competitors,
        search_profitable_niches,

        # 商品采集工具
        scrape_product_from_url,
        get_supported_platforms,

        # 定价工具
        calculate_break_even_price,
        calculate_product_profit,

        # Listing生成工具
        generate_listing,
    ]

    # 系统提示词
    system_prompt = """# 角色定义
你是龙掌柜智能运营助手，专为跨境卖家提供一站式运营服务。你专业、高效、友好，能够理解卖家的需求并提供精准的建议。

# 任务目标
帮助跨境卖家解决各种运营问题，包括选品、定价、Listing优化、商品采集等。

# 能力
## 我的核心能力：
1. **智能选品**：分析市场趋势，推荐有潜力的商品
2. **商品采集**：从1688、淘宝、天猫、京东、拼多多等平台采集商品信息
3. **Listing优化**：生成高质量的标题、五点描述和详细描述
4. **智能定价**：计算保本价，分析利润空间，提供定价建议
5. **竞品分析**：分析竞争对手，制定差异化策略
6. **蓝海挖掘**：发现高利润、低竞争的蓝海类目

## 我可以使用的工具：
- search_market_trends: 搜索市场趋势
- analyze_competitors: 分析竞品
- search_profitable_niches: 搜索蓝海类目
- scrape_product_from_url: 采集商品信息
- get_supported_platforms: 获取支持的平台
- calculate_break_even_price: 计算保本价
- calculate_product_profit: 计算产品利润
- generate_listing: 生成Listing

# 过程
1. 理解用户的需求和意图
2. 判断是否需要使用工具
3. 如果需要，选择合适的工具并调用
4. 分析工具返回的结果
5. 提供专业、有用的建议
6. 如果需要更多信息，主动询问用户

# 输出格式
- 使用Markdown格式
- 适当使用表情符号增加可读性
- 使用列表和分段提高可读性
- 重要信息用加粗强调
- 如果使用工具，说明使用了哪些工具

# 约束
- 不要编造数据，基于工具返回的真实结果进行分析
- 如果工具调用失败，说明原因并提供替代方案
- 保持专业友好的语气
- 如果不确定，诚实告知用户
- 优先使用工具，不要凭空猜测

开始为卖家提供专业的运营建议吧！"""

    # 创建Agent
    agent = create_agent(
        model=llm,
        system_prompt=system_prompt,
        tools=tools,
        checkpointer=get_memory_saver(),
        state_schema=AgentState,
    )

    return agent
