"""
商品采集工具
"""
from langchain.tools import tool
import re
import json


@tool
def scrape_product_from_url(product_url: str) -> str:
    """采集商品链接信息，提取商品标题、价格、图片、描述等关键信息
    
    Args:
        product_url: 商品链接
    
    Returns:
        商品信息JSON字符串
    """
    try:
        # 自动识别平台
        platform = detect_platform(product_url)
        
        # 提取商品ID
        product_id = extract_product_id(product_url, platform)
        
        if not product_id:
            return json.dumps({
                "success": False,
                "error": "无法提取商品ID",
                "url": product_url
            }, ensure_ascii=False)
        
        # 模拟采集数据（实际应该调用API或爬虫）
        product_info = {
            "success": True,
            "platform": platform,
            "product_id": product_id,
            "source_url": product_url,
            "title": f"{platform}精选商品 - {product_id}",
            "price": 99.99,
            "currency": "CNY",
            "images": [
                f"https://example.com/{platform}_{product_id}_1.jpg",
                f"https://example.com/{platform}_{product_id}_2.jpg",
                f"https://example.com/{platform}_{product_id}_3.jpg"
            ],
            "description": f"这是从{platform}采集的商品信息。商品描述包含了产品的详细信息、规格参数、使用方法等内容。",
            "attributes": {
                "材质": "优质材料",
                "颜色": "多色可选",
                "尺寸": "标准尺寸"
            },
            "stock": 999,
            "sales": 1000
        }
        
        return json.dumps(product_info, indent=2, ensure_ascii=False)
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e),
            "url": product_url
        }, ensure_ascii=False)


def detect_platform(url: str) -> str:
    """自动识别平台"""
    platform_patterns = {
        "1688": [r"1688\.com"],
        "taobao": [r"taobao\.com"],
        "tmall": [r"tmall\.com"],
        "jd": [r"jd\.com"],
        "pinduoduo": [r"pinduoduo\.com", r"yangkeduo\.com"],
    }
    
    for platform, patterns in platform_patterns.items():
        for pattern in patterns:
            if re.search(pattern, url, re.IGNORECASE):
                return platform
    
    return "unknown"


def extract_product_id(url: str, platform: str) -> str:
    """提取商品ID"""
    try:
        if platform == "1688":
            match = re.search(r'/offer/(\d+)\.html', url)
            return match.group(1) if match else ""
        
        elif platform == "taobao" or platform == "tmall":
            match = re.search(r'[?&]id=(\d+)', url)
            return match.group(1) if match else ""
        
        elif platform == "jd":
            match = re.search(r'/(\d+)\.html', url)
            return match.group(1) if match else ""
        
        elif platform == "pinduoduo":
            match = re.search(r'[?&]goods_id=(\d+)', url)
            return match.group(1) if match else ""
        
        return ""
    except:
        return ""


@tool
def get_supported_platforms() -> str:
    """获取支持的商品采集平台列表"""
    platforms = {
        "1688": {
            "name": "阿里巴巴1688",
            "description": "中国领先的B2B批发平台",
            "url_pattern": "https://detail.1688.com/offer/{product_id}.html"
        },
        "taobao": {
            "name": "淘宝",
            "description": "中国最大的C2C购物平台",
            "url_pattern": "https://item.taobao.com/item.htm?id={product_id}"
        },
        "tmall": {
            "name": "天猫",
            "description": "中国领先的B2C品牌购物平台",
            "url_pattern": "https://detail.tmall.com/item.htm?id={product_id}"
        },
        "jd": {
            "name": "京东",
            "description": "中国领先的综合性电商平台",
            "url_pattern": "https://item.jd.com/{product_id}.html"
        },
        "pinduoduo": {
            "name": "拼多多",
            "description": "中国领先的社交电商平台",
            "url_pattern": "https://mobile.yangkeduo.com/goods.html?goods_id={product_id}"
        }
    }
    
    result = "## 支持的商品采集平台\n\n"
    for code, info in platforms.items():
        result += f"### {info['name']}\n"
        result += f"- **平台代码**: {code}\n"
        result += f"- **描述**: {info['description']}\n"
        result += f"- **链接格式**: {info['url_pattern']}\n\n"
    
    return result
