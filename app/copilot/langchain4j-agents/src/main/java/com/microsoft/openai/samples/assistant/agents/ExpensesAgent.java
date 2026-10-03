package com.microsoft.openai.samples.assistant.agents;

import dev.langchain4j.agent.tool.Tool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.Map;

/**
 * Expenses Agent - متخصص في معالجة المصروفات والموازنات
 */
@Component
public class ExpensesAgent {

    private static final Logger logger = LoggerFactory.getLogger(ExpensesAgent.class);

    private final RestTemplate restTemplate;
    private static final String EXPENSES_SERVICE_URL = "http://localhost:8084/api/expenses";

    public ExpensesAgent() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * تسجيل مصروف جديد
     */
    @Tool(value = "recordExpense")
    public String recordExpense(
            String userId,
            String amount,
            String category,
            String description,
            String paymentMethod) {
        try {
            logger.info("Recording expense for user: {} - Category: {} - Amount: {}", userId, category, amount);

            Map<String, Object> expenseData = new HashMap<>();
            expenseData.put("userId", userId);
            expenseData.put("amount", new BigDecimal(amount));
            expenseData.put("category", category);
            expenseData.put("description", description);
            expenseData.put("paymentMethod", paymentMethod != null ? paymentMethod : "CASH");
            expenseData.put("expenseDate", LocalDateTime.now().toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(expenseData, headers);

            Map response = restTemplate.postForObject(EXPENSES_SERVICE_URL, request, Map.class);

            if (response != null) {
                logger.info("Expense recorded successfully");
                return String.format(
                    "✅ تم تسجيل المصروف بنجاح:\n" +
                    "💰 المبلغ: %s ريال\n" +
                    "📂 الفئة: %s\n" +
                    "📝 الوصف: %s\n" +
                    "💳 طريقة الدفع: %s",
                    amount, category, description, paymentMethod
                );
            }
            return "❌ خطأ في تسجيل المصروف";

        } catch (Exception e) {
            logger.error("Error recording expense", e);
            return "❌ حدث خطأ أثناء تسجيل المصروف: " + e.getMessage();
        }
    }

    /**
     * الحصول على إجمالي المصروفات الشهرية
     */
    @Tool(value = "getMonthlyExpenses")
    public String getMonthlyExpenses(String userId, String yearMonth) {
        try {
            logger.info("Fetching monthly expenses for user: {} - Month: {}", userId, yearMonth);

            String url = EXPENSES_SERVICE_URL + "/user/" + userId + "/month/" + yearMonth + "/total";
            Map response = restTemplate.getForObject(url, Map.class);

            if (response != null) {
                BigDecimal total = new BigDecimal(response.get("totalExpenses").toString());
                logger.info("Total expenses for {}: {}", yearMonth, total);
                return String.format(
                    "📊 إجمالي المصروفات للشهر %s:\n" +
                    "💸 %s ريال",
                    yearMonth, total
                );
            }
            return "⚠️ لم يتم العثور على بيانات للشهر المطلوب";

        } catch (Exception e) {
            logger.error("Error fetching monthly expenses", e);
            return "❌ خطأ في الحصول على بيانات المصروفات: " + e.getMessage();
        }
    }

    /**
     * الحصول على مصروفات فئة معينة
     */
    @Tool(value = "getExpensesByCategory")
    public String getExpensesByCategory(String userId, String category) {
        try {
            logger.info("Fetching expenses for user: {} - Category: {}", userId, category);

            String url = EXPENSES_SERVICE_URL + "/user/" + userId + "/category/" + category;
            Map[] response = restTemplate.getForObject(url, Map[].class);

            if (response != null && response.length > 0) {
                BigDecimal total = BigDecimal.ZERO;
                for (Map expense : response) {
                    total = total.add(new BigDecimal(expense.get("amount").toString()));
                }

                logger.info("Total expenses for category {}: {}", category, total);
                return String.format(
                    "📂 المصروفات في فئة '%s':\n" +
                    "💰 الإجمالي: %s ريال\n" +
                    "🔢 عدد المصروفات: %d",
                    category, total, response.length
                );
            }
            return "⚠️ لا توجد مصروفات في هذه الفئة";

        } catch (Exception e) {
            logger.error("Error fetching category expenses", e);
            return "❌ خطأ في الحصول على مصروفات الفئة: " + e.getMessage();
        }
    }

    /**
     * تحليل الإنفاق مقابل الميزانية
     */
    @Tool(value = "analyzeBudget")
    public String analyzeBudget(String userId, String yearMonth, String budgetAmount) {
        try {
            logger.info("Analyzing budget for user: {} - Month: {} - Budget: {}", userId, yearMonth, budgetAmount);

            BigDecimal budget = new BigDecimal(budgetAmount);
            String url = EXPENSES_SERVICE_URL + "/user/" + userId + "/month/" + yearMonth + "/total";
            Map response = restTemplate.getForObject(url, Map.class);

            if (response != null) {
                BigDecimal spent = new BigDecimal(response.get("totalExpenses").toString());
                BigDecimal remaining = budget.subtract(spent);
                double percentageUsed = (spent.doubleValue() / budget.doubleValue()) * 100;

                StringBuilder analysis = new StringBuilder();
                analysis.append("📊 تحليل الميزانية للشهر ").append(yearMonth).append(":\n\n");
                analysis.append("💰 الميزانية المحددة: ").append(budget).append(" ريال\n");
                analysis.append("💸 المصروف الفعلي: ").append(spent).append(" ريال\n");
                analysis.append("💵 المتبقي: ").append(remaining).append(" ريال\n");
                analysis.append("📈 نسبة الاستخدام: ").append(String.format("%.2f%%", percentageUsed)).append("\n\n");

                if (percentageUsed > 100) {
                    analysis.append("🚨 تنبيه حرج: لقد تجاوزت الميزانية المحددة بمقدار ").append(spent.subtract(budget)).append(" ريال!");
                } else if (percentageUsed > 90) {
                    analysis.append("⚠️ تحذير: لقد استخدمت أكثر من 90% من ميزانيتك!");
                } else if (percentageUsed > 75) {
                    analysis.append("📌 ملاحظة: لقد استخدمت أكثر من 75% من ميزانيتك. يرجى توخي الحذر.");
                } else if (percentageUsed > 50) {
                    analysis.append("✅ وضعك المالي جيد. لا تزال لديك ").append(remaining).append(" ريال متبقية.");
                } else {
                    analysis.append("✅ وضعك المالي ممتاز! لا تزال لديك ").append(remaining).append(" ريال متبقية.");
                }

                logger.info("Budget analysis completed: {}%", percentageUsed);
                return analysis.toString();
            }
            return "⚠️ لم يتم العثور على بيانات الميزانية";

        } catch (Exception e) {
            logger.error("Error analyzing budget", e);
            return "❌ خطأ في تحليل الميزانية: " + e.getMessage();
        }
    }

    /**
     * الحصول على المصروفات ضمن نطاق زمني معين
     */
    @Tool(value = "getExpensesByDateRange")
    public String getExpensesByDateRange(String userId, String startDate, String endDate) {
        try {
            logger.info("Fetching expenses for date range: {} to {}", startDate, endDate);

            String url = EXPENSES_SERVICE_URL + "/user/" + userId + "/date-range?startDate=" + startDate + "&endDate=" + endDate;
            Map[] response = restTemplate.getForObject(url, Map[].class);

            if (response != null && response.length > 0) {
                BigDecimal total = BigDecimal.ZERO;
                for (Map expense : response) {
                    total = total.add(new BigDecimal(expense.get("amount").toString()));
                }

                logger.info("Total expenses for date range: {}", total);
                return String.format(
                    "📅 المصروفات من %s إلى %s:\n" +
                    "💰 الإجمالي: %s ريال\n" +
                    "🔢 عدد المصروفات: %d",
                    startDate, endDate, total, response.length
                );
            }
            return "⚠️ لا توجد مصروفات في هذا النطاق الزمني";

        } catch (Exception e) {
            logger.error("Error fetching expenses by date range", e);
            return "❌ خطأ في الحصول على المصروفات: " + e.getMessage();
        }
    }

    /**
     * حذف مصروف
     */
    @Tool(value = "deleteExpense")
    public String deleteExpense(String expenseId) {
        try {
            logger.info("Deleting expense: {}", expenseId);

            String url = EXPENSES_SERVICE_URL + "/" + expenseId;
            restTemplate.delete(url);

            logger.info("Expense deleted successfully");
            return "✅ تم حذف المصروف بنجاح";

        } catch (Exception e) {
            logger.error("Error deleting expense", e);
            return "❌ خطأ في حذف المصروف: " + e.getMessage();
        }
    }

    /**
     * تحديث مصروف موجود
     */
    @Tool(value = "updateExpense")
    public String updateExpense(String expenseId, String amount, String category, String description) {
        try {
            logger.info("Updating expense: {}", expenseId);

            Map<String, Object> updateData = new HashMap<>();
            updateData.put("amount", new BigDecimal(amount));
            updateData.put("category", category);
            updateData.put("description", description);

            String url = EXPENSES_SERVICE_URL + "/" + expenseId;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(updateData, headers);

            restTemplate.put(url, request);

            logger.info("Expense updated successfully");
            return "✅ تم تحديث المصروف بنجاح";

        } catch (Exception e) {
            logger.error("Error updating expense", e);
            return "❌ خطأ في تحديث المصروف: " + e.getMessage();
        }
    }

    /**
     * الحصول على توصيات لتقليل المصروفات
     */
    @Tool(value = "getSpendingInsights")
    public String getSpendingInsights(String userId, String yearMonth) {
        try {
            logger.info("Getting spending insights for user: {}", userId);

            String[] categories = {"FOOD", "TRANSPORTATION", "ENTERTAINMENT", "UTILITIES", "SHOPPING", "HEALTHCARE"};
            StringBuilder insights = new StringBuilder();
            insights.append("💡 توصيات لتقليل المصروفات:\n\n");

            for (String category : categories) {
                String url = EXPENSES_SERVICE_URL + "/user/" + userId + "/category/" + category + "/month/" + yearMonth + "/total";
                try {
                    Map response = restTemplate.getForObject(url, Map.class);
                    if (response != null) {
                        BigDecimal amount = new BigDecimal(response.get("total").toString());
                        String advice = getAdviceForCategory(category, amount);
                        insights.append("• ").append(category).append(": ").append(advice).append("\n");
                    }
                } catch (Exception e) {
                    // Skip category if not found
                }
            }

            return insights.toString();

        } catch (Exception e) {
            logger.error("Error getting spending insights", e);
            return "❌ خطأ في الحصول على التوصيات: " + e.getMessage();
        }
    }

    private String getAdviceForCategory(String category, BigDecimal amount) {
        return switch (category) {
            case "FOOD" -> amount.compareTo(new BigDecimal("1000")) > 0 ?
                "حاول تقليل الإنفاق على الطعام بـ 10-15%" : "إنفاقك معقول ✅";
            case "TRANSPORTATION" -> amount.compareTo(new BigDecimal("500")) > 0 ?
                "استخدم وسائل نقل عامة لتوفير المال" : "إنفاقك معقول ✅";
            case "ENTERTAINMENT" -> amount.compareTo(new BigDecimal("300")) > 0 ?
                "قلل الإنفاق على الترفيه قليلاً" : "إنفاقك معقول ✅";
            case "SHOPPING" -> amount.compareTo(new BigDecimal("2000")) > 0 ?
                "قلل التسوق غير الضروري" : "إنفاقك معقول ✅";
            case "UTILITIES" -> "الفواتير ضرورية، حاول توفير الكهرباء والماء";
            case "HEALTHCARE" -> "استثمر في صحتك ✅";
            default -> "إنفاقك معقول ✅";
        };
    }
}
