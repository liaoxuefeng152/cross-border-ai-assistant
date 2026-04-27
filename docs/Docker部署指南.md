# 龙掌柜智能运营助手 - Docker 容器化部署指南

## 目录
- [快速开始](#快速开始)
- [环境要求](#环境要求)
- [部署步骤](#部署步骤)
- [生产环境部署](#生产环境部署)
- [常用命令](#常用命令)
- [故障排查](#故障排查)
- [安全建议](#安全建议)

---

## 快速开始

### 一键部署（开发环境）

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd longzhang-ai-agent

# 2. 配置环境变量
cp .env.example .env
nano .env  # 编辑 API Key

# 3. 运行部署脚本
chmod +x deploy.sh
./deploy.sh

# 选择选项 1）构建并启动服务
```

访问地址：
- 前端：http://localhost:8080
- 后端：http://localhost:8000
- API文档：http://localhost:8000/docs

---

## 环境要求

### 系统要求
- Linux / macOS / Windows (WSL2)
- 内存：至少 2GB RAM
- 磁盘：至少 5GB 可用空间

### 软件要求
- Docker: 20.10+
- Docker Compose: 2.0+

### 安装 Docker

#### Ubuntu/Debian
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### macOS
```bash
# 下载并安装 Docker Desktop
# https://docs.docker.com/desktop/mac/install/
```

#### Windows
```bash
# 下载并安装 Docker Desktop
# https://docs.docker.com/desktop/windows/install/
```

---

## 部署步骤

### 1. 准备项目

```bash
# 进入项目目录
cd /workspace/projects

# 检查文件
ls -la
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

必需的环境变量：
```env
COZE_WORKLOAD_IDENTITY_API_KEY=your_api_key_here
COZE_INTEGRATION_MODEL_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

### 3. 构建镜像

```bash
# 开发环境
docker-compose build

# 生产环境
docker-compose -f docker-compose.prod.yml build
```

### 4. 启动服务

```bash
# 开发环境
docker-compose up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### 5. 验证部署

```bash
# 检查容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试后端健康检查
curl http://localhost:8000/health

# 测试前端
curl http://localhost:8080
```

---

## 生产环境部署

### 1. 使用生产环境配置

```bash
# 使用生产环境 Dockerfile（多阶段构建，镜像更小）
docker-compose -f docker-compose.prod.yml up -d --build
```

### 2. 配置反向代理

如果需要使用域名访问，配置 Nginx：

```bash
# 创建 Nginx 配置目录
mkdir -p nginx/ssl

# 复制 SSL 证书到 nginx/ssl/
# nginx/ssl/cert.pem
# nginx/ssl/key.pem
```

### 3. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 4. 使用 PM2 管理 Docker（可选）

```bash
# 创建 PM2 配置
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'longzhang-backend',
    script: 'docker',
    args: 'compose -f docker-compose.prod.yml up',
    cwd: '/path/to/project'
  }]
}
EOF

# 启动
pm2 start ecosystem.config.js
```

---

## 常用命令

### Docker Compose 命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps

# 进入容器
docker-compose exec backend bash
docker-compose exec frontend sh

# 重新构建镜像
docker-compose build --no-cache

# 更新服务
docker-compose up -d --build

# 查看资源使用
docker stats
```

### Docker 命令

```bash
# 查看所有容器
docker ps -a

# 查看镜像
docker images

# 删除停止的容器
docker container prune

# 删除未使用的镜像
docker image prune -a

# 清理所有未使用的资源
docker system prune -a

# 导出镜像
docker save -o longzhang-backend.tar longzhang-backend:latest

# 导入镜像
docker load -i longzhang-backend.tar
```

---

## 故障排查

### 问题1：容器无法启动

**检查日志：**
```bash
docker-compose logs backend
docker-compose logs frontend
```

**常见原因：**
- 端口被占用：修改 docker-compose.yml 中的端口映射
- 环境变量未配置：检查 .env 文件
- 依赖安装失败：重新构建镜像

### 问题2：无法访问服务

**检查服务状态：**
```bash
docker-compose ps
```

**测试网络连接：**
```bash
docker-compose exec backend curl http://localhost:8000/health
docker-compose exec frontend wget -O- http://localhost:80
```

### 问题3：内存不足

**限制内存使用：**
```yaml
# 在 docker-compose.yml 中添加
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

### 问题4：磁盘空间不足

**清理 Docker 资源：**
```bash
# 清理未使用的镜像和容器
docker system prune -a

# 查看磁盘使用
docker system df
```

---

## 安全建议

### 1. 使用非 root 用户

生产环境容器已配置为使用非 root 用户（uid 1000）

### 2. 保护环境变量

```bash
# 设置 .env 文件权限
chmod 600 .env

# 使用 Docker Secrets（生产环境）
docker secret create api_key ./api_key.txt
```

### 3. 启用 HTTPS

配置 Nginx SSL 证书：
```bash
# 使用 Let's Encrypt
certbot certonly --nginx -d your-domain.com
```

### 4. 限制容器权限

```yaml
# 在 docker-compose.yml 中添加
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
```

### 5. 定期更新镜像

```bash
# 拉取最新镜像
docker-compose pull

# 重新构建和部署
docker-compose up -d --build
```

---

## 监控和日志

### 查看实时日志

```bash
# 所有服务
docker-compose logs -f

# 指定服务
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 日志持久化

```yaml
# 在 docker-compose.yml 中添加
services:
  backend:
    volumes:
      - ./logs/backend:/var/log
```

### 性能监控

```bash
# 安装 ctop
docker run --rm -ti --name=ctop --volume=/var/run/docker.sock:/var/run/docker.sock:ro quay.io/ctop/ctop
```

---

## 备份和恢复

### 备份数据

```bash
# 导出配置和数据
tar -czf backup-$(date +%Y%m%d).tar.gz .env docker-compose.yml

# 导出镜像
docker save longzhang-backend > backend-$(date +%Y%m%d).tar
```

### 恢复数据

```bash
# 恢复配置
tar -xzf backup-20240101.tar.gz

# 恢复镜像
docker load < backend-20240101.tar
```

---

## 扩展部署

### 使用 Kubernetes

如果你需要更高的可用性和扩展性，可以使用 Kubernetes：

```bash
# 创建 K8s 部署文件
kubectl apply -f k8s-deployment.yaml

# 扩展实例
kubectl scale deployment longzhang-backend --replicas=3
```

### 使用 Docker Swarm

```bash
# 初始化 Swarm
docker swarm init

# 部署 Stack
docker stack deploy -c docker-compose.yml longzhang

# 扩展服务
docker service scale longzhang_backend=3
```

---

## 支持

如有问题，请查看：
- 项目文档：`docs/`
- Docker 文档：https://docs.docker.com/
- 提交 Issue：<your-repo-url>/issues

---

## 许可证

MIT License
