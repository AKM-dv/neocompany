-- MySQL dump 10.13  Distrib 9.5.0, for macos26.1 (arm64)
--
-- Host: localhost    Database: service_booking
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'admin','$2b$12$s8CKvzsPVptNvZGVbf1DReYHhDUhBIy6Ux7Gp1xiGYyss/O2cWOru','2026-05-07 05:46:51');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `areas`
--

DROP TABLE IF EXISTS `areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `areas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `city_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `extra_fee` decimal(10,2) DEFAULT '0.00',
  `avg_eta_minutes` int DEFAULT '60',
  `priority` int DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `city_id` (`city_id`),
  CONSTRAINT `areas_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
INSERT INTO `areas` VALUES (1,1,'Downtown',1,'',0.00,60,0,NULL),(2,2,'Downtown',1,'400000',0.00,45,0,'Demo coverage area'),(3,2,'Central',1,'400001',10.00,50,1,'Demo coverage area'),(4,2,'North Zone',1,'400002',20.00,55,2,'Demo coverage area'),(5,2,'West End',1,'400003',30.00,60,3,'Demo coverage area'),(6,3,'Connaught',1,'400010',0.00,45,0,'Demo coverage area'),(7,3,'South Block',1,'400011',10.00,50,1,'Demo coverage area'),(8,3,'Dwarka',1,'400012',20.00,55,2,'Demo coverage area'),(9,3,'Rohini',1,'400013',30.00,60,3,'Demo coverage area'),(10,4,'Indiranagar',1,'400020',0.00,45,0,'Demo coverage area'),(11,4,'Whitefield',1,'400021',10.00,50,1,'Demo coverage area'),(12,4,'HSR',1,'400022',20.00,55,2,'Demo coverage area'),(13,4,'Jayanagar',1,'400023',30.00,60,3,'Demo coverage area'),(14,5,'Baner',1,'400030',0.00,45,0,'Demo coverage area'),(15,5,'Kothrud',1,'400031',10.00,50,1,'Demo coverage area'),(16,5,'Viman Nagar',1,'400032',20.00,55,2,'Demo coverage area'),(17,5,'Hadapsar',1,'400033',30.00,60,3,'Demo coverage area');
/*!40000 ALTER TABLE `areas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `author_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `author_avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `tags` longtext COLLATE utf8mb4_unicode_ci,
  `featured_image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `read_time_minutes` int DEFAULT '5',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_published` tinyint(1) DEFAULT '1',
  `published_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES (1,'Demo Blog Post 1','demo-blog-1','Demo meta description for blog card preview','Demo excerpt for listing preview.','Admin Team','','Guides','[\"demo\", \"tips\"]','https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop','<h2>Demo Heading</h2><p>This is demo blog content for preview in admin and user panels.</p>',6,1,1,'2026-05-08 01:13:24','2026-05-08 01:13:24','2026-05-08 01:13:24'),(2,'Demo Blog Post 2','demo-blog-2','Demo meta description for blog card preview','Demo excerpt for listing preview.','Admin Team','','Guides','[\"demo\", \"tips\"]','https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop','<h2>Demo Heading</h2><p>This is demo blog content for preview in admin and user panels.</p>',7,0,1,'2026-05-08 01:13:24','2026-05-08 01:13:24','2026-05-08 01:13:24'),(3,'Demo Blog Post 3','demo-blog-3','Demo meta description for blog card preview','Demo excerpt for listing preview.','Admin Team','','Guides','[\"demo\", \"tips\"]','https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop','<h2>Demo Heading</h2><p>This is demo blog content for preview in admin and user panels.</p>',8,0,1,'2026-05-08 01:13:24','2026-05-08 01:13:24','2026-05-08 01:13:24'),(4,'Demo Blog Post 4','demo-blog-4','Demo meta description for blog card preview','Demo excerpt for listing preview.','Admin Team','','Guides','[\"demo\", \"tips\"]','https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop','<h2>Demo Heading</h2><p>This is demo blog content for preview in admin and user panels.</p>',9,0,1,'2026-05-08 01:13:24','2026-05-08 01:13:24','2026-05-08 01:13:24'),(5,'Tech is not future , its Present','tech-is-not-future-its-present','this is description','','Aakarshan','','Tech','[\"tech\", \"arena\", \"future\"]','http://127.0.0.1:5001/uploads/7c636f9fd3b33c43.png','<h2><span style=\"color: rgb(0, 0, 0);\">Insights, Ideas &amp; Digital Growth Strategies</span></h2><p><span style=\"color: rgb(0, 0, 0);\">Welcome to the Neighshop Global Blog — your source for insights on software development, modern UI/UX, business growth, mobile apps, SaaS platforms, and emerging digital trends.</span></p><p><span style=\"color: rgb(0, 0, 0);\">We share practical knowledge, industry updates, development strategies, and real-world solutions to help businesses grow smarter in the digital era.</span></p><p><span style=\"color: rgb(0, 0, 0);\">Whether you\'re a startup founder, local business owner, or growing brand, our blog is designed to provide actionable content that helps you make better technology decisions.</span></p><h2><span style=\"color: rgb(0, 0, 0);\">What You’ll Find Here</span></h2><h3><span style=\"color: rgb(0, 0, 0);\">Website &amp; App Development</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Latest trends, frameworks, performance optimization tips, and scalable development strategies.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">UI/UX &amp; Design</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Modern design inspiration, conversion-focused layouts, animation trends, and user experience best practices.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">SaaS &amp; Startup Growth</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Product validation, MVP development, scaling strategies, and SaaS architecture insights.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Business &amp; Automation</span></h3><p><span style=\"color: rgb(0, 0, 0);\">How businesses can automate operations, improve customer experience, and increase efficiency using technology.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Marketing &amp; Conversion</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Landing page optimization, SEO basics, lead generation techniques, and high-converting digital experiences.</span><img src=\"http://127.0.0.1:5001/uploads/279fbba8eb14ffff.jpeg\"></p><h2><span style=\"color: rgb(0, 0, 0);\">Why We Share Content</span></h2><p><span style=\"color: rgb(0, 0, 0);\">At Neighshop Global, we believe knowledge should create value. Our goal is to simplify complex technical concepts and provide practical guidance that businesses can actually use.</span></p><p><span style=\"color: rgb(0, 0, 0);\">Every article is created to help entrepreneurs and brands stay ahead in a rapidly evolving digital landscape.</span></p><h2><span style=\"color: rgb(0, 0, 0);\">Stay Updated</span></h2><p><span style=\"color: rgb(0, 0, 0);\">We regularly publish fresh content covering technology, design, development, business growth, and digital innovation.</span></p><p><span style=\"color: rgb(0, 0, 0);\">Follow our blog and stay connected with the latest ideas shaping the future of digital products.</span></p><p><br></p><p><br></p>',5,1,1,'2026-05-08 03:02:46','2026-05-08 03:03:07','2026-05-08 03:02:46');
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_items`
--

DROP TABLE IF EXISTS `booking_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `service_id` int NOT NULL,
  `service_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `booking_items_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `booking_items_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_items`
--

LOCK TABLES `booking_items` WRITE;
/*!40000 ALTER TABLE `booking_items` DISABLE KEYS */;
INSERT INTO `booking_items` VALUES (1,1,1,'Deep Home Cleaning',129.00,1),(7,7,1,'Deep Home Cleaning',129.00,1),(13,13,1,'Deep Home Cleaning',129.00,1),(19,19,1,'Deep Home Cleaning',129.00,1),(25,25,1,'Deep Home Cleaning',129.00,2),(26,25,2,'AC REPAIR AND MAINTENANCE',300.00,2),(28,26,2,'AC REPAIR AND MAINTENANCE',300.00,1),(30,27,2,'AC REPAIR AND MAINTENANCE',300.00,3),(32,29,2,'AC REPAIR AND MAINTENANCE',300.00,1);
/*!40000 ALTER TABLE `booking_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_ref` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city_id` int NOT NULL,
  `area_id` int NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'COD',
  `status` enum('pending','confirmed','in_progress','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `admin_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `user_latitude` decimal(10,7) DEFAULT NULL,
  `user_longitude` decimal(10,7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_ref` (`booking_ref`),
  KEY `city_id` (`city_id`),
  KEY `area_id` (`area_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'4HG94O0O','Demo Customer 1','demo1@example.com','+91-9810000000',2,2,'Demo Address Line 1','2026-05-08','09:00:00',59.00,'COD','pending',NULL,'2026-05-08 01:13:24',NULL,NULL),(7,'V3OOO9RW','Demo Customer 7','demo7@example.com','+91-9810000006',4,12,'Demo Address Line 7','2026-05-02','15:00:00',59.00,'COD','confirmed',NULL,'2026-05-08 01:13:24',NULL,NULL),(13,'KBPIRQ96','Demo Customer 13','demo13@example.com','+91-9810000012',2,2,'Demo Address Line 13','2026-05-06','13:00:00',59.00,'COD','in_progress',NULL,'2026-05-08 01:13:24',NULL,NULL),(19,'TLFM5HQ1','Demo Customer 19','demo19@example.com','+91-9810000018',4,12,'Demo Address Line 19','2026-04-30','11:00:00',59.00,'COD','completed',NULL,'2026-05-08 01:13:24',NULL,NULL),(25,'PP9DWVGA','AAKARSHAN','legendmishra05@gmail.com','9312539820',1,1,'JAIPUR J SCEHEME, J STARTUP HOUSE','2026-05-08','09:00:00',957.00,'COD','pending',NULL,'2026-05-08 01:56:58',26.9006119,75.7949066),(26,'YFO304AL','AKM','','6765456452',1,1,'JAIPUR C SCHEME','2026-05-08','09:00:00',300.00,'COD','pending',NULL,'2026-05-08 01:59:58',26.9006119,75.7949066),(27,'FKL9GN7Z','AKARSHAN','','5656523423321',1,1,'dsd','2026-05-08','10:00:00',1098.00,'COD','pending',NULL,'2026-05-08 02:41:10',26.9006119,75.7949066),(29,'I021FCL2','Test User','test.user@example.com','9999999999',1,1,'Test checkout address, Demo Street','2026-05-08','10:00:00',300.00,'COD','pending',NULL,'2026-05-08 02:52:59',19.0760000,72.8777000);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bug_reports`
--

DROP TABLE IF EXISTS `bug_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bug_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `page_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bug_reports`
--

LOCK TABLES `bug_reports` WRITE;
/*!40000 ALTER TABLE `bug_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `bug_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `is_active` tinyint(1) DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `priority` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (3,'Repairing and Maintenance','',1,'Get fast, reliable, and hassle-free repair services right at your doorstep. Our on-demand home delivery and repair platform connects customers with verified technicians for appliances, electronics, gadgets, and home utility repairs in just a few clicks.','http://127.0.0.1:5001/uploads/6c3be206b17eb7d5.png',1),(4,'Home Cleaning','',1,'Professional deep and regular cleaning','http://127.0.0.1:5001/uploads/37655925996ec155.png',0),(5,'Appliance Repair','',1,'Quick fix by verified technicians','http://127.0.0.1:5001/uploads/b3f3ae29a9223fc4.png',1),(6,'Beauty & Wellness','',1,'Salon and wellness at home','http://127.0.0.1:5001/uploads/85fda57b46f6e729.png',2);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `state` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `country` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `support_phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `base_fee` decimal(10,2) DEFAULT '0.00',
  `min_booking_amount` decimal(10,2) DEFAULT '0.00',
  `avg_eta_minutes` int DEFAULT '60',
  `priority` int DEFAULT '0',
  `city_pincode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Metro City',1,'','','',0.00,0.00,60,0,''),(2,'Mumbai',1,'State','India','+91-9999999999',49.00,199.00,60,0,'400001'),(3,'Delhi',1,'State','India','+91-9999999999',49.00,199.00,60,1,'400001'),(4,'Bengaluru',1,'State','India','+91-9999999999',49.00,199.00,60,2,'400001'),(5,'Pune',1,'State','India','+91-9999999999',49.00,199.00,60,3,'400001');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_settings`
--

DROP TABLE IF EXISTS `cms_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cms_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` longtext COLLATE utf8mb4_unicode_ci,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=318 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_settings`
--

LOCK TABLES `cms_settings` WRITE;
/*!40000 ALTER TABLE `cms_settings` DISABLE KEYS */;
INSERT INTO `cms_settings` VALUES (1,'site_name','NEO COMPANY','2026-05-08 03:41:43'),(2,'logo_url','http://127.0.0.1:5001/uploads/b0119bb92f540465.png','2026-05-08 03:41:43'),(3,'primary_color','#111111','2026-05-08 03:39:47'),(4,'secondary_color','#3A3A3A','2026-05-08 03:39:47'),(5,'accent_color','#2563EB','2026-05-08 03:39:47'),(6,'surface_color','#F5F5F5','2026-05-08 03:39:47'),(7,'font_family','Inter','2026-05-08 03:39:47'),(8,'button_radius','8','2026-05-08 03:39:47'),(9,'hero_image','http://127.0.0.1:5001/uploads/e0c55e03e50b8636.png','2026-05-08 03:43:58'),(10,'hero_headline','Premium care for your home & life','2026-05-08 03:43:58'),(11,'hero_subheadline','Book trusted professionals across multiple cities. Pay when we arrive.','2026-05-08 03:43:58'),(12,'hero_cta_text','Explore Services','2026-05-08 03:43:58'),(13,'hero_cta_link','/services','2026-05-08 03:43:58'),(14,'hero_badge','Trusted in 12+ cities','2026-05-08 03:43:58'),(15,'footer_brand_text','Professional services delivered with care.','2026-05-07 05:46:51'),(16,'footer_copyright','All rights reserved.','2026-05-07 05:46:51'),(17,'footer_powered','Made with care','2026-05-07 05:46:51'),(18,'social_links','[]','2026-05-07 05:46:51'),(19,'trust_stats','[{\"icon\":\"check\",\"label\":\"500+ Services\"},{\"icon\":\"star\",\"label\":\"4.8 Rating\"},{\"icon\":\"city\",\"label\":\"12 Cities\"},{\"icon\":\"lock\",\"label\":\"Verified Professionals\"}]','2026-05-07 05:46:51'),(20,'how_it_works','[{\"title\":\"Browse\",\"desc\":\"Explore services by category and city.\"},{\"title\":\"Book\",\"desc\":\"Add to cart and pick a convenient slot.\"},{\"title\":\"Relax\",\"desc\":\"We confirm and arrive — pay on delivery.\"}]','2026-05-07 05:46:51'),(21,'about_html','<h2><span style=\"color: rgb(0, 0, 0);\">Building Digital Products That Actually Drive Business</span></h2><p><span style=\"color: rgb(0, 0, 0);\">At </span><strong style=\"color: rgb(0, 0, 0);\">Neighshop Global</strong><span style=\"color: rgb(0, 0, 0);\">, we help businesses launch modern websites, scalable web applications, and powerful mobile apps designed for growth. We are a software development agency focused on creating high-performance digital products with clean UI, fast performance, and real business impact.</span></p><p><span style=\"color: rgb(0, 0, 0);\">From startups to local service businesses, we work closely with clients to transform ideas into production-ready platforms that are visually modern, technically strong, and optimized for conversions.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">What We Do</span></h2><p><span style=\"color: rgb(0, 0, 0);\">We specialize in:</span></p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Custom Website Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Mobile App Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">SaaS Product Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Service Booking Platforms</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Admin Dashboards &amp; Vendor Panels</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">E-Commerce Solutions</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">UI/UX Design</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">API &amp; Backend Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Maintenance &amp; Technical Support</span></li></ol><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Our Approach</span></h2><p><span style=\"color: rgb(0, 0, 0);\">We believe great software should be:</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Fast</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Optimized for speed, responsiveness, and smooth user experience across all devices.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Scalable</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Built with clean architecture so your platform can grow with your business.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Modern</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Designed using current UI/UX standards with engaging interactions and professional branding.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Business-Focused</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Every feature is developed with one goal — helping your business generate more leads, customers, and revenue.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Why Choose Us</span></h2><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Modern Premium UI Design</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Affordable Development Solutions</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Fast Project Delivery</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Mobile-First Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">SEO &amp; Performance Optimized</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">End-to-End Support</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Transparent Communication</span></li></ol><p><span style=\"color: rgb(0, 0, 0);\">We don’t just create software — we build digital experiences that help businesses stand out in competitive markets.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Our Mission</span></h2><p><span style=\"color: rgb(0, 0, 0);\">Our mission is to make high-quality digital solutions accessible to businesses of all sizes. We aim to bridge the gap between powerful technology and practical business needs through reliable, scalable, and visually exceptional products.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Let’s Build Something Great</span></h2><p><span style=\"color: rgb(0, 0, 0);\">Whether you need a business website, booking platform, SaaS application, or mobile app, Neighshop Global is ready to help bring your vision to life.</span></p><p><strong style=\"color: rgb(0, 0, 0);\">Your idea. Our execution. Real results.</strong></p><h2><br></h2>','2026-05-08 02:24:07'),(22,'contact_html','<h2><span style=\"color: rgb(0, 0, 0);\">Building Digital Products That Actually Drive Business</span></h2><p><span style=\"color: rgb(0, 0, 0);\">At </span><strong style=\"color: rgb(0, 0, 0);\">Neighshop Global</strong><span style=\"color: rgb(0, 0, 0);\">, we help businesses launch modern websites, scalable web applications, and powerful mobile apps designed for growth. We are a software development agency focused on creating high-performance digital products with clean UI, fast performance, and real business impact.</span></p><p><span style=\"color: rgb(0, 0, 0);\">From startups to local service businesses, we work closely with clients to transform ideas into production-ready platforms that are visually modern, technically strong, and optimized for conversions.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">What We Do</span></h2><p><span style=\"color: rgb(0, 0, 0);\">We specialize in:</span></p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Custom Website Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Mobile App Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">SaaS Product Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Service Booking Platforms</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Admin Dashboards &amp; Vendor Panels</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">E-Commerce Solutions</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">UI/UX Design</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">API &amp; Backend Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Maintenance &amp; Technical Support</span></li></ol><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Our Approach</span></h2><p><span style=\"color: rgb(0, 0, 0);\">We believe great software should be:</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Fast</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Optimized for speed, responsiveness, and smooth user experience across all devices.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Scalable</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Built with clean architecture so your platform can grow with your business.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Modern</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Designed using current UI/UX standards with engaging interactions and professional branding.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Business-Focused</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Every feature is developed with one goal — helping your business generate more leads, customers, and revenue.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Why Choose Us</span></h2><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Modern Premium UI Design</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Affordable Development Solutions</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Fast Project Delivery</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Mobile-First Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">SEO &amp; Performance Optimized</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">End-to-End Support</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Transparent Communication</span></li></ol><p><span style=\"color: rgb(0, 0, 0);\">We don’t just create software — we build digital experiences that help businesses stand out in competitive markets.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Our Mission</span></h2><p><span style=\"color: rgb(0, 0, 0);\">Our mission is to make high-quality digital solutions accessible to businesses of all sizes. We aim to bridge the gap between powerful technology and practical business needs through reliable, scalable, and visually exceptional products.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Let’s Build Something Great</span></h2><p><span style=\"color: rgb(0, 0, 0);\">Whether you need a business website, booking platform, SaaS application, or mobile app, Neighshop Global is ready to help bring your vision to life.</span></p><p><strong style=\"color: rgb(0, 0, 0);\">Your idea. Our execution. Real results.</strong></p>','2026-05-08 02:24:04'),(23,'privacy_html','<h2><span style=\"color: rgb(0, 0, 0);\">Building Digital Products That Actually Drive Business</span></h2><p><span style=\"color: rgb(0, 0, 0);\">At </span><strong style=\"color: rgb(0, 0, 0);\">Neighshop Global</strong><span style=\"color: rgb(0, 0, 0);\">, we help businesses launch modern websites, scalable web applications, and powerful mobile apps designed for growth. We are a software development agency focused on creating high-performance digital products with clean UI, fast performance, and real business impact.</span></p><p><span style=\"color: rgb(0, 0, 0);\">From startups to local service businesses, we work closely with clients to transform ideas into production-ready platforms that are visually modern, technically strong, and optimized for conversions.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">What We Do</span></h2><p><span style=\"color: rgb(0, 0, 0);\">We specialize in:</span></p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Custom Website Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Mobile App Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">SaaS Product Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Service Booking Platforms</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Admin Dashboards &amp; Vendor Panels</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">E-Commerce Solutions</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">UI/UX Design</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">API &amp; Backend Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Maintenance &amp; Technical Support</span></li></ol><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Our Approach</span></h2><p><span style=\"color: rgb(0, 0, 0);\">We believe great software should be:</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Fast</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Optimized for speed, responsiveness, and smooth user experience across all devices.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Scalable</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Built with clean architecture so your platform can grow with your business.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Modern</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Designed using current UI/UX standards with engaging interactions and professional branding.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Business-Focused</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Every feature is developed with one goal — helping your business generate more leads, customers, and revenue.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Why Choose Us</span></h2><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Modern Premium UI Design</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Affordable Development Solutions</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Fast Project Delivery</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Mobile-First Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">SEO &amp; Performance Optimized</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">End-to-End Support</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Transparent Communication</span></li></ol><p><span style=\"color: rgb(0, 0, 0);\">We don’t just create software — we build digital experiences that help businesses stand out in competitive markets.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Our Mission</span></h2><p><span style=\"color: rgb(0, 0, 0);\">Our mission is to make high-quality digital solutions accessible to businesses of all sizes. We aim to bridge the gap between powerful technology and practical business needs through reliable, scalable, and visually exceptional products.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Let’s Build Something Great</span></h2><p><span style=\"color: rgb(0, 0, 0);\">Whether you need a business website, booking platform, SaaS application, or mobile app, Neighshop Global is ready to help bring your vision to life.</span></p><h2><strong style=\"color: rgb(0, 0, 0);\">Your idea. Our execution. Real results.</strong></h2>','2026-05-08 02:23:38'),(24,'terms_html','<h2><span style=\"color: rgb(0, 0, 0);\">Building Digital Products That Actually Drive Business</span></h2><p><span style=\"color: rgb(0, 0, 0);\">At </span><strong style=\"color: rgb(0, 0, 0);\">Neighshop Global</strong><span style=\"color: rgb(0, 0, 0);\">, we help businesses launch modern websites, scalable web applications, and powerful mobile apps designed for growth. We are a software development agency focused on creating high-performance digital products with clean UI, fast performance, and real business impact.</span></p><p><span style=\"color: rgb(0, 0, 0);\">From startups to local service businesses, we work closely with clients to transform ideas into production-ready platforms that are visually modern, technically strong, and optimized for conversions.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">What We Do</span></h2><p><span style=\"color: rgb(0, 0, 0);\">We specialize in:</span></p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Custom Website Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Mobile App Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">SaaS Product Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Service Booking Platforms</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Admin Dashboards &amp; Vendor Panels</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">E-Commerce Solutions</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">UI/UX Design</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">API &amp; Backend Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Maintenance &amp; Technical Support</span></li></ol><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Our Approach</span></h2><p><span style=\"color: rgb(0, 0, 0);\">We believe great software should be:</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Fast</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Optimized for speed, responsiveness, and smooth user experience across all devices.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Scalable</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Built with clean architecture so your platform can grow with your business.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Modern</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Designed using current UI/UX standards with engaging interactions and professional branding.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Business-Focused</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Every feature is developed with one goal — helping your business generate more leads, customers, and revenue.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Why Choose Us</span></h2><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Modern Premium UI Design</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Affordable Development Solutions</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Fast Project Delivery</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Mobile-First Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">SEO &amp; Performance Optimized</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">End-to-End Support</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Transparent Communication</span></li></ol><p><span style=\"color: rgb(0, 0, 0);\">We don’t just create software — we build digital experiences that help businesses stand out in competitive markets.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Our Mission</span></h2><p><span style=\"color: rgb(0, 0, 0);\">Our mission is to make high-quality digital solutions accessible to businesses of all sizes. We aim to bridge the gap between powerful technology and practical business needs through reliable, scalable, and visually exceptional products.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Let’s Build Something Great</span></h2><p><span style=\"color: rgb(0, 0, 0);\">Whether you need a business website, booking platform, SaaS application, or mobile app, Neighshop Global is ready to help bring your vision to life.</span></p><h2><strong style=\"color: rgb(0, 0, 0);\">Your idea. Our execution. Real results.</strong></h2>','2026-05-08 02:23:34'),(25,'refund_html','<h2><span style=\"color: rgb(0, 0, 0);\">Building Digital Products That Actually Drive Business</span></h2><p><span style=\"color: rgb(0, 0, 0);\">At </span><strong style=\"color: rgb(0, 0, 0);\">Neighshop Global</strong><span style=\"color: rgb(0, 0, 0);\">, we help businesses launch modern websites, scalable web applications, and powerful mobile apps designed for growth. We are a software development agency focused on creating high-performance digital products with clean UI, fast performance, and real business impact.</span></p><p><span style=\"color: rgb(0, 0, 0);\">From startups to local service businesses, we work closely with clients to transform ideas into production-ready platforms that are visually modern, technically strong, and optimized for conversions.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">What We Do</span></h2><p><span style=\"color: rgb(0, 0, 0);\">We specialize in:</span></p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Custom Website Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Mobile App Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">SaaS Product Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Service Booking Platforms</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Admin Dashboards &amp; Vendor Panels</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">E-Commerce Solutions</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">UI/UX Design</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">API &amp; Backend Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Maintenance &amp; Technical Support</span></li></ol><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Our Approach</span></h2><p><span style=\"color: rgb(0, 0, 0);\">We believe great software should be:</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Fast</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Optimized for speed, responsiveness, and smooth user experience across all devices.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Scalable</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Built with clean architecture so your platform can grow with your business.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Modern</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Designed using current UI/UX standards with engaging interactions and professional branding.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Business-Focused</span></h3><p><span style=\"color: rgb(0, 0, 0);\">Every feature is developed with one goal — helping your business generate more leads, customers, and revenue.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Why Choose Us</span></h2><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Modern Premium UI Design</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Affordable Development Solutions</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Fast Project Delivery</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Mobile-First Development</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">SEO &amp; Performance Optimized</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">End-to-End Support</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Transparent Communication</span></li></ol><p><span style=\"color: rgb(0, 0, 0);\">We don’t just create software — we build digital experiences that help businesses stand out in competitive markets.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Our Mission</span></h2><p><span style=\"color: rgb(0, 0, 0);\">Our mission is to make high-quality digital solutions accessible to businesses of all sizes. We aim to bridge the gap between powerful technology and practical business needs through reliable, scalable, and visually exceptional products.</span></p><p><br></p><h2><span style=\"color: rgb(0, 0, 0);\">Let’s Build Something Great</span></h2><p><span style=\"color: rgb(0, 0, 0);\">Whether you need a business website, booking platform, SaaS application, or mobile app, Neighshop Global is ready to help bring your vision to life.</span></p><h2><strong style=\"color: rgb(0, 0, 0);\">Your idea. Our execution. Real results.</strong></h2>','2026-05-08 02:23:30'),(26,'contact_phone','+91 8307802643','2026-05-08 02:24:04'),(27,'contact_email','hello@example.com','2026-05-08 02:24:04'),(28,'contact_address','JAIPUR, C-SCHEME','2026-05-08 02:24:04'),(29,'contact_map_embed','','2026-05-08 02:24:04'),(30,'contact_hours','Mon–Sat 9am–6pm','2026-05-07 05:46:51'),(85,'ui_theme_library','[{\"id\":\"ui_default\",\"name\":\"Default Premium\",\"layout_mode\":\"default\",\"theme_type\":\"react\"},{\"id\":\"ui_editorial\",\"name\":\"Editorial\",\"layout_mode\":\"editorial\",\"theme_type\":\"react\"},{\"id\":\"ui_compact\",\"name\":\"Compact SaaS\",\"layout_mode\":\"compact\",\"theme_type\":\"react\"},{\"id\":\"ui_spacious\",\"name\":\"Spacious Luxury\",\"layout_mode\":\"spacious\",\"theme_type\":\"react\"}]','2026-05-08 02:02:53'),(95,'active_palette_id','','2026-05-08 01:33:06'),(102,'primary_font_family','Inter','2026-05-08 03:39:47'),(103,'secondary_font_family','Roboto','2026-05-08 03:39:47'),(104,'primary_text_scale','1.02','2026-05-08 03:39:47'),(105,'secondary_text_scale','1','2026-05-08 03:39:47'),(113,'hero_banners','[{\"image_url\":\"http://127.0.0.1:5001/uploads/3896171313d0cd1e.png\",\"link\":\"/services\",\"badge\":\"Trusted in 12+ cities\",\"title\":\"Premium care for your home & life\",\"subtitle\":\"Book trusted professionals across multiple cities. Pay when we arrive.\",\"button_text\":\"Explore Services\",\"show_accent_overlay\":false},{\"image_url\":\"http://127.0.0.1:5001/uploads/3d9f370766de8c91.png\",\"link\":\"/services\",\"badge\":\"\",\"title\":\"\",\"subtitle\":\"\",\"button_text\":\"\",\"show_accent_overlay\":false}]','2026-05-08 03:43:58'),(151,'brand_description','Providing best On-Demand Home Services','2026-05-08 03:41:43'),(152,'company_gst','','2026-05-08 03:41:43'),(153,'currency_code','INR','2026-05-08 03:41:43'),(208,'whatsapp_enabled','true','2026-05-08 03:41:43'),(209,'whatsapp_number','+918307802643','2026-05-08 03:41:43'),(298,'favicon_url','http://127.0.0.1:5001/uploads/75d54afd6731d5ae.png','2026-05-08 03:41:43'),(299,'og_image_url','http://127.0.0.1:5001/uploads/408f9d9f2a9a400b.png','2026-05-08 03:41:43'),(301,'site_tagline','DEMO FOR URBANCOMPANY WEBSITE','2026-05-08 03:41:43'),(302,'browser_title','','2026-05-08 03:41:43'),(303,'og_title','','2026-05-08 03:41:43'),(309,'booking_hour_start','6','2026-05-08 03:41:43'),(310,'booking_hour_end','23','2026-05-08 03:41:43');
/*!40000 ALTER TABLE `cms_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `page_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `duration_minutes` int NOT NULL DEFAULT '60',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `is_active` tinyint(1) DEFAULT '1',
  `image_urls` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,3,'Deep Home Cleaning','<p><span style=\"color: rgb(0, 0, 0);\">Transform your home with our professional deep cleaning service designed to remove hidden dirt, stubborn stains, dust buildup, and harmful germs from every corner of your space. Unlike regular cleaning, deep home cleaning focuses on detailed sanitization and intensive cleaning of hard-to-reach areas, ensuring a healthier, fresher, and more hygienic environment for your family.</span></p><p><span style=\"color: rgb(0, 0, 0);\">Our trained professionals use industry-grade equipment, safe cleaning solutions, and proven techniques to thoroughly clean bedrooms, kitchens, bathrooms, living areas, balconies, furniture surfaces, switches, doors, windows, and more. From grease removal and bathroom descaling to dust elimination and floor polishing, every part of your home receives special attention.</span></p><p><span style=\"color: rgb(0, 0, 0);\">Whether you are preparing for a festival, moving into a new house, hosting guests, or simply want a complete home refresh, our deep cleaning service delivers a spotless and revitalized living space with convenience and reliability.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">What’s Included</span></h3><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Complete room-by-room deep cleaning</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Bathroom scrubbing and sanitization</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Kitchen degreasing and surface cleaning</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Floor vacuuming, mopping, and stain removal</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Dust removal from furniture and corners</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Window, switchboard, and door cleaning</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Sofa and mattress surface dust cleaning</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Balcony and hard-to-reach area cleaning</span></li></ol><h3><span style=\"color: rgb(0, 0, 0);\">Why Choose Us</span></h3><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Verified and trained cleaning experts</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Eco-friendly and safe cleaning products</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Advanced tools and professional equipment</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Affordable pricing with transparent service</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">On-time and hassle-free service experience</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Suitable for apartments, villas, and offices</span></li></ol><p><span style=\"color: rgb(0, 0, 0);\">Enjoy a cleaner, healthier, and more comfortable home with our reliable deep home cleaning service. Book now and experience professional cleaning at your doorstep.</span></p><p><br></p>',129.00,180,'http://127.0.0.1:5001/uploads/f37575413b97cec3.png',1,'[\"http://127.0.0.1:5001/uploads/f37575413b97cec3.png\", \"http://127.0.0.1:5001/uploads/a5d26c195418f28d.png\"]'),(2,3,'AC REPAIR AND MAINTENANCE','<p><span style=\"color: rgb(0, 0, 0);\">Stay cool and comfortable with our professional AC repair and maintenance services. We provide fast, reliable, and affordable air conditioner repair solutions right at your doorstep. Our certified technicians are experienced in handling all major AC brands and models, ensuring efficient diagnosis and long-lasting repairs.</span></p><p><span style=\"color: rgb(0, 0, 0);\">Whether your AC is not cooling properly, making unusual noises, leaking water, or facing power issues, we offer quick troubleshooting and same-day service support to restore optimal performance.</span></p><h3><span style=\"color: rgb(0, 0, 0);\">Our AC Services Include</span></h3><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">AC Repair &amp; Troubleshooting</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">AC Installation &amp; Uninstallation</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Gas Refilling &amp; Leak Detection</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Regular AC Maintenance &amp; Servicing</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Cooling Issue Fixes</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Indoor &amp; Outdoor Unit Cleaning</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Compressor &amp; PCB Repair</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Split AC &amp; Window AC Service</span></li></ol><h3><span style=\"color: rgb(0, 0, 0);\">Why Choose Us?</span></h3><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Skilled and verified technicians</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Doorstep service with quick response time</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Affordable and transparent pricing</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Service warranty on repairs</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Support for all major AC brands</span></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span><span style=\"color: rgb(0, 0, 0);\">Emergency and same-day service available</span></li></ol><p><span style=\"color: rgb(0, 0, 0);\">We focus on delivering high-quality service, customer satisfaction, and efficient cooling solutions to keep your home and office comfortable throughout the year.</span></p><p><br></p>',300.00,60,'http://127.0.0.1:5001/uploads/6bc8b29640fc9d89.png',1,'[\"http://127.0.0.1:5001/uploads/6bc8b29640fc9d89.png\", \"http://127.0.0.1:5001/uploads/d19341545fdfcc2e.jpeg\"]');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'service_booking'
--

--
-- Dumping routines for database 'service_booking'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-08  3:54:09
