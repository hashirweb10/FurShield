-- ============================================================
-- FurShield Database Schema
-- MySQL 8.0+ compatible
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── Users & Profiles ──
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner','vet','shelter') NOT NULL DEFAULT 'owner',
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS owner_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  bio TEXT DEFAULT NULL,
  emergency_contact VARCHAR(30) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vet_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  specialization VARCHAR(255) DEFAULT 'General Veterinary Medicine',
  experience VARCHAR(100) DEFAULT NULL,
  qualifications TEXT DEFAULT NULL,
  clinic_name VARCHAR(255) DEFAULT NULL,
  license_number VARCHAR(100) DEFAULT NULL,
  consultation_fee DECIMAL(10,2) DEFAULT 0.00,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS shelter_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  shelter_name VARCHAR(255) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  operating_hours VARCHAR(255) DEFAULT NULL,
  capacity INT DEFAULT 0,
  website VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Pets ──
CREATE TABLE IF NOT EXISTS pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  species ENUM('Dog','Cat','Bird','Rabbit','Hamster','Fish','Reptile','Other') NOT NULL DEFAULT 'Dog',
  breed VARCHAR(100) DEFAULT NULL,
  age VARCHAR(50) DEFAULT NULL,
  gender ENUM('Male','Female') NOT NULL DEFAULT 'Male',
  weight DECIMAL(5,2) DEFAULT NULL,
  color VARCHAR(100) DEFAULT NULL,
  microchip_id VARCHAR(100) DEFAULT NULL,
  health_status VARCHAR(100) DEFAULT 'Healthy',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pet_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  is_primary TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Health Records ──
CREATE TABLE IF NOT EXISTS health_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  vet_id INT DEFAULT NULL,
  type ENUM('vaccination','allergy','illness','treatment','checkup','surgery','grooming','other') NOT NULL DEFAULT 'checkup',
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  date DATE NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_pet (pet_id),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vaccinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  vaccine_name VARCHAR(255) NOT NULL,
  date_administered DATE NOT NULL,
  next_due DATE DEFAULT NULL,
  batch_number VARCHAR(100) DEFAULT NULL,
  vet_id INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS allergies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  allergen VARCHAR(255) NOT NULL,
  severity ENUM('mild','moderate','severe') DEFAULT 'mild',
  symptoms TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS treatments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  vet_id INT DEFAULT NULL,
  diagnosis TEXT DEFAULT NULL,
  treatment_plan TEXT DEFAULT NULL,
  medications TEXT DEFAULT NULL,
  follow_up_date DATE DEFAULT NULL,
  status ENUM('active','completed','ongoing') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS medical_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  record_id INT DEFAULT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) DEFAULT NULL,
  file_type VARCHAR(50) DEFAULT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  FOREIGN KEY (record_id) REFERENCES health_records(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Insurance ──
CREATE TABLE IF NOT EXISTS insurance_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  provider VARCHAR(255) NOT NULL,
  policy_number VARCHAR(100) DEFAULT NULL,
  coverage_type VARCHAR(100) DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  premium DECIMAL(10,2) DEFAULT NULL,
  document_path VARCHAR(255) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Vet Specializations & Availability ──
CREATE TABLE IF NOT EXISTS vet_specializations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vet_id INT NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vet_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vet_id INT NOT NULL,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_vet_day (vet_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Appointments ──
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  vet_id INT NOT NULL,
  pet_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason TEXT DEFAULT NULL,
  status ENUM('pending','approved','rejected','completed','cancelled','rescheduled') DEFAULT 'pending',
  notes TEXT DEFAULT NULL,
  diagnosis TEXT DEFAULT NULL,
  treatment_notes TEXT DEFAULT NULL,
  medication TEXT DEFAULT NULL,
  follow_up VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  INDEX idx_owner (owner_id),
  INDEX idx_vet (vet_id),
  INDEX idx_status (status),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Products ──
CREATE TABLE IF NOT EXISTS product_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  image VARCHAR(255) DEFAULT NULL,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INT DEFAULT 0,
  is_featured TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Cart ──
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_product (cart_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Orders ──
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  shipping_address TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Adoption ──
CREATE TABLE IF NOT EXISTS adoption_listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shelter_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  species ENUM('Dog','Cat','Bird','Rabbit','Hamster','Other') DEFAULT 'Dog',
  breed VARCHAR(100) DEFAULT NULL,
  age VARCHAR(50) DEFAULT NULL,
  gender ENUM('Male','Female') DEFAULT 'Male',
  health_status VARCHAR(100) DEFAULT 'Healthy',
  description TEXT DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  adoption_status ENUM('available','pending','adopted','not_available') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shelter_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_shelter (shelter_id),
  INDEX idx_status (adoption_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS adoption_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  applicant_id INT NOT NULL,
  reason TEXT DEFAULT NULL,
  status ENUM('pending','approved','rejected','withdrawn') DEFAULT 'pending',
  shelter_response TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES adoption_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_listing (listing_id),
  INDEX idx_applicant (applicant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS adoption_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES adoption_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Shelter Care Logs ──
CREATE TABLE IF NOT EXISTS shelter_pet_care_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  shelter_id INT NOT NULL,
  type ENUM('feeding','grooming','medical','exercise','other') NOT NULL DEFAULT 'feeding',
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES adoption_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (shelter_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pet (pet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Care Center Content ──
CREATE TABLE IF NOT EXISTS care_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT NULL,
  content TEXT NOT NULL,
  image VARCHAR(255) DEFAULT NULL,
  author VARCHAR(255) DEFAULT NULL,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS care_faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS care_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail VARCHAR(255) DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  duration VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Notifications ──
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT DEFAULT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read TINYINT(1) DEFAULT 0,
  link VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Reviews ──
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  target_type ENUM('vet','product','shelter') NOT NULL,
  target_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Chat Messages ──
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Contact Submissions ──
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Password for all demo accounts: password123
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Users
INSERT INTO users (id, email, password_hash, role, full_name, phone, address) VALUES
(1, 'sarah@furshield.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner', 'Sarah Ahmed', '+92-300-1234567', '42-B Garden Town, Karachi'),
(2, 'ali@furshield.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner', 'Ali Hassan', '+92-321-9876543', '15 Clifton Block 4, Karachi'),
(3, 'dr.sarah@furshield.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vet', 'Dr. Sarah Ahmed', '+92-333-4567890', 'Pet Care Clinic, DHA Phase 5, Karachi'),
(4, 'dr.hamza@furshield.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vet', 'Dr. Hamza Khan', '+92-345-6789012', 'Animal Wellness Center, Gulshan-e-Iqbal, Karachi'),
(5, 'paws@furshield.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'shelter', 'Paws & Hope Shelter', '+92-21-34567890', 'Plot 22, Korangi Industrial Area, Karachi'),
(6, 'furever@furshield.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'shelter', 'Furever Home Rescue', '+92-21-98765432', 'Sector 7-C, North Karachi');

-- Owner Profiles
INSERT INTO owner_profiles (user_id, bio, emergency_contact) VALUES
(1, 'Proud parent of Luna and Coco. Passionate about holistic pet wellness.', '+92-300-9999999'),
(2, 'Animal lover and volunteer at local shelters. Milo is my best friend.', '+92-321-1111111');

-- Vet Profiles
INSERT INTO vet_profiles (user_id, specialization, experience, qualifications, clinic_name, consultation_fee, rating, total_reviews) VALUES
(3, 'Veterinary Medicine', '8 years', 'DVM, MS Veterinary Science', 'Pet Care Clinic', 2500.00, 4.9, 47),
(4, 'Pet Surgery', '12 years', 'DVM, PhD Animal Surgery', 'Animal Wellness Center', 3500.00, 4.8, 32);

-- Shelter Profiles
INSERT INTO shelter_profiles (user_id, shelter_name, description, operating_hours, capacity) VALUES
(5, 'Paws & Hope Shelter', 'A no-kill shelter dedicated to rescuing and rehoming abandoned animals in Karachi since 2018.', 'Mon-Sat 9AM-6PM', 80),
(6, 'Furever Home Rescue', 'Specializing in cat and small animal rescue with a focus on senior and special-needs pets.', 'Mon-Fri 10AM-5PM, Sat 10AM-2PM', 45);

-- Pets
INSERT INTO pets (id, owner_id, name, species, breed, age, gender, weight, health_status) VALUES
(1, 1, 'Luna', 'Dog', 'Golden Retriever', '3 Years', 'Female', 24.8, 'Healthy'),
(2, 1, 'Coco', 'Cat', 'Persian Cat', '1 Year', 'Female', 4.2, 'Healthy'),
(3, 2, 'Milo', 'Dog', 'Mixed Breed', '2 Years', 'Male', 18.5, 'Healthy'),
(4, 2, 'Kiwi', 'Bird', 'Cockatiel', '2 Years', 'Male', 0.1, 'Healthy');

-- Health Records
INSERT INTO health_records (pet_id, vet_id, type, title, description, date) VALUES
(1, 3, 'vaccination', 'Annual Vaccination', 'Rabies and DHPP booster administered. No adverse reactions.', '2025-05-14'),
(1, 3, 'checkup', 'Routine Health Checkup', 'Weight 24.8kg. Teeth clean, coat healthy. All vitals normal.', '2025-08-12'),
(1, 4, 'grooming', 'Professional Grooming', 'Full grooming session including nail trim and ear cleaning.', '2025-09-01'),
(2, 3, 'vaccination', 'FVRCP Vaccine', 'First FVRCP vaccine administered. Next due in 3 weeks.', '2025-06-20'),
(2, 3, 'checkup', 'Kitten Wellness Exam', 'Healthy weight gain. Playful and active. Recommended deworming.', '2025-07-15'),
(3, 4, 'treatment', 'Minor Skin Irritation', 'Mild dermatitis on belly. Prescribed medicated shampoo and antihistamine.', '2025-08-05'),
(3, 4, 'checkup', 'Follow-up Checkup', 'Skin irritation resolved. Coat looking healthy.', '2025-08-26');

-- Vaccinations
INSERT INTO vaccinations (pet_id, vaccine_name, date_administered, next_due, vet_id) VALUES
(1, 'Rabies', '2025-05-14', '2026-05-14', 3),
(1, 'DHPP', '2025-05-14', '2026-05-14', 3),
(1, 'Bordetella', '2025-05-14', '2025-11-14', 3),
(2, 'FVRCP', '2025-06-20', '2025-07-11', 3),
(2, 'Rabies', '2025-06-20', '2026-06-20', 3),
(3, 'Rabies', '2025-03-10', '2026-03-10', 4),
(3, 'DHPP', '2025-03-10', '2026-03-10', 4);

-- Vet Availability
INSERT INTO vet_availability (vet_id, day_of_week, start_time, end_time) VALUES
(3, 'Monday', '09:00', '17:00'), (3, 'Tuesday', '09:00', '17:00'), (3, 'Wednesday', '09:00', '17:00'),
(3, 'Thursday', '09:00', '17:00'), (3, 'Friday', '09:00', '14:00'), (3, 'Saturday', '10:00', '14:00'),
(4, 'Monday', '10:00', '18:00'), (4, 'Tuesday', '10:00', '18:00'), (4, 'Wednesday', '10:00', '18:00'),
(4, 'Thursday', '10:00', '18:00'), (4, 'Friday', '10:00', '15:00'), (4, 'Saturday', '10:00', '13:00');

-- Appointments
INSERT INTO appointments (owner_id, vet_id, pet_id, date, time, reason, status, diagnosis) VALUES
(1, 3, 1, '2025-09-12', '16:30', 'Annual vaccination and general checkup', 'completed', 'All vitals normal. Vaccinations up to date.'),
(1, 3, 2, '2025-09-20', '10:00', 'Kitten follow-up vaccination', 'approved', NULL),
(2, 4, 3, '2025-09-15', '14:00', 'Follow-up for skin condition', 'completed', 'Skin fully healed. Continue with regular grooming.'),
(1, 3, 1, '2025-10-05', '11:00', 'Dental cleaning consultation', 'pending', NULL),
(2, 4, 3, '2025-10-01', '15:30', 'General wellness checkup', 'pending', NULL);

-- Product Categories
INSERT INTO product_categories (id, name, slug, description) VALUES
(1, 'Nutrition', 'nutrition', 'Premium food and supplements'),
(2, 'Grooming', 'grooming', 'Shampoos, brushes, and grooming tools'),
(3, 'Toys', 'toys', 'Interactive and chew toys'),
(4, 'Health', 'health', 'Supplements and wellness products'),
(5, 'Accessories', 'accessories', 'Collars, leashes, beds, and carriers');

-- Products
INSERT INTO products (id, category_id, name, description, price, stock, image, rating, total_reviews, is_featured) VALUES
(1, 1, 'Premium Adult Dog Food', 'High-protein formula with real chicken and essential vitamins.', 4850.00, 50, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=700&q=80', 4.8, 23, 1),
(2, 2, 'Gentle Pet Shampoo', 'Oatmeal-based shampoo for sensitive skin.', 1450.00, 120, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=700&q=80', 4.7, 15, 0),
(3, 3, 'Interactive Chew Toy', 'Durable rubber toy that dispenses treats.', 1100.00, 80, 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=700&q=80', 4.9, 31, 0),
(4, 1, 'Organic Cat Food', 'Grain-free organic formula with real salmon.', 5200.00, 35, 'https://images.unsplash.com/photo-1588433312534-2b2b2b2b2b2b?auto=format&fit=crop&w=700&q=80', 4.6, 18, 1),
(5, 4, 'Joint Health Supplement', 'Glucosamine formula for senior dogs.', 2800.00, 60, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80', 4.5, 12, 0),
(6, 5, 'Comfortable Pet Bed', 'Memory foam bed with washable cover.', 6500.00, 25, 'https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&w=700&q=80', 4.8, 9, 0),
(7, 2, 'Deshedding Brush', 'Professional-grade brush reduces shedding by 90%.', 2200.00, 45, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=700&q=80', 4.7, 22, 0),
(8, 3, 'Feather Wand Toy', 'Interactive cat toy with natural feathers.', 850.00, 100, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=700&q=80', 4.6, 28, 0);

-- Carts
INSERT INTO cart (id, user_id) VALUES (1, 1), (2, 2);
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (1, 1, 2), (1, 3, 1), (2, 2, 1);

-- Orders
INSERT INTO orders (id, user_id, total, status, shipping_address, created_at) VALUES
(1, 1, 10800.00, 'delivered', '42-B Garden Town, Karachi', '2025-07-20 14:30:00'),
(2, 1, 6500.00, 'shipped', '42-B Garden Town, Karachi', '2025-08-15 10:00:00'),
(3, 2, 1450.00, 'delivered', '15 Clifton Block 4, Karachi', '2025-08-01 16:45:00');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 2, 4850.00), (1, 3, 1, 1100.00), (2, 6, 1, 6500.00), (3, 2, 1, 1450.00);

-- Adoption Listings
INSERT INTO adoption_listings (id, shelter_id, name, species, breed, age, gender, health_status, description, image, adoption_status) VALUES
(1, 5, 'Milo', 'Dog', 'Mixed Breed', '2 Years', 'Male', 'Healthy', 'Friendly and energetic. Fully vaccinated and neutered.', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1000&q=85', 'available'),
(2, 5, 'Bella', 'Bird', 'Cockatiel', '2 Years', 'Female', 'Healthy', 'Sweet cockatiel who loves to whistle. Comes with cage.', 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=900&q=85', 'available'),
(3, 5, 'Simba', 'Dog', 'Labrador', '4 Years', 'Male', 'Healthy', 'Calm and well-trained Labrador. Perfect family companion.', 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85', 'pending'),
(4, 6, 'Whiskers', 'Cat', 'Tabby', '3 Years', 'Male', 'Healthy', 'Affectionate tabby cat who loves lap time.', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1000&q=85', 'available'),
(5, 6, 'Snowball', 'Rabbit', 'Holland Lop', '1 Year', 'Female', 'Healthy', 'Adorable Holland Lop with floppy ears.', 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=85', 'adopted'),
(6, 5, 'Rocky', 'Dog', 'German Shepherd', '5 Years', 'Male', 'Recovering', 'Loyal GSD recovering from hip surgery.', 'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?auto=format&fit=crop&w=1000&q=85', 'available');

-- Adoption Applications
INSERT INTO adoption_applications (listing_id, applicant_id, reason, status) VALUES
(3, 1, 'We have a large backyard and would love an active dog like Simba.', 'pending'),
(1, 2, 'I have experience with mixed breeds and a secure yard.', 'approved'),
(4, 1, 'Looking for a calm indoor companion for our apartment.', 'pending');

-- Care Articles
INSERT INTO care_articles (title, category, content, author, views) VALUES
('Complete Guide to Dog Nutrition', 'Nutrition', 'A balanced diet is the foundation of your dogs health. Adult dogs typically need 25-30 calories per pound of body weight daily.', 'Dr. Sarah Ahmed', 342),
('Grooming Essentials for Every Pet', 'Grooming', 'Regular grooming keeps your pet comfortable and healthy. Dogs should be brushed 2-3 times per week.', 'Dr. Hamza Khan', 256),
('Understanding Pet Vaccinations', 'Health', 'Vaccinations protect your pet from serious diseases. Core vaccines include rabies, distemper, and parvovirus.', 'Dr. Sarah Ahmed', 489),
('Exercise and Mental Stimulation', 'Exercise', 'Most dogs need 30-60 minutes of exercise daily. Mental stimulation through puzzle toys is equally important.', 'Dr. Hamza Khan', 198),
('Preparing for Your First Vet Visit', 'Health', 'Bring medical records, list of current foods, and any concerns you have observed.', 'Dr. Sarah Ahmed', 315);

-- Care FAQs
INSERT INTO care_faqs (question, answer, category, sort_order) VALUES
('How often should I feed my dog?', 'Adult dogs should be fed twice a day. Puppies under 6 months need 3-4 meals daily.', 'Feeding', 1),
('When should I start vaccinating my puppy?', 'Puppies should receive their first vaccinations at 6-8 weeks of age.', 'Health', 2),
('How can I tell if my pet is overweight?', 'You should be able to feel ribs without pressing hard and see a visible waist.', 'Health', 3),
('How often should I groom my cat?', 'Short-haired cats benefit from weekly brushing; long-haired cats need daily brushing.', 'Grooming', 4),
('What human foods are toxic to dogs?', 'Chocolate, grapes, raisins, onions, garlic, xylitol, and alcohol are toxic to dogs.', 'Nutrition', 5);

-- Notifications
INSERT INTO notifications (user_id, title, message, type, created_at) VALUES
(1, 'Vaccination Due Tomorrow', 'Lunas Bordetella vaccine is due tomorrow.', 'vaccination', '2025-09-10 08:00:00'),
(1, 'Appointment Confirmed', 'Your appointment with Dr. Sarah on Sep 20 at 10:00 AM is confirmed.', 'appointment', '2025-09-09 14:30:00'),
(1, 'Order Shipped', 'Your order #2 has been shipped.', 'order', '2025-09-08 11:00:00'),
(2, 'Adoption Approved', 'Your application to adopt Milo has been approved!', 'adoption', '2025-09-07 16:00:00'),
(3, 'New Appointment Request', 'Sarah Ahmed requested an appointment for Oct 5.', 'appointment', '2025-09-05 10:30:00');

-- Reviews
INSERT INTO reviews (user_id, target_type, target_id, rating, comment, created_at) VALUES
(1, 'vet', 3, 5, 'Dr. Sarah is amazing with Luna. Very thorough and patient.', '2025-08-15'),
(2, 'vet', 4, 5, 'Dr. Hamza took excellent care of Milos skin condition.', '2025-08-28'),
(1, 'product', 1, 5, 'Luna loves this food! Great quality.', '2025-08-01'),
(2, 'product', 2, 5, 'Perfect shampoo for Milos sensitive skin.', '2025-08-05'),
(1, 'shelter', 5, 5, 'Wonderful shelter. They truly care about the animals.', '2025-09-01');
