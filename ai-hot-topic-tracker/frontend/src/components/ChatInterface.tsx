import { useState, useEffect, useRef } from 'react'
import type { Message } from '../types'
import { SSEChatClient } from '../services/api'
import { useStreamingTypewriter } from '../hooks/useTypewriter'
import { generateUniqueId, formatMessage, formatTime, isEmpty } from '../utils/helpers'

interface ChatInterfaceProps {
  onTaskCreated: () => void
}

const ChatInterface = ({ onTaskCreated }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sseClient = useRef(new SSEChatClient())
  const { displayText, isTyping, addChunk, reset: resetTypewriter, markComplete } = useStreamingTypewriter()
  const [currentBotMessageId, setCurrentBotMessageId] = useState<string | null>(null)
  const [isThinkingMode, setIsThinkingMode] = useState(false)

  // 检查后端连接状态
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('connecting')
        const response = await fetch('http://localhost:8000/health')
        if (response.ok) {
          setConnectionStatus('connected')
        } else {
          setConnectionStatus('disconnected')
        }
      } catch (error) {
        setConnectionStatus('disconnected')
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 10000) // 每10秒检查一次

    return () => clearInterval(interval)
  }, [])

  // 添加欢迎消息
  useEffect(() => {
    setMessages([
      {
        id: generateUniqueId(),
        type: 'bot',
        content: `👋 您好！我是您的 AI 热点追踪助手。

我可以帮您：
• **追踪话题**: "追踪 AI 突破性进展"
• **管理任务**: "显示我的任务" 或 "删除任务 1"  
• **获取帮助**: "帮助" 或 "你能做什么？"

让我们开始追踪热点话题吧！`,
        timestamp: new Date(),
      },
    ])
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, displayText])

  // 当打字机效果在进行时，更新对应的机器人消息
  useEffect(() => {
    if (displayText && currentBotMessageId) {
      setMessages(prev => {
        return prev.map(message => 
          message.id === currentBotMessageId 
            ? { ...message, content: displayText }
            : message
        )
      })
    }
  }, [displayText, currentBotMessageId])

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const newMessage: Message = {
      id: generateUniqueId(),
      type,
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (isEmpty(inputMessage)) return

    const userMessage = inputMessage
    addMessage(userMessage, 'user')
    setInputMessage('')

    if (connectionStatus !== 'connected') {
      addMessage('❌ 连接断开，请检查后端服务是否运行', 'bot')
      return
    }

    // 重置打字机状态
    resetTypewriter()
    setIsThinkingMode(false)

    // 创建一个新的机器人消息用于显示流式输出
    const botMessageId = generateUniqueId()
    const botMessage: Message = {
      id: botMessageId,
      type: 'bot',
      content: '',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, botMessage])
    setCurrentBotMessageId(botMessageId)

    try {
      await sseClient.current.sendMessage(
        userMessage,
        (chunk) => {
          console.log('收到SSE数据:', chunk)
          
          if (chunk.type === 'thinking') {
            // 显示思考状态
            resetTypewriter()
            setIsThinkingMode(true)
            const thinkingText = '🤔 ' + (chunk.content || '正在思考...')
            addChunk(thinkingText)
          } else if (chunk.type === 'content') {
            // 如果之前是思考模式，先重置
            if (isThinkingMode) {
              resetTypewriter()
              setIsThinkingMode(false)
            }
            // 添加内容块
            if (chunk.content) {
              addChunk(chunk.content)
            }
          } else if (chunk.type === 'done') {
            // 完成
            markComplete()
            if (chunk.result?.message?.includes('创建任务') || chunk.result?.message?.includes('已创建')) {
              onTaskCreated()
            }
          } else if (chunk.type === 'error') {
            // 错误处理
            resetTypewriter()
            const errorText = '❌ ' + (chunk.content || '处理消息时出错')
            addChunk(errorText)
            markComplete()
          }
        },
        (error) => {
          console.error('SSE错误:', error)
          setCurrentBotMessageId(null)
          addMessage(`❌ 发送消息失败: ${error}`, 'bot')
        },
        () => {
          console.log('SSE连接完成')
          setCurrentBotMessageId(null)
        }
      )
    } catch (error) {
      addMessage(`❌ 发送消息失败: ${error}`, 'bot')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }



  return (
    <div className="card-glass h-full flex flex-col">
      {/* 聊天头部 */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="mr-2">💬</span>
            AI 助手
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            与 AI 对话，配置和管理您的追踪任务
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          connectionStatus === 'connected' 
            ? 'bg-green-100 text-green-700' 
            : connectionStatus === 'connecting'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {connectionStatus === 'connected' && '🟢 在线'}
          {connectionStatus === 'connecting' && '🟡 连接中'}
          {connectionStatus === 'disconnected' && '🔴 离线'}
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-2xl ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              {/* 头像 */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
              }`}>
                {message.type === 'user' ? '👤' : '🤖'}
              </div>
              
              {/* 消息内容 */}
              <div className={`message-bubble ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}>
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
                <div className={`text-xs mt-2 opacity-70 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 正在输入指示器 */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-2xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white flex items-center justify-center text-sm">
                🤖
              </div>
              <div className="message-bubble bg-white border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息... (例如: 追踪加密货币新闻)"
            disabled={connectionStatus !== 'connected'}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={isEmpty(inputMessage) || connectionStatus !== 'connected'}
            className="button-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {connectionStatus !== 'connected' && (
          <p className="text-xs text-red-500 mt-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            连接断开，请检查后端服务是否运行
          </p>
        )}
      </div>
    </div>
  )
}

export default ChatInterface
