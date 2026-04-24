-- Tabela para armazenar credenciais e configurações da API FortiGate
CREATE TABLE IF NOT EXISTS fortigate_api_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    api_enabled BOOLEAN DEFAULT FALSE,
    api_ip VARCHAR(255) NOT NULL,
    api_port INT DEFAULT 443,
    api_token_encrypted TEXT NOT NULL,
    verify_ssl BOOLEAN DEFAULT TRUE,
    sync_interval_minutes INT DEFAULT 60,
    last_sync_at DATETIME,
    last_sync_status ENUM('success', 'failed', 'pending', 'never') DEFAULT 'never',
    last_sync_error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES fortigate_devices(id) ON DELETE CASCADE,
    UNIQUE KEY unique_device (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para armazenar dados estendidos dos dispositivos FortiGate
CREATE TABLE IF NOT EXISTS fortigate_devices_extended (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    hostname VARCHAR(255),
    fortios_version VARCHAR(50),
    build_number VARCHAR(50),
    uptime_seconds BIGINT,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    session_count INT,
    license_status VARCHAR(50),
    forticare_status VARCHAR(50),
    forticare_expiration DATETIME,
    antivirus_status VARCHAR(50),
    antivirus_expiration DATETIME,
    ips_status VARCHAR(50),
    ips_expiration DATETIME,
    web_filtering_status VARCHAR(50),
    web_filtering_expiration DATETIME,
    application_control_status VARCHAR(50),
    application_control_expiration DATETIME,
    antispam_status VARCHAR(50),
    antispam_expiration DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES fortigate_devices(id) ON DELETE CASCADE,
    UNIQUE KEY unique_device (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para histórico de sincronizações
CREATE TABLE IF NOT EXISTS fortigate_sync_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    sync_started_at DATETIME NOT NULL,
    sync_completed_at DATETIME,
    status ENUM('success', 'failed', 'timeout', 'in_progress') DEFAULT 'in_progress',
    error_message TEXT,
    changes_detected JSON,
    data_synced JSON,
    duration_seconds DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES fortigate_devices(id) ON DELETE CASCADE,
    INDEX idx_device_date (device_id, sync_started_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para alertas de FortiGate
CREATE TABLE IF NOT EXISTS fortigate_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    alert_type ENUM('license_expiring', 'license_expired', 'device_offline', 'version_outdated', 'sync_failed') NOT NULL,
    severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at DATETIME,
    resolved_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES fortigate_devices(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_device_unread (device_id, is_read),
    INDEX idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
