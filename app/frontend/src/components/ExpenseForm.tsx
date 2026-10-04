import React from 'react';
import { Stack, TextField, Dropdown, PrimaryButton, MessageBar, MessageBarType } from '@fluentui/react';
import { Upload } from '@fluentui/react-icons';
import { expensesAPI } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';
import './ExpenseForm.css';

interface ExpenseFormProps {
  userId: string;
  onSuccess?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ userId, onSuccess }) => {
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState('FOOD');
  const [description, setDescription] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('CASH');
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: MessageBarType; text: string } | null>(null);
  const { t } = useLanguage();

  const CATEGORIES = [
    { key: 'FOOD', text: t('categories.FOOD') },
    { key: 'TRANSPORTATION', text: t('categories.TRANSPORTATION') },
    { key: 'ENTERTAINMENT', text: t('categories.ENTERTAINMENT') },
    { key: 'UTILITIES', text: t('categories.UTILITIES') },
    { key: 'SHOPPING', text: t('categories.SHOPPING') },
    { key: 'HEALTHCARE', text: t('categories.HEALTHCARE') },
    { key: 'EDUCATION', text: t('categories.EDUCATION') },
  ];

  const PAYMENT_METHODS = [
    { key: 'CASH', text: t('paymentMethods.CASH') },
    { key: 'CARD', text: t('paymentMethods.CARD') },
    { key: 'TRANSFER', text: t('paymentMethods.TRANSFER') },
    { key: 'ONLINE', text: t('paymentMethods.ONLINE') },
  ];

  const handleSubmit = async () => {
    if (!amount || !description) {
      setMessage({ type: MessageBarType.warning, text: t('validation.required') });
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

      setMessage({ type: MessageBarType.success, text: t('expenses.success') });
      setAmount('');
      setDescription('');
      setCategory('FOOD');
      setPaymentMethod('CASH');
      onSuccess?.();

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: MessageBarType.error, text: t('expenses.error') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack className="expense-form" tokens={{ childrenGap: 15 }}>
      <h3>📝 {t('expenses.addNew')}</h3>

      {message && <MessageBar messageBarType={message.type}>{message.text}</MessageBar>}

      <Stack tokens={{ childrenGap: 10 }}>
        <TextField
          label={t('expenses.amount')}
          type="number"
          value={amount}
          onChange={(e, val) => setAmount(val || '')}
          placeholder={t('expenses.amount')}
        />

        <Dropdown
          label={t('expenses.category')}
          selectedKey={category}
          onChange={(e, option) => setCategory(option?.key as string)}
          options={CATEGORIES}
        />

        <TextField
          label={t('expenses.description')}
          multiline
          rows={3}
          value={description}
          onChange={(e, val) => setDescription(val || '')}
          placeholder={t('expenses.description')}
        />

        <Dropdown
          label={t('expenses.paymentMethod')}
          selectedKey={paymentMethod}
          onChange={(e, option) => setPaymentMethod(option?.key as string)}
          options={PAYMENT_METHODS}
        />

        <PrimaryButton
          text={t('expenses.save')}
          onClick={handleSubmit}
          disabled={isLoading}
          iconProps={{ iconName: 'Save' }}
        />
      </Stack>
    </Stack>
  );
};
