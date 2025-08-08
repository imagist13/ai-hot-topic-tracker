import type { Task, TaskResult } from '../types'

interface SidebarProps {
  tasks: Task[]
  recentResults: TaskResult[]
  onRefresh: () => void
}

const Sidebar = ({ tasks, recentResults, onRefresh }: SidebarProps) => {
  const formatInterval = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`
    }
    return `${minutes}分钟`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <aside className="w-80 space-y-6">
      {/* 活跃任务 */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="mr-2">📋</span>
            活跃任务
          </h3>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="刷新"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="font-medium text-gray-800 mb-1 line-clamp-2">
                  {task.name}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  关键词: {task.keywords}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>每 {formatInterval(task.schedule_interval)}</span>
                  <div className="flex items-center space-x-1">
                    {task.sources.map((source, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>暂无活跃任务</p>
              <p className="text-sm mt-1">
                在聊天中说 "追踪 AI 新闻" 创建任务
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 最近结果 */}
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          最近结果
        </h3>
        
        <div className="space-y-3">
          {recentResults.length > 0 ? (
            recentResults.slice(0, 5).map((result) => (
              <div
                key={result.id}
                className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="text-sm text-gray-800 mb-2 line-clamp-3">
                  {result.summary}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center">
                      {result.sentiment_emoji}
                      <span className="ml-1 capitalize">{result.sentiment}</span>
                    </span>
                    <span>•</span>
                    <span>{result.data_count} 项</span>
                  </div>
                  <span>{formatDate(result.created_at)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📈</div>
              <p>暂无分析结果</p>
              <p className="text-sm mt-1">
                创建任务后会显示分析结果
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
