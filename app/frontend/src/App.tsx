import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeIcons } from '@fluentui/react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { HomePage } from './components/HomePage';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import './App.css';

// Initialize Fluent UI icons
initializeIcons();

function AppContent() {
  const { language } = useLanguage();

  useEffect(() => {
    // Set document direction and language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.body.style.direction = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Mock user - في التطبيق الحقيقي، تأتي من Azure AD
  const userId = localStorage.getItem('userId') || 'user-123';
  const userName = localStorage.getItem('userName') || 'أحمد';

  useEffect(() => {
    // Store mock user data
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <LanguageSwitcher />
        </header>
        <Routes>
          <Route path="/" element={<HomePage userId={userId} userName={userName} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
