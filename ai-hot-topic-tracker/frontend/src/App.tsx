import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatInterface from './components/ChatInterface'
import { useWebSocket } from './hooks/useWebSocket'

function App() {
  const [tasks, setTasks] = useState([])
  const [recentResults, setRecentResults] = useState([])
  const { connectionStatus } = useWebSocket('ws://localhost:8000/ws')

  useEffect(() => {
    fetchTasks()
    fetchRecentResults()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const fetchRecentResults = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/results')
      if (response.ok) {
        const data = await response.json()
        setRecentResults(data.results || [])
      }
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