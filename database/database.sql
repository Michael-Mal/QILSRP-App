CREATE DATABASE  IF NOT EXISTS `qilsrp` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `qilsrp`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: qilsrp
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cohort`
--

DROP TABLE IF EXISTS `cohort`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cohort` (
  `name` varchar(128) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cohort`
--

LOCK TABLES `cohort` WRITE;
/*!40000 ALTER TABLE `cohort` DISABLE KEYS */;
INSERT INTO `cohort` VALUES ('Cohort A - Brisbane North'),('Cohort B - Cairns');
/*!40000 ALTER TABLE `cohort` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation`
--

DROP TABLE IF EXISTS `conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation` (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `type` enum('cohort','group','direct') NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `conversation_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation`
--

LOCK TABLES `conversation` WRITE;
/*!40000 ALTER TABLE `conversation` DISABLE KEYS */;
INSERT INTO `conversation` VALUES (1,'direct',NULL,1,'2026-08-12 11:42:13'),(2,'cohort','Cohort A - Brisbane North',2,'2026-08-12 11:42:41'),(3,'group','Weekend Plan',3,'2026-08-12 11:43:15'),(4,'group','Event',1,'2026-08-12 11:44:35'),(5,'group','Frazer island weather warning',1,'2026-08-12 11:57:41');
/*!40000 ALTER TABLE `conversation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_member`
--

DROP TABLE IF EXISTS `conversation_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_member` (
  `conversation_member_id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_member_id`),
  UNIQUE KEY `uq_conversation_user` (`conversation_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `conversation_member_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`conversation_id`) ON DELETE CASCADE,
  CONSTRAINT `conversation_member_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_member`
--

LOCK TABLES `conversation_member` WRITE;
/*!40000 ALTER TABLE `conversation_member` DISABLE KEYS */;
INSERT INTO `conversation_member` VALUES (1,1,1,'2026-08-12 11:42:13'),(2,1,2,'2026-08-12 11:42:13'),(4,2,1,'2026-08-12 11:43:15'),(5,2,2,'2026-08-12 11:43:15'),(6,2,3,'2026-08-12 11:43:36'),(7,2,4,'2026-08-12 11:43:51'),(8,2,5,'2026-08-12 11:44:35'),(9,2,6,'2026-08-12 11:44:35'),(10,2,7,'2026-08-12 11:44:35'),(11,2,8,'2026-08-12 11:56:35'),(12,2,9,'2026-08-12 11:57:41'),(13,3,1,'2026-08-12 11:57:41'),(14,3,2,'2026-08-12 11:57:41'),(15,3,3,'2026-08-12 11:58:26');
/*!40000 ALTER TABLE `conversation_member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `datetime` datetime NOT NULL,
  `location` varchar(200) NOT NULL,
  `description` varchar(500) NOT NULL,
  PRIMARY KEY (`event_id`),
  UNIQUE KEY `event_id_UNIQUE` (`event_id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (1,1,'Planned Burn','2027-01-01 11:00:00','Archer Point Site','This planned burn will maintain the health of our bushland'),(2,1,'Personality Test','2027-02-02 12:00:00','Brisbane Site','This personality test allows rangers and students to understand their personality'),(3,1,'Pest Plant Control','2027-02-10 11:00:00','Balnggarrawarra (Melonsby)','Monitoring and eradication of invasive species of plants in the area'),(4,13,'Ranger Training','2026-09-23 23:30:00','Ranger Training Hub | Brisbane','Ice breaker activities and shared barbecue for dinner.');
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_member`
--

DROP TABLE IF EXISTS `event_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_member` (
  `event_id` int NOT NULL,
  `user_id` int NOT NULL,
  `confirmed` tinyint NOT NULL,
  PRIMARY KEY (`event_id`,`user_id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `event_id` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`),
  CONSTRAINT `member_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_member`
--

LOCK TABLES `event_member` WRITE;
/*!40000 ALTER TABLE `event_member` DISABLE KEYS */;
INSERT INTO `event_member` VALUES (1,1,1),(1,2,0),(1,3,1),(1,13,1),(2,1,1),(2,2,0),(2,3,1),(3,1,1),(3,2,0),(3,3,1),(4,1,0),(4,3,0),(4,13,1);
/*!40000 ALTER TABLE `event_member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `folder`
--

DROP TABLE IF EXISTS `folder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `folder` (
  `folder_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `cohorts` json NOT NULL DEFAULT (json_array()),
  `access_level` enum('student','ranger','admin') NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`folder_id`),
  KEY `parent_id_idx` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `folder`
--

LOCK TABLES `folder` WRITE;
/*!40000 ALTER TABLE `folder` DISABLE KEYS */;
INSERT INTO `folder` VALUES (1,'Root',NULL,'[\"Cohort A - Brisbane North\"]','student','2026-08-25 09:33:14'),(2,'Educational Guides',1,'[\"Cohort A - Brisbane North\"]','student','2026-08-25 15:39:47');
/*!40000 ALTER TABLE `folder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `text` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`conversation_id`) ON DELETE CASCADE,
  CONSTRAINT `message_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
INSERT INTO `message` VALUES (1,1,1,'Hello!','2026-10-02 13:08:04'),(2,1,2,'Hi!','2026-10-02 13:08:04'),(3,2,2,'Hello Cohort!','2026-10-02 13:08:04'),(4,2,3,'Excited to meet you all!','2026-10-02 13:08:04'),(5,3,1,'I was thinking about having a BBQ this weekend, are you guys interested?','2026-10-02 13:08:04'),(6,3,3,'That sounds fun!','2026-10-02 13:08:04');
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource`
--

DROP TABLE IF EXISTS `resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource` (
  `resource_id` int NOT NULL AUTO_INCREMENT,
  `type` enum('video','audio','image','pdf','document','spreadsheet','presentation') NOT NULL,
  `title` varchar(255) NOT NULL,
  `uploader_id` int NOT NULL,
  `extension` varchar(256) NOT NULL,
  `mime_type` varchar(128) DEFAULT NULL,
  `parent_id` int NOT NULL,
  `cohorts` json NOT NULL DEFAULT (json_array()),
  `access_level` enum('student','ranger','admin') NOT NULL,
  `status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
  `created` datetime NOT NULL,
  PRIMARY KEY (`resource_id`),
  KEY `uploader_id_idx` (`uploader_id`),
  KEY `parent_id_idx` (`parent_id`),
  CONSTRAINT `parent_id` FOREIGN KEY (`parent_id`) REFERENCES `folder` (`folder_id`),
  CONSTRAINT `uploader_id` FOREIGN KEY (`uploader_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource`
--

LOCK TABLES `resource` WRITE;
/*!40000 ALTER TABLE `resource` DISABLE KEYS */;
INSERT INTO `resource` VALUES (33,'pdf','Invasive Plant Species Visual Guide',13,'pdf','application/pdf',2,'[\"Cohort A - Brisbane North\"]','student','success','2026-09-06 05:16:49'),(43,'image','Administrator Guidelines',1,'png','image/png',1,'[\"Cohort A - Brisbane North\"]','admin','success','2026-09-09 09:53:20'),(49,'image','Introduction',1,'png','image/png',1,'[\"Cohort A - Brisbane North\"]','student','success','2026-09-09 09:53:20');
/*!40000 ALTER TABLE `resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `email` varchar(64) DEFAULT NULL,
  `mobile` varchar(16) DEFAULT NULL,
  `password_hash` varchar(256) NOT NULL,
  `status` varchar(16) NOT NULL,
  `created` datetime NOT NULL,
  `role` enum('admin','ranger','student') NOT NULL,
  `cohort` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `mobile_UNIQUE` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=1125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Melissa Stone','admin1@email.com','0400000000','$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Active','2026-06-22 03:28:40','admin',''),(2,'Philip Smith','ranger1@email.com','0411111111','$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Active','2026-06-22 01:34:38','ranger','Cohort A - Brisbane North'),(3,'Steve Fergusen','student1@email.com','0422222222','$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Active','2026-06-22 01:34:38','student','Cohort A - Brisbane North'),(4,'Sarah Walker','ranger2@email.com','0433333333','$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Active','2026-06-22 01:34:38','ranger','Cohort A - Brisbane North'),(5,'Gary Williams','ranger3@email.com','0444444444','$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Active','2026-06-22 01:58:07','ranger','Cohort A - Brisbane North'),(6,'Paisley Hall','ranger4@email.com','0455555555','$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Active','2026-06-22 02:54:29','ranger','Cohort A - Brisbane North'),(7,'Robert Williams','ranger5@email.com','0466666666','$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Active','2026-06-22 03:28:40','ranger','Cohort A - Brisbane North'),(8,'Desmond Cole',NULL,'0488888888','$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Active','2026-07-20 12:17:30','ranger','Cohort A - Brisbane North'),(9,'Rebecca Smith',NULL,'0499999999','$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Pending','2026-07-26 08:03:29','ranger','Cohort A - Brisbane North'),(10,'Joe Barkley','ranger6@email.com',NULL,'$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Pending','2026-07-26 11:07:25','ranger','Cohort B - Cairns'),(11,'Amy Brooks','ranger7@email.com',NULL,'$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Active','2026-07-31 10:35:57','ranger','Cohort B - Cairns'),(12,'Andrew Field','ranger8@email.com',NULL,'$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Pending','2026-07-31 10:35:57','ranger','Cohort B - Cairns'),(13,'Margaret Wells','admin2@email.com',NULL,'$argon2id$v=19$m=65536,t=3,p=4$x8Wv5jPPNCh/yT1oaQkVeA$Itzga2lBKBC09mWCHMvGA9cWLIU0Il/TezjKaBPibUg','Active','2026-08-26 01:42:18','admin','');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-13 12:51:40
