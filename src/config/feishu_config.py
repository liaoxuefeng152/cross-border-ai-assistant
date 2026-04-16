"""飞书机器人配置"""
FEISHU_CONFIG = {
    "app_id": "cli_a96a4c1a8761dcca",
    "app_secret": "t8kleP5zldtVMbtLGfdtlbL33HkcfSmO",
    "verification_token": "O27ycYJ7tKlS6rGcbwo0OdYdxtQHi6La",
    "encrypt_key": "abc123456789",  # 用于签名验证
    "enable_signature_verification": False,  # 暂时禁用签名验证，待算法调试完成后启用
}

# 飞书API基础URL
FEISHU_API_BASE_URL = "https://open.feishu.cn/open-apis"
