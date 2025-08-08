@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   AI Hot Topic Tracker - 本地开发模式
echo ========================================
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装，请先安装 Python 3.11+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Python 和 Node.js 已安装

REM 创建并启动后端
echo 🐍 设置 Python 后端...
cd backend

REM 创建虚拟环境
if not exist venv (
    echo 📦 创建 Python 虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
echo 🔄 激活虚拟环境...
call venv\Scripts\activate.bat

REM 安装依赖
echo 📥 安装 Python 依赖...
pip install -r requirements.txt

REM 启动后端服务
echo 🚀 启动后端服务...
start cmd /k "call venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

cd ..

REM 设置前端
echo 🌐 设置 React 前端...
cd frontend

REM 安装前端依赖
echo 📥 安装前端依赖...
npm install

REM 启动前端服务
echo 🚀 启动前端服务...
start cmd /k "npm start"

cd ..

echo.
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 本地开发环境启动完成！
echo ========================================
echo 📱 前端界面: http://localhost:3000
echo 🔧 后端 API: http://localhost:8000
echo 📚 API 文档: http://localhost:8000/docs
echo ========================================
echo.
echo 💡 提示：
echo - 后端和前端将在新的命令行窗口中运行
echo - 关闭对应的命令行窗口即可停止服务
echo - 编辑 .env 文件配置 API 密钥
echo.

REM 等待后端启动后打开浏览器
echo 🌐 正在打开浏览器...
timeout /t 5 /nobreak >nul
start http://localhost:3000

pause
