import React, { useState, useEffect } from 'react';
import { Stack, Text, PivotItem, Pivot, Spinner, MessageBar, MessageBarType } from '@fluentui/react';
import { BarChart, LineChart, ScatterChart } from '@fluentui/react-charting';
import { expensesAPI, Expense } from '../api/client';
import './ExpensesDashboard.css';

interface ExpensesDashboardProps {
  userId: string;
}

interface CategoryTotal {
  name: string;
  value: number;
}

export const ExpensesDashboard: React.FC<ExpensesDashboardProps> = ({ userId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYearMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    loadExpensesData();
  }, [userId]);

  const loadExpensesData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load expenses
      const expensesData = await expensesAPI.getByUserId(userId);
      setExpenses(expensesData);

      // Load monthly total
      const monthlyData = await expensesAPI.getMonthlyTotal(userId, currentYearMonth);
      setMonthlyTotal(monthlyData.totalExpenses);

      // Load category totals
      const categories = ['FOOD', 'TRANSPORTATION', 'ENTERTAINMENT', 'UTILITIES', 'SHOPPING', 'HEALTHCARE'];
      const categoryData: CategoryTotal[] = [];

      for (const category of categories) {
        try {
          const data = await expensesAPI.getCategoryTotal(userId, category, currentYearMonth);
          categoryData.push({ name: category, value: data.total });
        } catch (err) {
          // Category not found, skip
        }
      }

      setCategoryTotals(categoryData);
    } catch (err) {
      setError('فشل تحميل بيانات المصروفات');
      console.error('Error loading expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = categoryTotals.map((cat) => ({
    name: translateCategory(cat.name),
    x: cat.name,
    y: cat.value,
  }));

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      FOOD: '🍔',
      TRANSPORTATION: '🚗',
      ENTERTAINMENT: '🎬',
      UTILITIES: '💡',
      SHOPPING: '🛍️',
      HEALTHCARE: '🏥',
    };
    return emojiMap[category] || '💰';
  };

  const translateCategory = (category: string): string => {
    const translations: Record<string, string> = {
      FOOD: 'الطعام',
      TRANSPORTATION: 'المواصلات',
      ENTERTAINMENT: 'الترفيه',
      UTILITIES: 'الفواتير',
      SHOPPING: 'التسوق',
      HEALTHCARE: 'الصحة',
    };
    return translations[category] || category;
  };

  if (isLoading) return <Spinner label="جاري تحميل البيانات..." />;

  return (
    <Stack className="dashboard-container" tokens={{ childrenGap: 20 }}>
      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

      {/* Summary Cards */}
      <Stack horizontal tokens={{ childrenGap: 15 }} className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <Text className="card-label">إجمالي المصروفات الشهرية</Text>
            <Text className="card-value">{monthlyTotal.toFixed(2)} ريال</Text>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <Text className="card-label">عدد المصروفات</Text>
            <Text className="card-value">{expenses.length}</Text>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <Text className="card-label">متوسط المصروف</Text>
            <Text className="card-value">
              {(monthlyTotal / Math.max(expenses.length, 1)).toFixed(2)} ريال
            </Text>
          </div>
        </div>
      </Stack>

      {/* Tabs */}
      <Pivot>
        <PivotItem headerText="الرسم البياني">
          <div className="chart-container">
            {chartData.length > 0 ? (
              <BarChart data={{ chartTitle: 'المصروفات حسب الفئة', series: chartData }} />
            ) : (
              <Text>لا توجد بيانات للعرض</Text>
            )}
          </div>
        </PivotItem>

        <PivotItem headerText="الفئات">
          <Stack tokens={{ childrenGap: 10 }} className="categories-list">
            {categoryTotals.map((cat) => (
              <div key={cat.name} className="category-item">
                <span className="category-emoji">{getCategoryEmoji(cat.name)}</span>
                <div className="category-info">
                  <Text>{translateCategory(cat.name)}</Text>
                  <div className="category-progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${(cat.value / (monthlyTotal || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <Text strong>{cat.value.toFixed(2)} ريال</Text>
              </div>
            ))}
          </Stack>
        </PivotItem>

        <PivotItem headerText="التفاصيل">
          <Stack tokens={{ childrenGap: 8 }} className="details-list">
            {expenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-header">
                  <Text strong>{expense.description}</Text>
                  <Text className="expense-amount">-{expense.amount} ريال</Text>
                </div>
                <div className="expense-meta">
                  <span className="category-badge">{getCategoryEmoji(expense.category)} {translateCategory(expense.category)}</span>
                  <span className="date-badge">{new Date(expense.expenseDate).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            ))}
          </Stack>
        </PivotItem>
      </Pivot>
    </Stack>
  );
};
