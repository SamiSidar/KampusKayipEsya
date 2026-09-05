package com.yeditepe.kampuskayipesya.repository;

import com.yeditepe.kampuskayipesya.entity.User;
import com.yeditepe.kampuskayipesya.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository — Kullanıcı veritabanı sorguları.
 *
 * Spring Data JPA sayesinde metot GÖVDESİ YAZILMAZ; metot adından SQL
 * otomatik üretilir. Örnek: findByEmail(String) →
 * SELECT * FROM users WHERE email = ?
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByStudentNumber(String studentNumber);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByStudentNumber(String studentNumber);

    List<User> findByRole(UserRole role);
}