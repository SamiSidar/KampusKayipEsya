-- ═══════════════════════════════════════════
-- V1: Baseline Migration — Mevcut şema
-- ═══════════════════════════════════════════
-- Bu migration, Hibernate ddl-auto=update ile oluşturulan
-- mevcut veritabanı şemasının Flyway baseline'ıdır.
-- Mevcut veritabanlarında baseline-on-migrate=true ile atlanır.
-- Yeni veritabanlarında bu script tabloları oluşturur.

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('STUDENT', 'ADMIN') NOT NULL,
    student_number VARCHAR(255) UNIQUE,
    phone_number VARCHAR(255),
    department VARCHAR(255),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_code VARCHAR(255),
    verification_code_expires_at DATETIME(6),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS found_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category ENUM('ELECTRONICS','CLOTHING','ACCESSORIES','DOCUMENTS','KEYS','BAGS','BOOKS','SPORTS','OTHER') NOT NULL,
    location VARCHAR(255) NOT NULL,
    found_date DATE NOT NULL,
    status ENUM('WAITING_OWNER','CLAIMED','DELIVERED') NOT NULL,
    description TEXT,
    storage_location VARCHAR(255),
    image_url VARCHAR(500),
    created_by_id BIGINT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6),
    FOREIGN KEY (created_by_id) REFERENCES users(id),
    INDEX idx_found_items_status (status),
    INDEX idx_found_items_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lost_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category ENUM('ELECTRONICS','CLOTHING','ACCESSORIES','DOCUMENTS','KEYS','BAGS','BOOKS','SPORTS','OTHER') NOT NULL,
    lost_location VARCHAR(255) NOT NULL,
    lost_date DATE NOT NULL,
    description TEXT NOT NULL,
    status ENUM('PENDING','ACTIVE','REJECTED','REVISION_REQUESTED') NOT NULL,
    image_url VARCHAR(500),
    admin_note TEXT,
    student_id BIGINT,
    reviewed_by_id BIGINT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by_id) REFERENCES users(id),
    INDEX idx_lost_reports_status (status),
    INDEX idx_lost_reports_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS claim_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    distinguishing_feature VARCHAR(255) NOT NULL,
    additional_note TEXT,
    status ENUM('PENDING','APPROVED','REJECTED','REVISION_REQUESTED') NOT NULL,
    admin_note TEXT,
    reviewed_by_id BIGINT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6),
    FOREIGN KEY (item_id) REFERENCES found_items(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by_id) REFERENCES users(id),
    INDEX idx_claim_requests_item (item_id),
    INDEX idx_claim_requests_student (student_id),
    INDEX idx_claim_requests_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deliveries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    claim_id BIGINT,
    delivered_to_name VARCHAR(255) NOT NULL,
    delivered_to_student_number VARCHAR(255),
    delivered_by_id BIGINT,
    delivered_at DATETIME(6) NOT NULL,
    admin_note TEXT,
    FOREIGN KEY (item_id) REFERENCES found_items(id),
    FOREIGN KEY (claim_id) REFERENCES claim_requests(id),
    FOREIGN KEY (delivered_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('LOST_REPORT_STATUS','CLAIM_REQUEST_STATUS','DELIVERY','SYSTEM') NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    report_id BIGINT,
    item_id BIGINT,
    created_at DATETIME(6) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (report_id) REFERENCES lost_reports(id),
    FOREIGN KEY (item_id) REFERENCES found_items(id),
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS file_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL UNIQUE,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('FOUND_ITEM_IMAGE','LOST_REPORT_IMAGE') NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    uploaded_by_id BIGINT,
    created_at DATETIME(6) NOT NULL,
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_prt_token (token),
    INDEX idx_prt_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    family VARCHAR(36) NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_rt_token (token),
    INDEX idx_rt_family (family)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
