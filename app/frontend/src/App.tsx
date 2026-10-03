import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeIcons } from '@fluentui/react';
import { HomePage } from './components/HomePage';
import './App.css';

// Initialize Fluent UI icons
initializeIcons();

function App() {
  // Mock user - في التطبيق الحقيقي، تأتي من Azure AD
  const userId = localStorage.getItem('userId') || 'user-123';
  const userName = localStorage.getItem('userName') || 'أحمد';

  React.useEffect(() => {
    // Store mock user data
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage userId={userId} userName={userName} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
