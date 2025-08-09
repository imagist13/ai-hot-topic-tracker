@echo off
echo ================================================
echo AI Hot Topic Tracker - SSE 流式输出测试
echo ================================================
echo.

echo [1/3] 安装前端依赖...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo 错误：安装前端依赖失败
    pause
    exit /b 1
)
echo ✅ 前端依赖安装完成
echo.

echo [2/3] 启动后端服务...
cd ..\backend
start "后端服务" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo ✅ 后端服务启动中...
echo.

echo [3/3] 等待3秒后启动前端...
timeout /t 3 /nobreak >nul

cd ..\frontend
start "前端服务" cmd /k "npm run dev"
echo ✅ 前端服务启动中...
echo.

echo ================================================
echo 🎉 服务启动完成！
echo.
echo 📋 服务地址：
echo    • 前端：http://localhost:5173
echo    • 后端：http://localhost:8000
echo    • API文档：http://localhost:8000/docs
echo.
echo 🧪 测试步骤：
echo    1. 等待前端页面加载完成
echo    2. 检查右上角连接状态显示为"在线"
echo    3. 发送消息测试流式输出和打字机效果
echo    4. 尝试创建追踪任务
echo.
echo 💡 测试消息示例：
echo    • "你好，介绍一下你的功能"
echo    • "追踪人工智能最新突破"
echo    • "帮助我创建一个新任务"
echo.
echo ================================================
pause
