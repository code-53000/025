-- 绘本馆活动管理系统数据库初始化脚本

CREATE DATABASE IF NOT EXISTS storyroom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE storyroom;

-- 活动类型表
CREATE TABLE IF NOT EXISTS activity_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 年龄段表
CREATE TABLE IF NOT EXISTS age_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    min_age INT NOT NULL,
    max_age INT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 馆员表
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 家长用户表
CREATE TABLE IF NOT EXISTS parents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(100) UNIQUE,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 孩子档案表
CREATE TABLE IF NOT EXISTS children (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    gender ENUM('boy', 'girl', 'unknown') DEFAULT 'unknown',
    birthday DATE NOT NULL,
    avatar VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 活动表
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    activity_type_id INT NOT NULL,
    age_group_id INT NOT NULL,
    teacher VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    max_participants INT NOT NULL,
    material_description TEXT,
    description TEXT,
    status ENUM('draft', 'published', 'canceled', 'completed') DEFAULT 'draft',
    staff_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_type_id) REFERENCES activity_types(id),
    FOREIGN KEY (age_group_id) REFERENCES age_groups(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    INDEX idx_activity_type (activity_type_id),
    INDEX idx_age_group (age_group_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 报名/候补表
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    child_id INT NOT NULL,
    parent_id INT NOT NULL,
    status ENUM('registered', 'waitlisted', 'canceled') DEFAULT 'registered',
    waitlist_position INT DEFAULT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    UNIQUE KEY uk_activity_child (activity_id, child_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_child_id (child_id),
    INDEX idx_status (status),
    INDEX idx_waitlist_position (waitlist_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 签到/请假表
CREATE TABLE IF NOT EXISTS attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    child_id INT NOT NULL,
    registration_id INT NOT NULL,
    status ENUM('signed', 'absent', 'leave') DEFAULT 'absent',
    sign_time TIMESTAMP NULL,
    leave_reason TEXT,
    staff_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    UNIQUE KEY uk_activity_child_attendance (activity_id, child_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_child_id (child_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 活动反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    child_id INT NOT NULL,
    parent_id INT NOT NULL,
    content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    INDEX idx_activity_id (activity_id),
    INDEX idx_child_id (child_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 材料库存表
CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 活动材料关联表
CREATE TABLE IF NOT EXISTS activity_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity_per_child INT NOT NULL DEFAULT 1,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    UNIQUE KEY uk_activity_material (activity_id, material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 材料消耗记录表
CREATE TABLE IF NOT EXISTS material_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity_used INT NOT NULL,
    staff_id INT NOT NULL,
    notes VARCHAR(255),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_material_id (material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初始化活动类型
INSERT INTO activity_types (name, description) VALUES
('故事会', '绘本故事讲述活动'),
('手工课', '创意手工制作活动'),
('亲子共读', '家长与孩子共同阅读活动'),
('科普活动', '科学知识普及活动'),
('艺术创作', '绘画、音乐等艺术活动')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 初始化年龄段
INSERT INTO age_groups (name, min_age, max_age, description) VALUES
('2-3岁', 2, 3, '幼儿小班'),
('3-4岁', 3, 4, '幼儿中班'),
('4-5岁', 4, 5, '幼儿大班'),
('5-6岁', 5, 6, '学前班'),
('6-8岁', 6, 8, '小学低年级')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 初始化默认馆员（密码：admin123）
INSERT INTO staff (username, password, name, phone, role) VALUES
('admin', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '管理员', '13800138000', 'admin')
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- 初始化默认家长（用于测试）
INSERT INTO parents (name, phone) VALUES
('张家长', '13900139000')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 初始化默认孩子档案（用于测试）
INSERT INTO children (parent_id, name, gender, birthday, notes) VALUES
(1, '小明', 'boy', '2020-05-15', '活泼好动，喜欢听故事'),
(1, '小红', 'girl', '2021-08-20', '安静内向，喜欢画画')
ON DUPLICATE KEY UPDATE name = VALUES(name);
