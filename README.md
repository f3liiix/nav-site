# nav-site - AI导航网站

一个收录AI服务和应用的导航网站，旨在帮助用户快速访问和检索AI工具，提升使用效率。

## 功能特性

- 响应式设计，适配各种设备
- 实时搜索、分类、标签浏览
- 点击统计功能
- 管理后台（分类、服务、标签管理）
- Banner管理
- 用户账户管理

## 技术栈

- 前端：Next.js v15.2.1 + TypeScript + Tailwind CSS v3.4.17
- 后端：Next.js API 路由 + Prisma ORM
- UI框架：Ant Design v5.24.3 + Ant Design Icons v5.6.1
- 数据库：MySQL
- 缓存：Redis
- 部署：Docker + Docker Compose 或 Node.js

## 环境要求

- Node.js v18.x
- Docker 和 Docker Compose（可选，用于Docker部署）
- MySQL（Node.js部署时需要独立安装）
- Redis（Node.js部署时需要独立安装）

## 安装

```bash
npm install
```

## 部署方式

项目支持两种部署方式：Docker部署和Node.js部署。两种方式使用不同的环境变量配置。

### Docker部署（推荐）

使用Docker部署可以一键启动所有服务（包括MySQL和Redis）：

1. 复制环境变量示例文件并按需修改：

   ```bash
   cp .env.example .env
   # 编辑 .env 文件中的密码配置
   ```

2. 启动所有服务：

   ```bash
   docker-compose up -d
   ```

3. 初始化数据库（首次部署时）：
   ```bash
   docker-compose exec web npm run init
   ```

### Node.js部署

Node.js部署需要您已经安装并运行了MySQL和Redis服务：

1. 安装MySQL和Redis并确保它们正在运行

2. 复制环境变量示例文件并按需修改：

   ```bash
   cp .env.example .env
   # 编辑 .env 文件，确保数据库和Redis配置正确
   ```

3. 运行部署脚本：
   ```bash
   ./deploy.sh
   ```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 启动

由于项目配置了 `output: standalone`，启动方式有所不同：

- 使用 `npm start` 启动应用（内部实际执行 `node .next/standalone/server.js`）
- 或者直接运行 `node .next/standalone/server.js`

应用默认监听 8080 端口，你可以通过访问 `http://localhost:8080` 来访问该应用。
可以通过设置环境变量 `PORT` 来更改默认端口。

## 注意事项

1. Docker部署时，数据库和Redis服务由docker-compose自动管理
2. Node.js部署时，需要您自行安装和配置MySQL和Redis
3. 两种部署方式使用不同的主机地址配置（Docker使用服务名，Node.js使用localhost）
