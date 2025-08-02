#!/bin/bash

# 获取版本信息
VERSION=$(node -e "console.log(require('./package.json').version)")
BUILD_TIME=$(date "+%Y-%m-%d %H:%M:%S")
BUILD_ID=$(date +%s)

echo "===== 开始部署流程 ====="
echo "版本: $VERSION"
echo "构建时间: $BUILD_TIME"
echo "构建ID: $BUILD_ID"

# 检测Redis服务是否可用
echo "检测Redis服务..."
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}

if ! command -v nc &> /dev/null && ! command -v telnet &> /dev/null; then
  echo "警告: 未找到 nc 或 telnet 命令，无法检测Redis连接"
else
  if command -v nc &> /dev/null; then
    REDIS_CHECK=$(nc -z $REDIS_HOST $REDIS_PORT && echo "success")
  elif command -v telnet &> /dev/null; then
    REDIS_CHECK=$(timeout 5 telnet $REDIS_HOST $REDIS_PORT 2>/dev/null | grep Connected && echo "success")
  fi
  
  if [ "$REDIS_CHECK" != "success" ]; then
    echo "错误: 无法连接到Redis数据库 ($REDIS_HOST:$REDIS_PORT)"
    echo "请确保Redis服务正在运行，或设置正确的REDIS_HOST和REDIS_PORT环境变量"
    exit 1
  else
    echo "Redis服务连接正常"
  fi
fi

# 设置脚本执行权限
echo "设置脚本执行权限..."
chmod +x *.sh
chmod +x scripts/*.sh
echo "脚本权限设置完成"

# 安装依赖
echo "安装依赖..."
npm install

# 生成Prisma客户端
echo "生成Prisma客户端..."
npx prisma generate

# 构建应用
echo "构建应用..."
NEXT_PUBLIC_APP_VERSION=$VERSION BUILD_ID=$BUILD_ID npm run build

# 创建版本信息文件
echo "创建版本信息文件..."
mkdir -p .next/static/version
cat > .next/static/version/info.json << EOF
{
  "version": "$VERSION",
  "buildTime": "$BUILD_TIME",
  "buildId": "$BUILD_ID"
}
EOF

# 重启应用（根据您的部署环境调整）
echo "启动应用..."
npm start

echo "===== 部署完成 ====="