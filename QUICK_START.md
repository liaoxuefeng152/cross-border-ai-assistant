# 龙掌柜智能运营助手 - 快速开始

## 最简单的部署方式（5分钟）

### 1. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 API Key（必需！）
nano .env
```

在 `.env` 文件中设置：
```env
COZE_WORKLOAD_IDENTITY_API_KEY=你的实际API_KEY
COZE_INTEGRATION_MODEL_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

### 2. 一键启动
```bash
# 使用部署脚本
./deploy.sh

# 选择选项 1）构建并启动服务
```

### 3. 访问应用
- 前端：http://localhost:8080
- 后端：http://localhost:8000
- API文档：http://localhost:8000/docs

---

## 三种部署方式

### 方式1：使用部署脚本（推荐）
```bash
./deploy.sh
```
菜单选项：
1. 构建并启动服务（开发环境）
2. 构建并启动服务（生产环境）
3. 停止服务
4. 重启服务
5. 查看日志
6. 清理所有数据

### 方式2：使用 Make 命令
```bash
# 启动服务
make up

# 查看日志
make logs

# 停止服务
make down

# 健康检查
make check
```

### 方式3：使用 Docker Compose
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

---

## 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 完全清理
docker-compose down -v
```

---

## 测试部署

```bash
# 运行测试脚本
./test-docker.sh

# 或使用 Make 命令
make check
```

---

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost:8080 | 聊天界面 |
| 后端 | http://localhost:8000 | API 服务 |
| API文档 | http://localhost:8000/docs | Swagger 文档 |
| 健康检查 | http://localhost:8000/health | 服务状态 |

---

## 下一步

1. **配置内网穿透**（如需公网访问）
   - 使用 localtunnel 或 ngrok
   - 参考文档：`docs/公网访问指南.md`

2. **自定义配置**
   - 修改 `docker-compose.yml` 调整端口
   - 修改 `.env` 配置环境变量

3. **生产环境部署**
   - 使用 `docker-compose.prod.yml`
   - 配置 Nginx 反向代理
   - 启用 HTTPS

---

## 遇到问题？

### 容器无法启动
```bash
# 查看日志
docker-compose logs

# 检查端口占用
netstat -tlnp | grep 8000
netstat -tlnp | grep 8080
```

### 无法访问服务
```bash
# 检查防火墙
sudo ufw status

# 检查容器状态
docker-compose ps

# 测试网络连接
docker-compose exec backend curl http://localhost:8000/health
```

### 需要更多帮助？
- 查看详细文档：`docs/Docker部署指南.md`
- 提交 Issue：<your-repo-url>/issues

---

## 生产环境建议

1. **使用生产环境配置**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **配置 HTTPS**
   - 使用 Let's Encrypt 免费证书
   - 配置 Nginx SSL

3. **设置日志轮转**
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

4. **限制资源使用**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 1G
   ```

5. **定期更新**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

---

祝使用愉快！🎉
