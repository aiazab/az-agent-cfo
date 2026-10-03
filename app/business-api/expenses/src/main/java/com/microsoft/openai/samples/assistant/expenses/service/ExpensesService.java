package com.microsoft.openai.samples.assistant.expenses.service;

import com.microsoft.openai.samples.assistant.expenses.dto.ExpenseDTO;
import com.microsoft.openai.samples.assistant.expenses.entity.ExpensesEntity;
import com.microsoft.openai.samples.assistant.expenses.repository.ExpensesRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpensesService {

    private final ExpensesRepository expensesRepository;

    public ExpensesService(ExpensesRepository expensesRepository) {
        this.expensesRepository = expensesRepository;
    }

    public ExpenseDTO createExpense(ExpenseDTO dto) {
        ExpensesEntity entity = new ExpensesEntity(
                dto.getUserId(),
                dto.getAmount(),
                dto.getCategory(),
                dto.getDescription(),
                dto.getExpenseDate() != null ? dto.getExpenseDate() : LocalDateTime.now()
        );

        if (dto.getPaymentMethod() != null) {
            entity.setPaymentMethod(dto.getPaymentMethod());
        }
        if (dto.getReceiptUrl() != null) {
            entity.setReceiptUrl(dto.getReceiptUrl());
        }

        return convertToDto(expensesRepository.save(entity));
    }

    public List<ExpenseDTO> getExpensesByUserId(String userId) {
        return expensesRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ExpenseDTO> getExpensesByCategory(String userId, String category) {
        return expensesRepository.findByUserIdAndCategory(userId, category).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ExpenseDTO> getExpensesByDateRange(String userId, LocalDateTime start, LocalDateTime end) {
        return expensesRepository.findByUserIdAndDateRange(userId, start, end).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ExpenseDTO updateExpense(Long id, ExpenseDTO dto) {
        ExpensesEntity entity = expensesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));

        if (dto.getUserId() != null) {
            entity.setUserId(dto.getUserId());
        }
        if (dto.getAmount() != null) {
            entity.setAmount(dto.getAmount());
        }
        if (dto.getCategory() != null) {
            entity.setCategory(dto.getCategory());
        }
        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }
        if (dto.getExpenseDate() != null) {
            entity.setExpenseDate(dto.getExpenseDate());
        }
        if (dto.getPaymentMethod() != null) {
            entity.setPaymentMethod(dto.getPaymentMethod());
        }
        if (dto.getReceiptUrl() != null) {
            entity.setReceiptUrl(dto.getReceiptUrl());
        }

        entity.setUpdatedAt(LocalDateTime.now());
        return convertToDto(expensesRepository.save(entity));
    }

    public void deleteExpense(Long id) {
        expensesRepository.deleteById(id);
    }

    public BigDecimal getTotalExpensesForMonth(String userId, YearMonth yearMonth) {
        LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime end = yearMonth.atEndOfMonth().atTime(23, 59, 59);
        BigDecimal value = expensesRepository.getTotalExpenses(userId, start, end);
        return value == null ? BigDecimal.ZERO : value;
    }

    public BigDecimal getTotalExpensesByCategory(String userId, String category, YearMonth yearMonth) {
        LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime end = yearMonth.atEndOfMonth().atTime(23, 59, 59);
        BigDecimal value = expensesRepository.getTotalExpensesByCategory(userId, category, start, end);
        return value == null ? BigDecimal.ZERO : value;
    }

    private ExpenseDTO convertToDto(ExpensesEntity entity) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setAmount(entity.getAmount());
        dto.setCategory(entity.getCategory());
        dto.setDescription(entity.getDescription());
        dto.setExpenseDate(entity.getExpenseDate());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setReceiptUrl(entity.getReceiptUrl());
        dto.setStatus(entity.getStatus());
        return dto;
    }
}
