import { useState, useEffect, useRef, useCallback } from 'react'

interface TypewriterOptions {
  speed?: number // 打字速度 (毫秒)
  delay?: number // 开始延迟 (毫秒)
  onComplete?: () => void // 完成回调
}

export const useTypewriter = (
  text: string, 
  options: TypewriterOptions = {}
) => {
  const { speed = 50, delay = 0, onComplete } = options
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const timerRef = useRef<number>()

  const startTyping = useCallback(() => {
    if (!text) return

    setDisplayText('')
    setIsTyping(true)
    setIsComplete(false)
    
    let index = 0
    
    const typeNext = () => {
      if (index < text.length) {
        setDisplayText(prev => prev + text[index])
        index++
        timerRef.current = setTimeout(typeNext, speed)
      } else {
        setIsTyping(false)
        setIsComplete(true)
        onComplete?.()
      }
    }

    // 延迟开始
    timerRef.current = setTimeout(typeNext, delay)
  }, [text, speed, delay, onComplete])

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setDisplayText('')
    setIsTyping(false)
    setIsComplete(false)
  }, [])

  const skip = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setDisplayText(text)
    setIsTyping(false)
    setIsComplete(true)
    onComplete?.()
  }, [text, onComplete])

  useEffect(() => {
    startTyping()
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [startTyping])

  return {
    displayText,
    isTyping,
    isComplete,
    reset,
    skip
  }
}

// 流式打字机hook，用于处理分块到达的文本
export const useStreamingTypewriter = () => {
  const [fullText, setFullText] = useState('')
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const typeTimerRef = useRef<number>()

  const addChunk = useCallback((chunk: string) => {
    setFullText(prev => prev + chunk)
  }, [])

  const reset = useCallback(() => {
    if (typeTimerRef.current) {
      clearTimeout(typeTimerRef.current)
    }
    setFullText('')
    setDisplayText('')
    setIsTyping(false)
    setIsComplete(false)
  }, [])

  const markComplete = useCallback(() => {
    setIsComplete(true)
  }, [])

  // 当fullText改变时，开始打字效果
  useEffect(() => {
    if (fullText && fullText !== displayText) {
      setIsTyping(true)
      
      const typeText = () => {
        setDisplayText(prev => {
          if (prev.length < fullText.length) {
            const nextChar = fullText[prev.length]
            const newText = prev + nextChar
            
            // 继续打字
            if (newText.length < fullText.length) {
              typeTimerRef.current = setTimeout(typeText, 30)
            } else {
              // 完成打字
              setIsTyping(false)
            }
            
            return newText
          }
          return prev
        })
      }

      // 清除之前的计时器
      if (typeTimerRef.current) {
        clearTimeout(typeTimerRef.current)
      }
      
      typeTimerRef.current = setTimeout(typeText, 50)
    }
  }, [fullText, displayText])

  // 清理计时器
  useEffect(() => {
    return () => {
      if (typeTimerRef.current) {
        clearTimeout(typeTimerRef.current)
      }
    }
  }, [])

  return {
    displayText,
    isTyping,
    isComplete,
    addChunk,
    reset,
    markComplete
  }
}
