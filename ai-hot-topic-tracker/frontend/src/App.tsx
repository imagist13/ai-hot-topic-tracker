import React from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="App">
      <Header />
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <ChatInterface />
        </main>
      </div>
    </div>
  );
}

export default App;
