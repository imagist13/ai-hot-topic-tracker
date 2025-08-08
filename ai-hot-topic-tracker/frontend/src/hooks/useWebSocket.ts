import { useState, useEffect, useRef, useCallback } from 'react'
import type { ConnectionStatus, WebSocketMessage } from '../types'

interface UseWebSocketOptions {
  onMessage?: (message: any) => void
  shouldReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export const useWebSocket = (url: string, options: UseWebSocketOptions = {}) => {
  const {
    onMessage,
    shouldReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const reconnectAttempts = useRef(0)
  const websocket = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    try {
      setConnectionStatus('connecting')
      websocket.current = new WebSocket(url)

      websocket.current.onopen = () => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
      }

      websocket.current.onmessage = (event) => {
        setLastMessage(event)
        if (onMessage) {
          try {
            const data = JSON.parse(event.data)
            onMessage(data)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }
      }

      websocket.current.onclose = () => {
        console.log('WebSocket disconnected')
        setConnectionStatus('disconnected')
        
        if (shouldReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`)
          setTimeout(connect, reconnectInterval)
        }
      }

      websocket.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
      setConnectionStatus('disconnected')
    }
  }, [url, shouldReconnect, reconnectInterval, maxReconnectAttempts, onMessage])

  useEffect(() => {
    connect()

    return () => {
      websocket.current?.close()
    }
  }, [connect])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  const disconnect = useCallback(() => {
    websocket.current?.close()
  }, [])

  return {
    connectionStatus,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect: connect,
  }
}
