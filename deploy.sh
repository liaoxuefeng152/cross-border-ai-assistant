#!/bin/bash

# 龙掌柜智能运营助手 - Docker 部署脚本

set -e

echo "========================================="
echo "  龙掌柜智能运营助手 Docker 部署工具"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: Docker Compose 未安装${NC}"
    echo "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# 检查 .env 文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}警告: .env 文件不存在${NC}"
    echo "正在从 .env.example 创建 .env 文件..."
    cp .env.example .env
    echo -e "${GREEN}已创建 .env 文件${NC}"
    echo ""
    echo -e "${YELLOW}请编辑 .env 文件，配置你的 API Key${NC}"
    echo "nano .env  # 或 vim .env"
    echo ""
    read -p "按 Enter 继续..."
fi

# 菜单
echo "请选择操作:"
echo "1) 构建并启动服务（开发环境）"
echo "2) 构建并启动服务（生产环境）"
echo "3) 停止服务"
echo "4) 重启服务"
echo "5) 查看日志"
echo "6) 清理所有数据（谨慎使用）"
echo "7) 退出"
echo ""
read -p "请输入选项 [1-7]: " choice

case $choice in
    1)
        echo -e "${GREEN}构建并启动服务（开发环境）...${NC}"
        docker-compose up -d --build
        echo -e "${GREEN}服务已启动！${NC}"
        echo ""
        echo "访问地址:"
        echo "  前端: http://localhost:8080"
        echo "  后端: http://localhost:8000"
        echo "  API文档: http://localhost:8000/docs"
        ;;
    2)
        echo -e "${GREEN}构建并启动服务（生产环境）...${NC}"
        docker-compose -f docker-compose.prod.yml up -d --build
        echo -e "${GREEN}服务已启动！${NC}"
        echo ""
        echo "访问地址:"
        echo "  前端: http://localhost:8080"
        echo "  后端: http://localhost:8000"
        echo "  API文档: http://localhost:8000/docs"
        ;;
    3)
        echo -e "${YELLOW}停止服务...${NC}"
        docker-compose down
        echo -e "${GREEN}服务已停止${NC}"
        ;;
    4)
        echo -e "${YELLOW}重启服务...${NC}"
        docker-compose restart
        echo -e "${GREEN}服务已重启${NC}"
        ;;
    5)
        echo -e "${YELLOW}查看日志...${NC}"
        docker-compose logs -f
        ;;
    6)
        echo -e "${RED}警告: 这将删除所有容器、镜像和数据！${NC}"
        read -p "确定要继续吗？(yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            docker-compose down -v --rmi all
            echo -e "${GREEN}已清理所有数据${NC}"
        else
            echo "已取消"
        fi
        ;;
    7)
        echo "退出"
        exit 0
        ;;
    *)
        echo -e "${RED}无效选项${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}完成！${NC}"
