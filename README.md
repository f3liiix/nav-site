# AI导航站程序

一个收录AI服务和应用的导航网站，方便用户快速访问和检索AI工具。

## 技术栈

- 前端：Next.js + TypeScript + Tailwind CSS
- 后台：Ant Design
- 数据库：MySQL
- 缓存：Redis
- 容器化：Docker

## 功能特点

- 响应式设计，适配各种设备
- 实时搜索、分类、标签、点击统计，基本功能齐全
- 独立的管理后台

## Nodejs 部署（需单独安装MySQL/Redis服务）

#### 一、配置环境变量

根目录创建`.env`文件，并根据实际情况修改配置：

```env
# 数据库配置
DATABASE_URL="mysql://用户名:密码@localhost:3306/数据库名"

# 应用配置
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_SITE_NAME="123导航"
NEXT_PUBLIC_UPLOAD_DIR="uploads"

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=your_redis_password
```

#### 二、一键启动
进入项目根目录，运行

```bash
./deploy.sh
```

#### 三、系统初始化

首次运行时，访问 [http://localhost:3000/api/init](http://localhost:3000/api/init) 初始化系统，这将创建默认的管理员账户和分类。

默认管理员账户：

- 用户名：admin
- 密码：admin123

访问 [http://localhost:3000/admin](http://localhost:3000/admin) 进入管理后台。

## Docker 部署（MySQL/Redis会集成在Docker容器中）

使用 Docker Compose 可以一键启动所有服务（无需手动安装 MySQL 和 Redis）：

1. 确保已安装 Docker 和 Docker Compose
2. 在项目根目录创建 `.env` 文件，配置环境变量

> 提示：对于快速部署，您可以直接使用默认配置，无需修改 `.env` 文件。如果需要自定义配置，可以修改以下环境变量：

```properties
# MySQL 配置（默认值已经可用，如无特殊需求无需修改）
MYSQL_DATABASE=nav_site
MYSQL_USER=nav_user
MYSQL_PASSWORD=nav_password
MYSQL_ROOT_PASSWORD=root_password

# 数据库和Redis连接配置（使用Docker服务名，无需修改）
DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@db:3306/${MYSQL_DATABASE}"
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL="redis://${REDIS_HOST}:${REDIS_PORT}"

# 应用配置（默认值已可用）
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_UPLOAD_DIR="uploads"
```

3. 一键启动所有服务：

```bash
docker-compose up -d
```

4. 访问以下地址初始化系统：
   - 系统初始化：[http://localhost:3000/api/init](http://localhost:3000/api/init)
   - 管理后台：[http://localhost:3000/admin](http://localhost:3000/admin)
   - 默认管理员账户：admin / admin123

常用运维命令：

```bash
# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f

# 停止所有服务
docker-compose down

# 重新构建并启动服务
docker-compose up -d --build
```

## 赞助商

- [YxVM](https://yxvm.com/)
- [NodeSupport](https://github.com/NodeSeekDev/NodeSupport)

## 许可证

MIT
