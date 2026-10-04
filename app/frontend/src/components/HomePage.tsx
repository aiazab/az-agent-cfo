import React, { useState } from 'react';
import { Stack, PivotItem, Pivot, Text } from '@fluentui/react';
import { ChatComponent } from './ChatComponent';
import { ExpensesDashboard } from './ExpensesDashboard';
import { ExpenseForm } from './ExpenseForm';
import { DocumentUpload } from './DocumentUpload';
import { useLanguage } from '../i18n/LanguageContext';
import './HomePage.css';

interface HomePageProps {
  userId: string;
  userName: string;
}

export const HomePage: React.FC<HomePageProps> = ({ userId, userName }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { t } = useLanguage();

  return (
    <Stack className="home-page">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <h1>📊 {t('home.title')}</h1>
          <p>{t('home.welcome')} {userName} 👋</p>
        </div>
        <div className="header-avatar">{userName.charAt(0)}</div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Pivot>
          <PivotItem headerText={t('nav.chat')} key="chat">
            <Stack className="section">
              <ChatComponent userId={userId} />
            </Stack>
          </PivotItem>

          <PivotItem headerText={t('nav.dashboard')} key="dashboard">
            <Stack className="section" key={refreshTrigger}>
              <ExpensesDashboard userId={userId} />
            </Stack>
          </PivotItem>

          <PivotItem headerText={t('nav.expenses')} key="form">
            <Stack className="section" tokens={{ childrenGap: 15 }}>
              <ExpenseForm
                userId={userId}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
              />
            </Stack>
          </PivotItem>

          <PivotItem headerText={t('nav.documents')} key="documents">
            <Stack className="section" tokens={{ childrenGap: 15 }}>
              <DocumentUpload
                onUpload={(file) => {
                  console.log('File uploaded:', file);
                }}
              />
            </Stack>
          </PivotItem>
        </Pivot>
      </div>
    </Stack>
  );
};
