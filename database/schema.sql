-- Service Booking — MySQL 8.x schema
-- Run: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS service_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE service_booking;

-- ---------------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default admin: username `admin`, password `admin123` (bcrypt)
-- Replace in production via Python bcrypt or UPDATE after first login setup.
INSERT INTO admin_users (username, password_hash) VALUES
  ('admin', '$2b$12$s8CKvzsPVptNvZGVbf1DReYHhDUhBIy6Ux7Gp1xiGYyss/O2cWOru')
ON DUPLICATE KEY UPDATE username = username;

-- ---------------------------------------------------------------------------
-- cms_settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value LONGTEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed default CMS (JSON strings where noted)
INSERT INTO cms_settings (setting_key, setting_value) VALUES
  ('site_name', 'ServiceBook'),
  ('logo_url', ''),
  ('primary_color', '#1A1A2E'),
  ('secondary_color', '#16213E'),
  ('accent_color', '#E8622A'),
  ('surface_color', '#F7F5F0'),
  ('font_family', '"Syne", sans-serif'),
  ('button_radius', '10'),
  ('hero_image', ''),
  ('hero_headline', 'Premium care for your home & life'),
  ('hero_subheadline', 'Book trusted professionals across multiple cities. Pay when we arrive.'),
  ('hero_cta_text', 'Explore Services'),
  ('hero_cta_link', '/services'),
  ('hero_badge', 'Trusted in 12+ cities'),
  ('footer_brand_text', 'Professional services delivered with care.'),
  ('footer_copyright', 'All rights reserved.'),
  ('footer_powered', 'Made with care'),
  ('social_links', '[]'),
  ('trust_stats', '[{"icon":"check","label":"500+ Services"},{"icon":"star","label":"4.8 Rating"},{"icon":"city","label":"12 Cities"},{"icon":"lock","label":"Verified Professionals"}]'),
  ('how_it_works', '[{"title":"Browse","desc":"Explore services by category and city."},{"title":"Book","desc":"Add to cart and pick a convenient slot."},{"title":"Relax","desc":"We confirm and arrive — pay on delivery."}]'),
  ('about_html', '<h2>About Us</h2><p>We connect you with trusted service professionals.</p>'),
  ('contact_html', '<p>We would love to hear from you.</p>'),
  ('privacy_html', '<h2>Privacy Policy</h2><p>Your privacy matters.</p>'),
  ('terms_html', '<h2>Terms of Service</h2><p>Please read these terms.</p>'),
  ('refund_html', '<h2>Refund Policy</h2><p>Refund terms apply as stated.</p>'),
  ('contact_phone', '+1 (555) 000-0000'),
  ('contact_email', 'hello@example.com'),
  ('contact_address', '123 Service Lane, Metro City'),
  ('contact_map_embed', ''),
  ('contact_hours', 'Mon–Sat 9am–6pm')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(255) DEFAULT '',
  priority INT DEFAULT 0,
  icon_url VARCHAR(255) DEFAULT '',
  is_active TINYINT(1) DEFAULT 1
);

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 60,
  image_url VARCHAR(255) DEFAULT '',
  image_urls LONGTEXT,
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- blogs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  meta_description TEXT,
  excerpt TEXT,
  author_name VARCHAR(120) DEFAULT '',
  author_avatar_url VARCHAR(255) DEFAULT '',
  category VARCHAR(100) DEFAULT '',
  tags LONGTEXT,
  featured_image_url VARCHAR(255) DEFAULT '',
  content LONGTEXT,
  read_time_minutes INT DEFAULT 5,
  is_featured TINYINT(1) DEFAULT 0,
  is_published TINYINT(1) DEFAULT 1,
  published_at DATETIME NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- bug_reports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bug_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description TEXT NOT NULL,
  image_url VARCHAR(255) DEFAULT '',
  page_url VARCHAR(500) DEFAULT '',
  user_agent VARCHAR(500) DEFAULT '',
  status VARCHAR(20) DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL,
  subject VARCHAR(255) DEFAULT '',
  message TEXT NOT NULL,
  page_url VARCHAR(500) DEFAULT '',
  user_agent VARCHAR(500) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- cities & areas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state VARCHAR(120) DEFAULT '',
  country VARCHAR(120) DEFAULT '',
  support_phone VARCHAR(40) DEFAULT '',
  city_pincode VARCHAR(20) DEFAULT '',
  base_fee DECIMAL(10,2) DEFAULT 0,
  min_booking_amount DECIMAL(10,2) DEFAULT 0,
  avg_eta_minutes INT DEFAULT 60,
  priority INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) DEFAULT '',
  extra_fee DECIMAL(10,2) DEFAULT 0,
  avg_eta_minutes INT DEFAULT 60,
  priority INT DEFAULT 0,
  notes TEXT,
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_ref VARCHAR(20) NOT NULL UNIQUE,
  guest_name VARCHAR(150) NOT NULL,
  guest_email VARCHAR(150) NOT NULL,
  guest_phone VARCHAR(20) NOT NULL,
  city_id INT NOT NULL,
  area_id INT NOT NULL,
  address TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'COD',
  status ENUM('pending','confirmed','in_progress','completed','cancelled') DEFAULT 'pending',
  user_latitude DECIMAL(10,7) NULL,
  user_longitude DECIMAL(10,7) NULL,
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (area_id) REFERENCES areas(id)
);

CREATE TABLE IF NOT EXISTS booking_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  service_id INT NOT NULL,
  service_name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Sample seed data (first run only; ignore duplicates if re-importing)
INSERT IGNORE INTO cities (id, name, is_active) VALUES (1, 'Metro City', 1);
INSERT IGNORE INTO areas (id, city_id, name, is_active) VALUES (1, 1, 'Downtown', 1);
INSERT IGNORE INTO categories (id, name, description, image_url, priority, icon_url, is_active) VALUES
  (1, 'Cleaning', 'Home and office cleaning services.', '', 1, '', 1),
  (2, 'Repairs', 'General repair and maintenance services.', '', 2, '', 1);
INSERT IGNORE INTO services (id, category_id, name, description, price, duration_minutes, image_url, is_active)
VALUES (1, 1, 'Deep Home Cleaning', 'Full home deep clean including kitchen and baths.', 129.00, 180, '', 1);
