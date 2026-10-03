package com.microsoft.openai.samples.assistant.expenses.repository;

import com.microsoft.openai.samples.assistant.expenses.entity.ExpensesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpensesRepository extends JpaRepository<ExpensesEntity, Long> {

    List<ExpensesEntity> findByUserId(String userId);

    List<ExpensesEntity> findByUserIdAndCategory(String userId, String category);

    @Query("SELECT e FROM ExpensesEntity e WHERE e.userId = :userId AND e.expenseDate BETWEEN :startDate AND :endDate")
    List<ExpensesEntity> findByUserIdAndDateRange(
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT SUM(e.amount) FROM ExpensesEntity e WHERE e.userId = :userId AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalExpenses(
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT SUM(e.amount) FROM ExpensesEntity e WHERE e.userId = :userId AND e.category = :category AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalExpensesByCategory(
            @Param("userId") String userId,
            @Param("category") String category,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
