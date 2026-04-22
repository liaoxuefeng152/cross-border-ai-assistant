"""
Listing生成工具
"""
from langchain.tools import tool


@tool
def generate_listing(
    product_name: str,
    platform: str,
    language: str = "中文"
) -> str:
    """生成商品Listing，包括标题、五点描述、详细描述
    
    Args:
        product_name: 商品名称
        platform: 目标平台（Shopee/Lazada/TikTok Shop/Amazon）
        language: 语言（中文/英文/印尼语/泰语/越南语/马来语）
    
    Returns:
        Listing内容
    """
    # 生成标题（包含关键词）
    title = generate_title(product_name, platform, language)
    
    # 生成五点描述
    bullet_points = generate_bullet_points(product_name, language)
    
    # 生成详细描述
    description = generate_description(product_name, language)
    
    result = f"## {platform} Listing生成\n\n"
    result += f"### 商品标题\n"
    result += f"```\n{title}\n```\n\n"
    
    result += f"### 五点描述\n"
    for i, point in enumerate(bullet_points, 1):
        result += f"{i}. {point}\n"
    result += "\n"
    
    result += f"### 详细描述\n"
    result += f"{description}\n\n"
    
    # SEO建议
    result += f"### SEO优化建议\n"
    result += f"- ✅ 标题包含核心关键词\n"
    result += f"- ✅ 五点描述突出产品卖点\n"
    result += f"- ✅ 详细描述结构清晰\n"
    result += f"- ✅ 适当使用表情符号\n"
    
    return result


def generate_title(product_name: str, platform: str, language: str) -> str:
    """生成标题"""
    templates = {
        "Shopee": {
            "中文": f"【正品】{product_name} 高品质 官方授权 全国包邮",
            "英文": f"Authentic {product_name} - High Quality - Official Store - Free Shipping"
        },
        "Lazada": {
            "中文": f"{product_name} | 热销 | 高品质 | 正品保证",
            "英文": f"{product_name} | Best Selling | Premium Quality | Authentic Guaranteed"
        },
        "TikTok Shop": {
            "中文": f"🔥{product_name}🔥 爆款推荐 好评如潮",
            "英文": f"🔥{product_name}🔥 Viral Product - Top Rated - Must Buy"
        },
        "Amazon": {
            "中文": f"{product_name} - [品牌名] - [颜色/尺寸] - 高质量",
            "英文": f"{product_name} - [Brand Name] - [Color/Size] - High Quality"
        }
    }
    
    return templates.get(platform, {}).get(language, f"{product_name} - 高品质 - 值得信赖")


def generate_bullet_points(product_name: str, language: str) -> list:
    """生成五点描述"""
    if language == "中文":
        return [
            f"✨ **高品质材质**: {product_name}采用优质材料制作，耐用性强",
            "🎯 **精工细作**: 每一个细节都经过精心打磨，品质保证",
            "💯 **正品保证**: 官方授权，正品保障，假一赔十",
            "🚀 **快速发货**: 48小时内发货，全国包邮",
            "🛡️ **售后无忧**: 7天无理由退换，一年质保"
        ]
    else:
        return [
            f"✨ **Premium Quality**: {product_name} made with high-quality materials",
            "🎯 **Expert Craftsmanship**: Every detail carefully crafted",
            "💯 **Authentic Guarantee**: Official authorization, quality assured",
            "🚀 **Fast Shipping**: Ships within 48 hours, free shipping",
            "🛡️ **Worry-Free Warranty**: 7-day returns, 1-year warranty"
        ]


def generate_description(product_name: str, language: str) -> str:
    """生成详细描述"""
    if language == "中文":
        return f"""## 产品介绍

{product_name}是我们的明星产品，深受消费者喜爱。

### 产品特点

- 🌟 **精选材料**: 采用行业领先的材料，确保产品品质
- 💎 **精工细作**: 每一道工序都经过严格的质量控制
- 🎨 **时尚设计**: 符合现代审美，彰显品味

### 为什么选择我们？

1. **品质保证**: 严格的质量管理体系
2. **价格实惠**: 直接从工厂到消费者，省去中间环节
3. **服务贴心**: 专业客服团队，7x24小时在线
4. **快速配送**: 多仓发货，极速送达

### 注意事项

- 请按照使用说明正确使用
- 如有疑问，请联系客服

## 购买须知

支持7天无理由退换，正品保障！"""
    else:
        return f"""## Product Description

{product_name} is our star product, loved by consumers.

### Product Features

- 🌟 **Premium Materials**: Uses industry-leading materials
- 💎 **Expert Craftsmanship**: Strict quality control for every process
- 🎨 **Stylish Design**: Modern aesthetics that showcase taste

### Why Choose Us?

1. **Quality Assurance**: Strict quality management system
2. **Affordable Price**: Direct from factory to consumer
3. **Caring Service**: Professional customer service, 24/7 online
4. **Fast Delivery**: Multiple warehouses, express shipping

### Important Notes

- Please follow the instructions for proper use
- Contact customer service if you have questions

## Purchase Information

7-day returns, authentic guaranteed!"""
