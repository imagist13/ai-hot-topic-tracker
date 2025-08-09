import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('响应错误:', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

export default api

// SSE连接类
export class SSEChatClient {
  private eventSource: EventSource | null = null
  private url: string
  
  constructor(baseUrl: string = 'http://localhost:8000') {
    this.url = baseUrl
  }

  // 发送消息并建立SSE连接
  async sendMessage(
    message: string,
    onChunk: (chunk: { type: string; content?: string; result?: any }) => void,
    onError: (error: string) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      // 先通过POST发送消息，触发SSE流
      const response = await fetch(`${this.url}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法获取响应流')
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          onComplete()
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              onChunk(data)
            } catch (e) {
              console.warn('解析SSE数据失败:', line)
            }
          }
        }
      }
    } catch (error) {
      console.error('SSE连接错误:', error)
      onError(error instanceof Error ? error.message : '连接失败')
    }
  }

  // 断开连接
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }
}

// API方法
export const apiService = {
  // 获取任务列表
  async getTasks() {
    const response = await api.get('/api/tasks')
    return response.data
  },

  // 创建任务
  async createTask(taskData: any) {
    const response = await api.post('/api/tasks', taskData)
    return response.data
  },

  // 删除任务
  async deleteTask(taskId: number) {
    const response = await api.delete(`/api/tasks/${taskId}`)
    return response.data
  },

  // 获取结果
  async getResults() {
    const response = await api.get('/api/results')
    return response.data
  },

  // 获取任务结果
  async getTaskResults(taskId: number) {
    const response = await api.get(`/api/tasks/${taskId}/results`)
    return response.data
  },

  // 获取数据源
  async getDataSources() {
    const response = await api.get('/api/sources')
    return response.data
  },

  // 获取分析类型
  async getAnalysisTypes() {
    const response = await api.get('/api/analysis-types')
    return response.data
  },

  // 健康检查
  async healthCheck() {
    const response = await api.get('/health')
    return response.data
  },
}
