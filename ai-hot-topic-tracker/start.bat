@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 AI Hot Topic Tracker - 启动脚本
echo ==================================

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

REM 检查 Docker Compose 是否安装
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose 未安装，请先安装 Docker Compose
    pause
    exit /b 1
)

REM 检查环境变量文件
if not exist .env (
    echo ⚠️  环境变量文件 .env 不存在
    echo 📝 正在创建环境变量文件模板...
    
    (
        echo # AI API Keys - 请替换为您的实际 API 密钥
        echo OPENAI_API_KEY=your_openai_api_key_here
        echo DEEPSEEK_API_KEY=your_deepseek_api_key_here
        echo.
        echo # Data Sources API Keys
        echo NEWS_API_KEY=your_news_api_key_here
        echo.
        echo # Application Settings
        echo DEBUG=true
        echo APP_NAME=AI Hot Topic Tracker
        echo.
        echo # Database Configuration
        echo DATABASE_URL=sqlite:///./ai_tracker.db
        echo.
        echo # CORS Settings
        echo BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
    ) > .env
    
    echo ✅ 已创建 .env 文件
    echo 🔑 请编辑 .env 文件，填入您的 API 密钥：
    echo    - OPENAI_API_KEY: OpenAI API 密钥
    echo    - DEEPSEEK_API_KEY: DeepSeek API 密钥
    echo    - NEWS_API_KEY: News API 密钥
    echo.
    echo 📖 获取 API 密钥的方法请参考 README.md 或 部署指南.md
    echo.
    pause
)

REM 检查是否有运行中的容器
docker-compose ps | findstr "Up" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  检测到已有运行中的容器
    set /p restart="是否要停止并重新启动？ (y/N): "
    if /i "!restart!"=="y" (
        echo 🛑 停止现有容器...
        docker-compose down
    ) else (
        echo ℹ️  保持现有容器运行
        pause
        exit /b 0
    )
)

REM 构建并启动服务
echo 🔨 构建并启动服务...
docker-compose up --build -d

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

REM 检查服务状态
echo 📊 检查服务状态...
docker-compose ps

REM 检查后端健康状态
echo 🏥 检查后端健康状态...
set "backend_ready=false"
for /l %%i in (1,1,30) do (
    curl -s http://localhost:8000/health >nul 2>&1
    if not errorlevel 1 (
        echo ✅ 后端服务启动成功
        set "backend_ready=true"
        goto :frontend_check
    ) else (
        echo ⏳ 等待后端服务启动... (%%i/30)
        timeout /t 2 /nobreak >nul
    )
)

if "!backend_ready!"=="false" (
    echo ❌ 后端服务启动超时
    echo 📋 查看后端日志：
    docker-compose logs backend
    pause
    exit /b 1
)

:frontend_check
REM 检查前端服务
echo 🌐 检查前端服务...
set "frontend_ready=false"
for /l %%i in (1,1,15) do (
    curl -s http://localhost:3000 >nul 2>&1
    if not errorlevel 1 (
        echo ✅ 前端服务启动成功
        set "frontend_ready=true"
        goto :success
    ) else (
        echo ⏳ 等待前端服务启动... (%%i/15)
        timeout /t 2 /nobreak >nul
    )
)

if "!frontend_ready!"=="false" (
    echo ❌ 前端服务启动超时
    echo 📋 查看前端日志：
    docker-compose logs frontend
    pause
    exit /b 1
)

:success
echo.
echo 🎉 AI Hot Topic Tracker 启动成功！
echo ==================================
echo 📱 前端界面: http://localhost:3000
echo 🔧 后端 API: http://localhost:8000
echo 📚 API 文档: http://localhost:8000/docs
echo.
echo 💬 使用指南：
echo    1. 在前端界面中与 AI 助手对话
echo    2. 说 '追踪 AI 新闻' 来创建追踪任务
echo    3. 说 '帮助' 获取更多命令信息
echo.
echo 📋 查看日志: docker-compose logs -f
echo 🛑 停止服务: docker-compose down
echo.
echo 🔑 如需配置 API 密钥，请编辑 .env 文件后重启服务

pause
