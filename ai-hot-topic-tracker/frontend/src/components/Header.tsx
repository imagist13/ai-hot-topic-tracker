import type { ConnectionStatus } from '../types'

interface HeaderProps {
  connectionStatus: ConnectionStatus
}

const Header = ({ connectionStatus }: HeaderProps) => {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          text: '已连接',
          icon: '🟢',
          className: 'text-green-400'
        }
      case 'connecting':
        return {
          text: '连接中...',
          icon: '🟡',
          className: 'text-yellow-400'
        }
      case 'disconnected':
        return {
          text: '连接断开',
          icon: '🔴',
          className: 'text-red-400'
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <header className="glass-effect border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                AI 热点话题追踪器
              </h1>
              <p className="text-sm text-gray-300">
                智能话题分析与追踪平台
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg">{statusConfig.icon}</span>
            <span className={`text-sm font-medium ${statusConfig.className}`}>
              {statusConfig.text}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
