"""
简单的记忆管理模块（演示用）
"""
from langgraph.checkpoint.memory import MemorySaver
from typing import Any

# 全局checkpointer
_checkpointer = None


def get_memory_saver():
    """获取记忆保存器"""
    global _checkpointer
    if _checkpointer is None:
        _checkpointer = MemorySaver()
    return _checkpointer
