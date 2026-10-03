import React, { useState } from 'react';
import { Stack, PivotItem, Pivot, Text } from '@fluentui/react';
import { ChatComponent } from './ChatComponent';
import { ExpensesDashboard } from './ExpensesDashboard';
import { ExpenseForm } from './ExpenseForm';
import { DocumentUpload } from './DocumentUpload';
import './HomePage.css';

interface HomePageProps {
  userId: string;
  userName: string;
}

export const HomePage: React.FC<HomePageProps> = ({ userId, userName }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <Stack className="home-page">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <h1>💼 مساعد المحاسبة الذكي</h1>
          <p>مرحباً {userName} 👋</p>
        </div>
        <div className="header-avatar">{userName.charAt(0)}</div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Pivot>
          <PivotItem headerText="💬 المحادثة" key="chat">
            <Stack className="section">
              <ChatComponent userId={userId} />
            </Stack>
          </PivotItem>

          <PivotItem headerText="💰 لوحة التحكم" key="dashboard">
            <Stack className="section" key={refreshTrigger}>
              <ExpensesDashboard userId={userId} />
            </Stack>
          </PivotItem>

          <PivotItem headerText="➕ إضافة مصروف" key="form">
            <Stack className="section" tokens={{ childrenGap: 15 }}>
              <ExpenseForm
                userId={userId}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
              />
            </Stack>
          </PivotItem>

          <PivotItem headerText="📄 رفع ملفات" key="documents">
            <Stack className="section" tokens={{ childrenGap: 15 }}>
              <DocumentUpload
                onUpload={(file) => {
                  console.log('File uploaded:', file);
                  // Handle file upload
                }}
              />
            </Stack>
          </PivotItem>
        </Pivot>
      </div>
    </Stack>
  );
};
