# التعديلات المطلوبة لدعم Azure AI Agent Service

## 1. إضافة التبعيات إلى pom.xml

أضف هذه التبعيات إلى `app/copilot/pom.xml`:

```xml
<!-- Azure AI Agents -->
<dependency>
    <groupId>com.azure</groupId>
    <artifactId>azure-ai-agents</artifactId>
    <version>1.0.0-beta.1</version>
</dependency>

<!-- OpenAI -->
<dependency>
    <groupId>com.openai</groupId>
    <artifactId>openai-java</artifactId>
    <version>4.0.0</version>
</dependency>

<!-- Azure Identity -->
<dependency>
    <groupId>com.azure</groupId>
    <artifactId>azure-identity</artifactId>
    <version>1.13.0</version>
</dependency>
```

## 2. إنشاء AgentManager.java

هذا الملف يدير الاتصال بـ Azure AI Agent Service:

```java
package com.microsoft.openai.samples.assistant.agents;

import com.azure.ai.agents.AgentsClientBuilder;
import com.azure.ai.agents.ResponsesClient;
import com.azure.ai.agents.models.AgentReference;
import com.azure.ai.agents.models.AzureCreateResponseOptions;
import com.azure.identity.DefaultAzureCredentialBuilder;
import com.openai.models.responses.ResponseCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AgentManager {

    private static final Logger logger = LoggerFactory.getLogger(AgentManager.class);

    @Value("${azure.agent.endpoint}")
    private String endpoint;

    @Value("${azure.agent.name}")
    private String agentName;

    @Value("${azure.agent.version:1}")
    private String agentVersion;

    private ResponsesClient responsesClient;

    public AgentManager() {
        initializeClient();
    }

    private void initializeClient() {
        this.responsesClient = new AgentsClientBuilder()
                .credential(new DefaultAzureCredentialBuilder().build())
                .endpoint(endpoint)
                .buildResponsesClient();
    }

    public String getAgentResponse(String userMessage) {
        try {
            logger.info("Getting response from agent: {} for message: {}", agentName, userMessage);

            AgentReference agentReference = new AgentReference(agentName)
                    .setVersion(agentVersion);

            com.openai.models.responses.Response response = responsesClient.createAzureResponse(
                    new AzureCreateResponseOptions()
                            .setAgentReference(agentReference),
                    ResponseCreateParams.builder()
                            .input(userMessage)
                            .build()
            );

            StringBuilder result = new StringBuilder();
            response.output().stream()
                    .flatMap(item -> item.message().stream())
                    .flatMap(message -> message.content().stream())
                    .flatMap(content -> content.outputText().stream())
                    .forEach(outputText -> result.append(outputText.text()).append("\n"));

            logger.info("Received response from agent");
            return result.toString();

        } catch (Exception e) {
            logger.error("Error getting response from agent", e);
            return "خطأ في الحصول على الرد من الوكيل: " + e.getMessage();
        }
    }
}
```

## 3. تحديث ExpensesAgent.java للعمل مع Azure AI

```java
package com.microsoft.openai.samples.assistant.agents;

import dev.langchain4j.agent.tool.Tool;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.Map;

@Component
public class ExpensesAgent {

    private static final Logger logger = LoggerFactory.getLogger(ExpensesAgent.class);
    private final RestTemplate restTemplate;
    private final AgentManager agentManager;
    private static final String EXPENSES_SERVICE_URL = "${expenses.service.url:http://localhost:8084/api/expenses}";

    public ExpensesAgent(AgentManager agentManager) {
        this.restTemplate = new RestTemplate();
        this.agentManager = agentManager;
    }

    @Tool(value = "recordExpense")
    public String recordExpense(
            String userId,
            String amount,
            String category,
            String description,
            String paymentMethod) {
        try {
            logger.info("Recording expense for user: {}", userId);
            Map<String, Object> expense = new HashMap<>();
            expense.put("userId", userId);
            expense.put("amount", new BigDecimal(amount));
            expense.put("category", category);
            expense.put("description", description);
            expense.put("paymentMethod", paymentMethod != null ? paymentMethod : "CASH");
            expense.put("expenseDate", LocalDateTime.now());

            Map response = restTemplate.postForObject(EXPENSES_SERVICE_URL, expense, Map.class);
            return response != null ? "✅ تم تسجيل المصروف بنجاح" : "❌ خطأ في التسجيل";
        } catch (Exception e) {
            logger.error("Error recording expense", e);
            return "❌ خطأ: " + e.getMessage();
        }
    }

    @Tool(value = "getMonthlyExpenses")
    public String getMonthlyExpenses(String userId, String yearMonth) {
        try {
            String url = EXPENSES_SERVICE_URL + "/user/" + userId + "/month/" + yearMonth + "/total";
            Map response = restTemplate.getForObject(url, Map.class);
            if (response != null) {
                return String.format(
                    "📊 إجمالي المصروفات للشهر %s:\n💰 %s ريال",
                    yearMonth, response.get("totalExpenses")
                );
            }
            return "⚠️ لم يتم العثور على بيانات";
        } catch (Exception e) {
            return "❌ خطأ: " + e.getMessage();
        }
    }

    @Tool(value = "analyzeBudget")
    public String analyzeBudget(String userId, String yearMonth, String budgetAmount) {
        try {
            BigDecimal budget = new BigDecimal(budgetAmount);
            String url = EXPENSES_SERVICE_URL + "/user/" + userId + "/month/" + yearMonth + "/total";
            Map response = restTemplate.getForObject(url, Map.class);

            if (response != null) {
                BigDecimal spent = new BigDecimal(response.get("totalExpenses").toString());
                BigDecimal remaining = budget.subtract(spent);
                double percentageUsed = (spent.doubleValue() / budget.doubleValue()) * 100;

                return String.format(
                    "💳 تحليل الميزانية:\n" +
                    "💰 الميزانية: %s ريال\n" +
                    "💸 المصروف: %s ريال\n" +
                    "💵 المتبقي: %s ريال\n" +
                    "📈 الاستخدام: %.2f%%",
                    budget, spent, remaining, percentageUsed
                );
            }
            return "⚠️ لم يتم العثور على بيانات";
        } catch (Exception e) {
            return "❌ خطأ: " + e.getMessage();
        }
    }
}
```

## 4. تحديث application.properties

```properties
# Azure AI Agent Configuration
azure.agent.endpoint=https://az-ai-resource.services.ai.azure.com/api/projects/az-ai-gateway
azure.agent.name=az-agent-finance
azure.agent.version=5

# Expenses Service
expenses.service.url=http://localhost:8084/api/expenses

# Azure Credentials
azure.identity.client-id=${AZURE_CLIENT_ID}
azure.identity.client-secret=${AZURE_CLIENT_SECRET}
azure.identity.tenant-id=${AZURE_TENANT_ID}
```

## 5. إنشاء AgentController.java

```java
package com.microsoft.openai.samples.assistant.controller;

import com.microsoft.openai.samples.assistant.agents.AgentManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = "*")
public class AgentController {

    private final AgentManager agentManager;

    public AgentController(AgentManager agentManager) {
        this.agentManager = agentManager;
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askAgent(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        String response = agentManager.getAgentResponse(userMessage);

        Map<String, String> result = new HashMap<>();
        result.put("response", response);
        return ResponseEntity.ok(result);
    }
}
```

## 6. Docker Compose (تحديث)

```yaml
version: '3.8'

services:
  expenses:
    build:
      context: ./app/business-api/expenses
    ports:
      - "8084:8084"
    environment:
      SPRING_PROFILES_ACTIVE: dev

  copilot:
    build:
      context: ./app/copilot
    ports:
      - "8080:8080"
    environment:
      AZURE_AGENT_ENDPOINT: https://az-ai-resource.services.ai.azure.com/api/projects/az-ai-gateway
      AZURE_AGENT_NAME: az-agent-finance
      AZURE_AGENT_VERSION: 5
      AZURE_CLIENT_ID: ${AZURE_CLIENT_ID}
      AZURE_CLIENT_SECRET: ${AZURE_CLIENT_SECRET}
      AZURE_TENANT_ID: ${AZURE_TENANT_ID}
    depends_on:
      - expenses
```
