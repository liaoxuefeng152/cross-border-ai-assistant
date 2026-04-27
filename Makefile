.PHONY: help build up down restart logs ps clean dev prod test

# 默认目标
help:
	@echo "龙掌柜智能运营助手 - Docker 管理命令"
	@echo ""
	@echo "可用命令:"
	@echo "  make build       - 构建 Docker 镜像（开发环境）"
	@echo "  make build-prod  - 构建 Docker 镜像（生产环境）"
	@echo "  make up          - 启动服务（开发环境）"
	@echo "  make up-prod     - 启动服务（生产环境）"
	@echo "  make down        - 停止服务"
	@echo "  make restart     - 重启服务"
	@echo "  make logs        - 查看日志"
	@echo "  make logs-backend - 查看后端日志"
	@echo "  make logs-frontend - 查看前端日志"
	@echo "  make ps          - 查看服务状态"
	@echo "  make clean       - 清理未使用的 Docker 资源"
	@echo "  make test        - 运行测试"
	@echo "  make dev         - 开发模式启动（带挂载卷）"
	@echo "  make prod        - 生产模式启动"
	@echo "  make check       - 健康检查"

# 构建镜像（开发环境）
build:
	@echo "构建开发环境镜像..."
	docker-compose build

# 构建镜像（生产环境）
build-prod:
	@echo "构建生产环境镜像..."
	docker-compose -f docker-compose.prod.yml build

# 启动服务（开发环境）
up:
	@echo "启动开发环境服务..."
	docker-compose up -d
	@echo ""
	@echo "服务已启动:"
	@echo "  前端: http://localhost:8080"
	@echo "  后端: http://localhost:8000"
	@echo "  API文档: http://localhost:8000/docs"

# 启动服务（生产环境）
up-prod:
	@echo "启动生产环境服务..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo ""
	@echo "服务已启动:"
	@echo "  前端: http://localhost:8080"
	@echo "  后端: http://localhost:8000"

# 停止服务
down:
	@echo "停止服务..."
	docker-compose down

# 重启服务
restart:
	@echo "重启服务..."
	docker-compose restart

# 查看所有日志
logs:
	docker-compose logs -f

# 查看后端日志
logs-backend:
	docker-compose logs -f backend

# 查看前端日志
logs-frontend:
	docker-compose logs -f frontend

# 查看服务状态
ps:
	@echo "服务状态:"
	docker-compose ps

# 清理 Docker 资源
clean:
	@echo "清理未使用的 Docker 资源..."
	docker system prune -f
	@echo "清理完成"

# 深度清理（包括未使用的镜像）
clean-all:
	@echo "警告：这将删除所有未使用的镜像和容器！"
	@read -p "确定要继续吗？(yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker system prune -a -f; \
		echo "清理完成"; \
	else \
		echo "已取消"; \
	fi

# 开发模式启动（带挂载卷）
dev:
	@echo "开发模式启动..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo ""
	@echo "开发环境已启动"
	@echo "修改代码会自动重新加载"

# 生产模式启动
prod:
	@echo "生产模式启动..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo ""
	@echo "生产环境已启动"

# 健康检查
check:
	@echo "检查服务健康状态..."
	@echo ""
	@echo "后端健康检查:"
	@curl -sf http://localhost:8000/health && echo "  ✅ 后端正常" || echo "  ❌ 后端异常"
	@echo ""
	@echo "前端检查:"
	@curl -sf http://localhost:8080 > /dev/null && echo "  ✅ 前端正常" || echo "  ❌ 前端异常"

# 运行测试
test:
	@echo "运行测试..."
	docker-compose exec backend pytest tests/

# 查看资源使用
stats:
	docker stats --no-stream

# 进入后端容器
shell-backend:
	docker-compose exec backend bash

# 进入前端容器
shell-frontend:
	docker-compose exec frontend sh

# 重新构建并启动
rebuild:
	@echo "重新构建并启动..."
	docker-compose up -d --build

# 生产环境重新构建并启动
rebuild-prod:
	@echo "生产环境重新构建并启动..."
	docker-compose -f docker-compose.prod.yml up -d --build

# 导出镜像
export-backend:
	@echo "导出后端镜像..."
	docker save longzhang-backend:latest | gzip > longzhang-backend-latest.tar.gz
	@echo "镜像已导出到: longzhang-backend-latest.tar.gz"

export-frontend:
	@echo "导出前端镜像..."
	docker save longzhang-frontend:latest | gzip > longzhang-frontend-latest.tar.gz
	@echo "镜像已导出到: longzhang-frontend-latest.tar.gz"

# 导出所有镜像
export-all: export-backend export-frontend
	@echo "所有镜像已导出"

# 查看镜像大小
images:
	@echo "Docker 镜像列表:"
	@docker images | grep longzhang || echo "未找到相关镜像"
