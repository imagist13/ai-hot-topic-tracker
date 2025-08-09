import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatInterface from './components/ChatInterface'
import { apiService } from './services/api'

function App() {
  const [tasks, setTasks] = useState([])
  const [recentResults, setRecentResults] = useState([])
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected')

  useEffect(() => {
    fetchTasks()
    fetchRecentResults()
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      setConnectionStatus('connecting')
      await apiService.healthCheck()
      setConnectionStatus('connected')
    } catch (error) {
      setConnectionStatus('disconnected')
    }
  }

  const fetchTasks = async () => {
    try {
      const data = await apiService.getTasks()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const fetchRecentResults = async () => {
    try {
      const data = await apiService.getResults()
      setRecentResults(data.results || [])
    } catch (error) {
      console.error('Failed to fetch results:', error)
    }
  }

  const refreshData = () => {
    fetchTasks()
    fetchRecentResults()
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header connectionStatus={connectionStatus} />
      
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="flex gap-6 h-full">
          <Sidebar 
            tasks={tasks} 
            recentResults={recentResults}
            onRefresh={refreshData}
          />
          
          <main className="flex-1">
            <ChatInterface onTaskCreated={refreshData} />
          </main>
        </div>
      </div>
    </div>
  )
}

export default App