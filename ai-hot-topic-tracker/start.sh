#!/bin/bash

# AI 热点话题追踪器 - 启动脚本

echo "🚀 AI Hot Topic Tracker - 启动脚本"
echo "=================================="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "⚠️  环境变量文件 .env 不存在"
    echo "📝 正在创建环境变量文件模板..."
    
    cat > .env << EOL
# AI API Keys - 请替换为您的实际 API 密钥
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Data Sources API Keys
NEWS_API_KEY=your_news_api_key_here

# Application Settings
DEBUG=true
APP_NAME=AI Hot Topic Tracker

# Database Configuration
DATABASE_URL=sqlite:///./ai_tracker.db

# CORS Settings
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
EOL
    
    echo "✅ 已创建 .env 文件"
    echo "🔑 请编辑 .env 文件，填入您的 API 密钥："
    echo "   - OPENAI_API_KEY: OpenAI API 密钥"
    echo "   - DEEPSEEK_API_KEY: DeepSeek API 密钥"
    echo "   - NEWS_API_KEY: News API 密钥"
    echo ""
    echo "📖 获取 API 密钥的方法请参考 README.md 或 部署指南.md"
    echo ""
    read -p "请配置完成后按回车键继续..."
fi

# 检查是否有运行中的容器
if docker-compose ps | grep -q "Up"; then
    echo "⚠️  检测到已有运行中的容器"
    read -p "是否要停止并重新启动？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🛑 停止现有容器..."
        docker-compose down
    else
        echo "ℹ️  保持现有容器运行"
        exit 0
    fi
fi

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

# 检查后端健康状态
echo "🏥 检查后端健康状态..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ 后端服务启动成功"
        break
    else
        echo "⏳ 等待后端服务启动... ($i/30)"
        sleep 2
    fi
    
    if [ $i -eq 30 ]; then
        echo "❌ 后端服务启动超时"
        echo "📋 查看后端日志："
        docker-compose logs backend
        exit 1
    fi
done

# 检查前端服务
echo "🌐 检查前端服务..."
for i in {1..15}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ 前端服务启动成功"
        break
    else
        echo "⏳ 等待前端服务启动... ($i/15)"
        sleep 2
    fi
    
    if [ $i -eq 15 ]; then
        echo "❌ 前端服务启动超时"
        echo "📋 查看前端日志："
        docker-compose logs frontend
        exit 1
    fi
done

echo ""
echo "🎉 AI Hot Topic Tracker 启动成功！"
echo "=================================="
echo "📱 前端界面: http://localhost:3000"
echo "🔧 后端 API: http://localhost:8000"
echo "📚 API 文档: http://localhost:8000/docs"
echo ""
echo "💬 使用指南："
echo "   1. 在前端界面中与 AI 助手对话"
echo "   2. 说 '追踪 AI 新闻' 来创建追踪任务"
echo "   3. 说 '帮助' 获取更多命令信息"
echo ""
echo "📋 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"
echo ""
echo "🔑 如需配置 API 密钥，请编辑 .env 文件后重启服务"
