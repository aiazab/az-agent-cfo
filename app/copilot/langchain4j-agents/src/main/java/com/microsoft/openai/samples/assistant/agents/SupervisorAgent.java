package com.microsoft.openai.samples.assistant.agents;

import dev.langchain4j.agent.tool.Tool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Supervisor Agent - يوجه الطلبات إلى الوكلاء المتخصصين
 */
@Component
public class SupervisorAgent {

    private static final Logger logger = LoggerFactory.getLogger(SupervisorAgent.class);

    private final AccountAgent accountAgent;
    private final TransactionsAgent transactionsAgent;
    private final PaymentsAgent paymentsAgent;
    private final ExpensesAgent expensesAgent;

    public SupervisorAgent(
            AccountAgent accountAgent,
            TransactionsAgent transactionsAgent,
            PaymentsAgent paymentsAgent,
            ExpensesAgent expensesAgent) {
        this.accountAgent = accountAgent;
        this.transactionsAgent = transactionsAgent;
        this.paymentsAgent = paymentsAgent;
        this.expensesAgent = expensesAgent;
    }

    @Tool(value = "routeUserIntent")
    public String routeUserIntent(String userMessage, String userId) {
        logger.info("Routing user intent: {} for user: {}", userMessage, userId);

        if (isAccountRelated(userMessage)) {
            return "🏦 يتم توجيهك إلى وكيل الحسابات...";
        } else if (isTransactionRelated(userMessage)) {
            return "💳 يتم توجيهك إلى وكيل المعاملات...";
        } else if (isPaymentRelated(userMessage)) {
            return "💰 يتم توجيهك إلى وكيل المدفوعات...";
        } else if (isExpenseRelated(userMessage)) {
            return "💸 يتم توجيهك إلى وكيل المصروفات...";
        }

        return "❓ لم أفهم طلبك تماماً. هل تريد:\n" +
                "1. معلومات عن حسابك؟\n" +
                "2. سجل معاملاتك؟\n" +
                "3. تحويل أموال؟\n" +
                "4. إدارة مصروفاتك؟";
    }

    private boolean isAccountRelated(String message) {
        String lower = message.toLowerCase();
        return lower.contains("balance") || lower.contains("account") ||
                lower.contains("رصيد") || lower.contains("حساب") ||
                lower.contains("payment method") || lower.contains("طريقة دفع") ||
                lower.contains("beneficiary") || lower.contains("مستفيد");
    }

    private boolean isTransactionRelated(String message) {
        String lower = message.toLowerCase();
        return lower.contains("transaction") || lower.contains("معاملة") ||
                lower.contains("history") || lower.contains("سجل") ||
                lower.contains("payment received") || lower.contains("مدفوعات واردة") ||
                lower.contains("income") || lower.contains("دخل");
    }

    private boolean isPaymentRelated(String message) {
        String lower = message.toLowerCase();
        return lower.contains("pay") || lower.contains("دفع") ||
                lower.contains("payment") || lower.contains("payment") ||
                lower.contains("invoice") || lower.contains("فاتورة") ||
                lower.contains("bill") || lower.contains("فاتورة");
    }

    private boolean isExpenseRelated(String message) {
        String lower = message.toLowerCase();
        return lower.contains("expense") || lower.contains("مصروف") ||
                lower.contains("spending") || lower.contains("إنفاق") ||
                lower.contains("budget") || lower.contains("ميزانية") ||
                lower.contains("cost") || lower.contains("تكلفة") ||
                lower.contains("receipt") || lower.contains("إيصال") ||
                lower.contains("category") || lower.contains("فئة");
    }
}
