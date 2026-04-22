"""
定价工具
"""
from langchain.tools import tool
import json


@tool
def calculate_break_even_price(
    cost_price: float,
    shipping_cost: float,
    platform_commission: float,
    advertising_cost: float
) -> str:
    """计算保本价格
    
    Args:
        cost_price: 供货成本
        shipping_cost: 运费成本
        platform_commission: 平台佣金（百分比，如5表示5%）
        advertising_cost: 广告费用
    
    Returns:
        保本价格和定价建议
    """
    # 计算保本价
    # 保本价 = (成本 + 运费 + 广告费) / (1 - 佣金率)
    commission_rate = platform_commission / 100
    break_even = (cost_price + shipping_cost + advertising_cost) / (1 - commission_rate)
    
    # 计算不同利润率下的定价
    pricing_options = {
        "保本价": {
            "price": round(break_even, 2),
            "profit": 0,
            "profit_margin": 0
        },
        "保守定价（10%利润）": {
            "price": round(break_even * 1.1, 2),
            "profit": round(break_even * 0.1, 2),
            "profit_margin": 10
        },
        "平衡定价（20%利润）": {
            "price": round(break_even * 1.2, 2),
            "profit": round(break_even * 0.2, 2),
            "profit_margin": 20
        },
        "激进定价（30%利润）": {
            "price": round(break_even * 1.3, 2),
            "profit": round(break_even * 0.3, 2),
            "profit_margin": 30
        }
    }
    
    # 成本分析
    cost_analysis = {
        "供货成本": cost_price,
        "运费成本": shipping_cost,
        "平台佣金": f"{platform_commission}%",
        "广告费用": advertising_cost,
        "总成本": cost_price + shipping_cost + advertising_cost
    }
    
    result = "## 定价分析\n\n"
    result += "### 成本构成\n"
    for key, value in cost_analysis.items():
        result += f"- {key}: {value}\n"
    
    result += "\n### 保本价\n"
    result += f"**¥{break_even:.2f}**\n\n"
    
    result += "### 定价方案\n"
    for name, option in pricing_options.items():
        result += f"\n#### {name}\n"
        result += f"- **售价**: ¥{option['price']}\n"
        result += f"- **利润**: ¥{option['profit']}\n"
        result += f"- **利润率**: {option['profit_margin']}%\n"
    
    return result


@tool
def calculate_product_profit(
    selling_price: float,
    cost_price: float,
    shipping_cost: float,
    platform_commission: float,
    advertising_cost: float
) -> str:
    """计算产品利润
    
    Args:
        selling_price: 销售价格
        cost_price: 供货成本
        shipping_cost: 运费成本
        platform_commission: 平台佣金（百分比）
        advertising_cost: 广告费用
    
    Returns:
        利润分析
    """
    # 计算平台佣金
    commission = selling_price * (platform_commission / 100)
    
    # 计算总成本
    total_cost = cost_price + shipping_cost + commission + advertising_cost
    
    # 计算利润
    profit = selling_price - total_cost
    profit_margin = (profit / selling_price * 100) if selling_price > 0 else 0
    
    # 判断盈利情况
    if profit > 0:
        status = "✅ 盈利"
        status_color = "green"
    elif profit == 0:
        status = "⚪ 保本"
        status_color = "gray"
    else:
        status = "❌ 亏损"
        status_color = "red"
    
    result = f"## 利润计算\n\n"
    result += f"### 销售信息\n"
    result += f"- **销售价格**: ¥{selling_price:.2f}\n\n"
    
    result += f"### 成本明细\n"
    result += f"- 供货成本: ¥{cost_price:.2f}\n"
    result += f"- 运费成本: ¥{shipping_cost:.2f}\n"
    result += f"- 平台佣金 ({platform_commission}%): ¥{commission:.2f}\n"
    result += f"- 广告费用: ¥{advertising_cost:.2f}\n"
    result += f"- **总成本**: ¥{total_cost:.2f}\n\n"
    
    result += f"### 利润分析\n"
    result += f"**状态**: {status}\n"
    result += f"- **利润**: ¥{profit:.2f}\n"
    result += f"- **利润率**: {profit_margin:.2f}%\n"
    
    # 给出建议
    if profit < 0:
        result += f"\n### 💡 优化建议\n"
        result += "当前定价会导致亏损，建议：\n"
        result += "1. 提高销售价格\n"
        result += "2. 降低供货成本\n"
        result += "3. 优化运费方案\n"
        result += "4. 减少广告投入\n"
    elif profit_margin < 10:
        result += f"\n### 💡 优化建议\n"
        result += "当前利润率较低，建议：\n"
        result += "1. 适当提价\n"
        result += "2. 提升产品附加值\n"
        result += "3. 优化运营成本\n"
    else:
        result += f"\n### ✅ 结论\n"
        result += "定价合理，利润空间健康！\n"
    
    return result
