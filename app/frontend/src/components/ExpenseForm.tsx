import React, { useState } from 'react';
import { Stack, TextField, Dropdown, PrimaryButton, MessageBar, MessageBarType } from '@fluentui/react';
import { Upload } from '@fluentui/react-icons';
import { expensesAPI } from '../api/client';
import './ExpenseForm.css';

interface ExpenseFormProps {
  userId: string;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { key: 'FOOD', text: '🍔 الطعام' },
  { key: 'TRANSPORTATION', text: '🚗 المواصلات' },
  { key: 'ENTERTAINMENT', text: '🎬 الترفيه' },
  { key: 'UTILITIES', text: '💡 الفواتير' },
  { key: 'SHOPPING', text: '🛍️ التسوق' },
  { key: 'HEALTHCARE', text: '🏥 الصحة' },
];

const PAYMENT_METHODS = [
  { key: 'CASH', text: '💵 نقداً' },
  { key: 'CARD', text: '💳 بطاقة' },
  { key: 'TRANSFER', text: '📱 تحويل' },
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ userId, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: MessageBarType; text: string } | null>(null);

  const handleSubmit = async () => {
    if (!amount || !description) {
      setMessage({ type: MessageBarType.warning, text: 'الرجاء ملء جميع الحقول المطلوبة' });
      return;
    }

    setIsLoading(true);
    try {
      await expensesAPI.create({
        userId,
        amount: parseFloat(amount),
        category,
        description,
        paymentMethod,
        expenseDate: new Date().toISOString(),
      });

      setMessage({ type: MessageBarType.success, text: '✅ تم تسجيل المصروف بنجاح' });
      setAmount('');
      setDescription('');
      setCategory('FOOD');
      setPaymentMethod('CASH');
      onSuccess?.();

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: MessageBarType.error, text: '❌ فشل تسجيل المصروف' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack className="expense-form" tokens={{ childrenGap: 15 }}>
      <h3>📝 إضافة مصروف جديد</h3>

      {message && <MessageBar messageBarType={message.type}>{message.text}</MessageBar>}

      <Stack tokens={{ childrenGap: 10 }}>
        <TextField
          label="المبلغ (ريال)"
          type="number"
          value={amount}
          onChange={(e, val) => setAmount(val || '')}
          prefix="﷼"
          placeholder="أدخل المبلغ"
        />

        <Dropdown
          label="الفئة"
          selectedKey={category}
          onChange={(e, option) => setCategory(option?.key as string)}
          options={CATEGORIES}
        />

        <TextField
          label="الوصف"
          multiline
          rows={3}
          value={description}
          onChange={(e, val) => setDescription(val || '')}
          placeholder="وصف المصروف"
        />

        <Dropdown
          label="طريقة الدفع"
          selectedKey={paymentMethod}
          onChange={(e, option) => setPaymentMethod(option?.key as string)}
          options={PAYMENT_METHODS}
        />

        <PrimaryButton
          text="حفظ المصروف"
          onClick={handleSubmit}
          disabled={isLoading}
          iconProps={{ iconName: 'Save' }}
        />
      </Stack>
    </Stack>
  );
};
