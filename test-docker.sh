#!/bin/bash

# 龙掌柜智能运营助手 - Docker 部署测试脚本

set -e

echo "========================================="
echo "  Docker 部署测试工具"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_case() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    TEST_NAME=$1
    TEST_COMMAND=$2

    echo -n "测试 $TOTAL_TESTS: $TEST_NAME ... "

    if eval "$TEST_COMMAND" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ 失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# 1. 检查 Docker 是否安装
echo "检查环境..."
test_case "Docker 已安装" "command -v docker"
test_case "Docker Compose 已安装" "docker-compose version"

# 2. 检查必需文件
echo ""
echo "检查文件..."
test_case ".env 文件存在" "test -f .env"
test_case "docker-compose.yml 存在" "test -f docker-compose.yml"
test_case "Dockerfile.backend 存在" "test -f Dockerfile.backend"
test_case "Dockerfile.frontend 存在" "test -f Dockerfile.frontend"

# 3. 检查容器状态
echo ""
echo "检查容器..."
test_case "后端容器正在运行" "docker ps | grep longzhang-backend"
test_case "前端容器正在运行" "docker ps | grep longzhang-frontend"

# 4. 检查服务健康状态
echo ""
echo "检查服务健康状态..."
test_case "后端健康检查通过" "curl -sf http://localhost:8000/health"
test_case "前端可访问" "curl -sf http://localhost:8080 > /dev/null"

# 5. 检查 API 端点
echo ""
echo "检查 API 端点..."
test_case "API 文档可访问" "curl -sf http://localhost:8000/docs"
test_case "聊天 API 可用" "curl -sf http://localhost:8000/api/v1/chat/health"

# 6. 测试聊天功能
echo ""
echo "测试聊天功能..."
TEST_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"测试","session_id":"test_docker"}' 2>/dev/null)

if echo "$TEST_RESPONSE" | grep -q '"message"'; then
    test_case "聊天 API 返回正确格式" "true"
else
    test_case "聊天 API 返回正确格式" "false"
fi

# 7. 检查环境变量
echo ""
echo "检查环境变量..."
test_case "API Key 已配置" "grep -q 'COZE_WORKLOAD_IDENTITY_API_KEY=' .env && ! grep -q 'COZE_WORKLOAD_IDENTITY_API_KEY=$' .env"

# 8. 检查日志
echo ""
echo "检查日志..."
test_case "后端日志无错误" "! docker-compose logs backend 2>&1 | grep -i 'error' | head -1"
test_case "前端日志无错误" "! docker-compose logs frontend 2>&1 | grep -i 'error' | head -1"

# 9. 资源使用检查
echo ""
echo "检查资源使用..."
BACKEND_MEM=$(docker stats longzhang-backend --no-stream --format "{{.MemUsage}}" 2>/dev/null || echo "0")
FRONTEND_MEM=$(docker stats longzhang-frontend --no-stream --format "{{.MemUsage}}" 2>/dev/null || echo "0")
echo "后端内存使用: $BACKEND_MEM"
echo "前端内存使用: $FRONTEND_MEM"

# 10. 网络检查
echo ""
echo "检查网络..."
test_case "Docker 网络存在" "docker network ls | grep longzhang-network"

# 输出结果
echo ""
echo "========================================="
echo "  测试结果"
echo "========================================="
echo "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ 所有测试通过！部署成功！${NC}"
    echo ""
    echo "访问地址:"
    echo "  前端: http://localhost:8080"
    echo "  后端: http://localhost:8000"
    echo "  API文档: http://localhost:8000/docs"
    exit 0
else
    echo ""
    echo -e "${RED}✗ 有 $FAILED_TESTS 个测试失败，请检查部署${NC}"
    exit 1
fi
