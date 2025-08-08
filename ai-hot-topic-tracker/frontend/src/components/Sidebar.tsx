import React, { useState, useEffect } from 'react';
import './Sidebar.css';

interface Task {
  id: number;
  name: string;
  keywords: string;
  schedule_interval: number;
  created_at: string;
}

const Sidebar: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentResults, setRecentResults] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
    fetchRecentResults();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchRecentResults = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/results');
      const data = await response.json();
      setRecentResults(data.results || []);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Active Tasks</h3>
        <div className="task-list">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-name">{task.name}</div>
                <div className="task-keywords">Keywords: {task.keywords}</div>
                <div className="task-schedule">
                  Every {Math.floor(task.schedule_interval / 60)} minutes
                </div>
              </div>
            ))
          ) : (
            <div className="no-tasks">No active tasks</div>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Recent Results</h3>
        <div className="results-list">
          {recentResults.length > 0 ? (
            recentResults.slice(0, 5).map((result) => (
              <div key={result.id} className="result-item">
                <div className="result-summary">{result.summary}</div>
                <div className="result-sentiment">
                  Sentiment: {result.sentiment}
                  {result.sentiment === 'positive' && ' 📈'}
                  {result.sentiment === 'negative' && ' 📉'}
                  {result.sentiment === 'neutral' && ' 📊'}
                </div>
                <div className="result-count">{result.data_count} items</div>
              </div>
            ))
          ) : (
            <div className="no-results">No results yet</div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
