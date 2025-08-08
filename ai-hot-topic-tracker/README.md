# AI 热点话题追踪器

一个基于 AI 的智能热点话题追踪和分析应用，支持前端对话式交互和后端定时任务处理。

## 🚀 项目特性

- **对话式交互**: 通过自然语言与 AI 助手对话，轻松配置追踪任务
- **智能分析**: 使用 OpenAI 或 DeepSeek API 进行文本分析和摘要生成
- **定时任务**: 自动定期收集和分析最新数据
- **实时更新**: WebSocket 实时推送分析结果
- **多数据源**: 支持新闻 API、Reddit 等多种数据源
- **Agent 架构**: 采用 MCP + A2A 架构，模块化设计

## 🏗️ 系统架构

### MCP (Master Control Program) + A2A (Agent-to-Agent) 架构

本项目采用创新的智能体架构设计：

```
Frontend (React) ←→ MCP ←→ Agents
                    ↓
                Database
```

#### 核心组件

1. **MCP (主控程序)**: 中央协调器，负责智能体间的通信和任务分发
2. **UI Agent**: 处理用户界面交互和自然语言理解
3. **Task Agent**: 管理任务生命周期和调度
4. **Data Collection Agent**: 负责从多种数据源收集信息
5. **Analysis Agent**: 使用 AI 模型进行数据分析
6. **Results Agent**: 格式化和存储分析结果

## 🛠️ 技术栈

### 后端
- **FastAPI**: 现代化的 Python Web 框架
- **SQLAlchemy**: ORM 数据库操作
- **APScheduler**: 定时任务调度
- **WebSockets**: 实时通信
- **OpenAI/DeepSeek API**: AI 分析能力

### 前端
- **React 18**: 用户界面构建
- **TypeScript**: 类型安全
- **CSS3**: 现代化样式设计
- **WebSocket**: 实时通信

### 部署
- **Docker**: 容器化部署
- **Docker Compose**: 多服务编排
- **Nginx**: 前端服务器和反向代理

## 📁 项目结构

```
ai-hot-topic-tracker/
├── backend/                 # 后端服务
│   ├── app/
│   │   ├── agents/         # 智能体模块
│   │   │   ├── ui_agent.py
│   │   │   ├── task_agent.py
│   │   │   ├── data_collection_agent.py
│   │   │   ├── analysis_agent.py
│   │   │   └── results_agent.py
│   │   ├── core/           # 核心配置
│   │   │   ├── config.py
│   │   │   └── db.py
│   │   ├── models/         # 数据模型
│   │   │   └── task.py
│   │   ├── services/       # 外部服务
│   │   │   ├── ai_service.py
│   │   │   └── data_sources.py
│   │   └── main.py         # MCP 主程序
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # React 组件
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── hooks/          # 自定义 Hooks
│   │   │   └── useWebSocket.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml      # 容器编排
├── DESIGN.md              # 设计文档
├── 技术文档.md             # 详细技术文档
├── 部署指南.md             # 部署指南
└── README.md              # 项目说明
```

## 🚀 快速开始

### 环境要求

- Docker & Docker Compose
- Python 3.11+ (本地开发)
- Node.js 18+ (本地开发)

### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-hot-topic-tracker
```

### 2. 配置环境变量

创建 `.env` 文件并配置 API 密钥：

```env
# AI API Keys
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Data Sources API Keys
NEWS_API_KEY=your_news_api_key_here
```

### 3. 使用 Docker Compose 启动

```bash
# 构建并启动所有服务
docker-compose up --build

# 后台运行
docker-compose up -d --build
```

### 4. 访问应用

- **前端界面**: http://localhost:3000
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 🔧 本地开发

### 后端开发

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

## 💬 使用指南

### 基本对话命令

1. **创建追踪任务**:
   - "追踪 AI 突破性进展"
   - "监控加密货币新闻"
   - "关注气候变化讨论"

2. **管理任务**:
   - "显示我的任务"
   - "列出所有任务"
   - "删除任务 1"

3. **获取帮助**:
   - "帮助"
   - "你能做什么？"

### 任务配置

任务支持以下配置选项：

- **关键词**: 用于搜索的关键词
- **数据源**: news（新闻）, reddit（Reddit 讨论）
- **分析类型**: summary（摘要）, sentiment（情感分析）, trends（趋势分析）
- **执行频率**: 默认每小时执行一次

## 🔌 API 接口

### REST API

- `GET /api/tasks` - 获取所有任务
- `POST /api/tasks` - 创建新任务
- `DELETE /api/tasks/{task_id}` - 删除任务
- `GET /api/results` - 获取最近结果
- `GET /api/tasks/{task_id}/results` - 获取特定任务结果

### WebSocket API

- `ws://localhost:8000/ws` - 实时通信端点

消息格式：
```json
{
  "type": "chat_message",
  "message": "用户输入的消息"
}
```

## 🤖 Agent 架构详解

### MCP (Master Control Program)

MCP 是系统的核心协调器，负责：

- 智能体间的消息路由
- 任务分发和结果聚合
- WebSocket 连接管理
- 系统状态监控

### 智能体说明

1. **UI Agent (用户界面智能体)**
   - 自然语言理解和处理
   - 意图识别和命令解析
   - 响应格式化

2. **Task Agent (任务管理智能体)**
   - 任务生命周期管理
   - 定时任务调度
   - 任务状态跟踪

3. **Data Collection Agent (数据收集智能体)**
   - 多数据源适配
   - 数据清洗和预处理
   - 错误处理和重试机制

4. **Analysis Agent (分析智能体)**
   - AI 模型调用管理
   - 多模型支持和降级
   - 结果解析和结构化

5. **Results Agent (结果智能体)**
   - 结果格式化和存储
   - 历史数据管理
   - 趋势分析和报告生成

## 🔧 配置说明

### 数据源配置

#### News API
1. 访问 [NewsAPI.org](https://newsapi.org/)
2. 注册并获取 API 密钥
3. 配置 `NEWS_API_KEY` 环境变量

#### AI 模型配置

**OpenAI API**:
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 获取 API 密钥
3. 配置 `OPENAI_API_KEY` 环境变量

**DeepSeek API**:
1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 获取 API 密钥
3. 配置 `DEEPSEEK_API_KEY` 环境变量

## 🚀 部署指南

### 生产环境部署

1. **服务器要求**:
   - 2+ CPU 核心
   - 4GB+ 内存
   - 20GB+ 存储空间
   - Docker 支持

2. **部署步骤**:

```bash
# 1. 克隆代码
git clone <repository-url>
cd ai-hot-topic-tracker

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置生产环境密钥

# 3. 部署
docker-compose -f docker-compose.yml up -d --build

# 4. 检查服务状态
docker-compose ps
docker-compose logs
```

详细部署说明请参考 [部署指南.md](部署指南.md)

## 🔍 监控和日志

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend

# 实时跟踪日志
docker-compose logs -f
```

### 健康检查

- 后端健康检查: `GET http://localhost:8000/health`
- 前端访问检查: `http://localhost:3000`

## 🧪 测试

### 后端测试

```bash
cd backend
python -m pytest tests/
```

### 前端测试

```bash
cd frontend
npm test
```

## 📚 文档

- [设计文档](DESIGN.md) - 系统架构和设计理念
- [技术文档](技术文档.md) - 详细的技术实现说明
- [部署指南](部署指南.md) - 完整的部署和运维指南

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 🆘 常见问题

### Q: 如何添加新的数据源？

A: 在 `backend/app/services/data_sources.py` 中添加新的数据源类，并在 `DataSourceManager` 中注册。

### Q: 如何自定义 AI 分析逻辑？

A: 修改 `backend/app/agents/analysis_agent.py` 中的分析方法，或添加新的分析类型。

### Q: WebSocket 连接失败怎么办？

A: 检查防火墙设置，确保 8000 端口开放。开发环境下确保后端服务正常运行。

### Q: 如何扩展智能体功能？

A: 在 `backend/app/agents/` 目录下创建新的智能体类，并在 MCP 中注册和路由。

## 📞 支持

如有问题或建议，请：

1. 查看 [Issues](https://github.com/your-repo/issues)
2. 创建新的 Issue
3. 联系维护者

---

## 🎯 项目亮点

### 创新架构设计
- **MCP 协议**: 实现智能体间高效通信
- **A2A 架构**: 模块化的智能体协作模式
- **实时性**: WebSocket 驱动的即时更新

### 技术特性
- **多 AI 模型支持**: OpenAI 和 DeepSeek 无缝切换
- **容错机制**: 智能降级和错误恢复
- **可扩展性**: 易于添加新数据源和分析类型

### 用户体验
- **自然语言交互**: 直观的对话式界面
- **实时反馈**: 任务执行状态实时显示
- **美观界面**: 现代化的渐变设计

本项目展示了现代 AI 应用开发的最佳实践，结合了前沿的智能体架构和实用的业务场景，为热点话题追踪提供了完整的解决方案。
