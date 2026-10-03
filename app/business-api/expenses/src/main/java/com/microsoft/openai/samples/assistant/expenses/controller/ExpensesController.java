package com.microsoft.openai.samples.assistant.expenses.controller;

import com.microsoft.openai.samples.assistant.expenses.dto.ExpenseDTO;
import com.microsoft.openai.samples.assistant.expenses.service.ExpensesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpensesController {

    private final ExpensesService expensesService;

    public ExpensesController(ExpensesService expensesService) {
        this.expensesService = expensesService;
    }

    @PostMapping
    public ResponseEntity<ExpenseDTO> createExpense(@RequestBody ExpenseDTO dto) {
        return ResponseEntity.ok(expensesService.createExpense(dto));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ExpenseDTO>> listExpenses(@PathVariable String userId) {
        return ResponseEntity.ok(expensesService.getExpensesByUserId(userId));
    }

    @GetMapping("/user/{userId}/category/{category}")
    public ResponseEntity<List<ExpenseDTO>> listByCategory(@PathVariable String userId, @PathVariable String category) {
        return ResponseEntity.ok(expensesService.getExpensesByCategory(userId, category));
    }

    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<List<ExpenseDTO>> listByDateRange(
            @PathVariable String userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        return ResponseEntity.ok(expensesService.getExpensesByDateRange(userId, start, end));
    }

    @GetMapping("/user/{userId}/month/{yearMonth}/total")
    public ResponseEntity<Map<String, Object>> monthTotal(@PathVariable String userId, @PathVariable String yearMonth) {
        YearMonth ym = YearMonth.parse(yearMonth);
        BigDecimal total = expensesService.getTotalExpensesForMonth(userId, ym);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("yearMonth", yearMonth);
        response.put("totalExpenses", total);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/category/{category}/month/{yearMonth}/total")
    public ResponseEntity<Map<String, Object>> categoryMonthTotal(
            @PathVariable String userId,
            @PathVariable String category,
            @PathVariable String yearMonth) {

        YearMonth ym = YearMonth.parse(yearMonth);
        BigDecimal total = expensesService.getTotalExpensesByCategory(userId, category, ym);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("category", category);
        response.put("yearMonth", yearMonth);
        response.put("total", total);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(@PathVariable Long id, @RequestBody ExpenseDTO dto) {
        return ResponseEntity.ok(expensesService.updateExpense(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expensesService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
