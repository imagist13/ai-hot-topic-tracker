@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ================================
echo   AI Hot Topic Tracker 启动
echo ================================
echo.

REM 检查 Docker 是否运行
docker ps >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未运行，请启动 Docker Desktop
    echo.
    echo 解决步骤：
    echo 1. 启动 Docker Desktop
    echo 2. 等待 Docker 完全启动
    echo 3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✅ Docker 正在运行

REM 停止可能存在的容器
echo 🛑 停止旧容器...
docker-compose down

REM 构建并启动
echo 🔨 构建并启动服务...
docker-compose up --build -d

if errorlevel 1 (
    echo ❌ 启动失败，查看错误信息：
    docker-compose logs
    pause
    exit /b 1
)

echo ⏳ 等待服务启动...
timeout /t 15 /nobreak >nul

REM 检查服务状态
echo 📊 检查服务状态...
docker-compose ps

echo.
echo 🎉 启动完成！
echo ================================
echo 📱 前端界面: http://localhost:3000
echo 🔧 后端 API: http://localhost:8000
echo 📚 API 文档: http://localhost:8000/docs
echo ================================
echo.
echo 💡 提示：
echo - 如需查看日志: docker-compose logs -f
echo - 如需停止服务: docker-compose down
echo - 编辑 .env 文件配置 API 密钥
echo.

REM 尝试打开浏览器
start http://localhost:3000

pause
