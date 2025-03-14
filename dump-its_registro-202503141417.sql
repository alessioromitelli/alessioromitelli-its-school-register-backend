-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: its_registro
-- ------------------------------------------------------
-- Server version	11.6.2-MariaDB

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
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `year` smallint(6) NOT NULL,
  `period` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (4,'ict 24-26',2024,2),(5,'marketing 24-26',2024,2),(6,'meccatronica 24-26',2024,2),(8,'marketing 23-25',2023,2);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `startdate` datetime NOT NULL,
  `enddate` datetime NOT NULL,
  `argument` varchar(100) DEFAULT NULL,
  `note` varchar(100) DEFAULT NULL,
  `id_module` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `lessons_modules_FK` (`id_module`),
  CONSTRAINT `lessons_modules_FK` FOREIGN KEY (`id_module`) REFERENCES `modules` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons_presences`
--

DROP TABLE IF EXISTS `lessons_presences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons_presences` (
  `id_lesson` bigint(20) NOT NULL,
  `id_user` bigint(20) NOT NULL,
  `signdate` datetime NOT NULL,
  PRIMARY KEY (`id_lesson`,`id_user`),
  KEY `lessons_presences_users_FK` (`id_user`),
  CONSTRAINT `lessons_presences_lessons_FK` FOREIGN KEY (`id_lesson`) REFERENCES `lessons` (`id`),
  CONSTRAINT `lessons_presences_users_FK` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons_presences`
--

LOCK TABLES `lessons_presences` WRITE;
/*!40000 ALTER TABLE `lessons_presences` DISABLE KEYS */;
/*!40000 ALTER TABLE `lessons_presences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modules` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `total_hours` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'studente'),(2,'docente'),(3,'coordinatore'),(7,'sdd');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `password` varchar(255) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `email` varchar(50) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 0,
  `fiscalcode` char(16) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (11,'fe301eaaac49b4652b8dfd9fb0e913683ac5600f59370a6261824ab608b4fad7','dirosa','matteo','24725272','matteo.dirosa@its.it',1,'DRSMTT00F07A784G'),(12,'8d0cfd6182ef851052565eb5c11e79f73c691307f7b6ddb877b4303cc726f260','romitelli','alessio','3313161302','alessio.romitelli@its.it',1,'RMTLSS00C08E783G'),(13,'19e37c4dfe9a2e1570be1f4cbafca76f3ed757231c0865e02465c909d916b1d1','fava','mauro','33531651403','mauro.fava@its.it',1,'FVVMRR03B08R856F'),(14,'976c49391de9909cda71c0b17f580f9e9c58b6264516ce8466ebd10c24caf0a2','verdini','carlo','3373654569','carlo.verdini@its.it',1,'VRDCRL04E08R862F');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_modules`
--

DROP TABLE IF EXISTS `users_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_modules` (
  `id_module` bigint(20) NOT NULL,
  `id_user` bigint(20) NOT NULL,
  PRIMARY KEY (`id_module`,`id_user`),
  KEY `users_modules_users_FK` (`id_user`),
  CONSTRAINT `users_modules_modules_FK` FOREIGN KEY (`id_module`) REFERENCES `modules` (`id`),
  CONSTRAINT `users_modules_users_FK` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_modules`
--

LOCK TABLES `users_modules` WRITE;
/*!40000 ALTER TABLE `users_modules` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_roles_courses`
--

DROP TABLE IF EXISTS `users_roles_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_roles_courses` (
  `id_user` bigint(20) NOT NULL,
  `id_role` bigint(20) NOT NULL,
  `id_course` bigint(20) NOT NULL,
  PRIMARY KEY (`id_user`,`id_role`,`id_course`),
  KEY `users_roles_courses_roles_FK` (`id_role`),
  KEY `users_roles_courses_courses_FK` (`id_course`),
  CONSTRAINT `users_roles_courses_courses_FK` FOREIGN KEY (`id_course`) REFERENCES `courses` (`id`),
  CONSTRAINT `users_roles_courses_roles_FK` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_roles_courses_users_FK` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_roles_courses`
--

LOCK TABLES `users_roles_courses` WRITE;
/*!40000 ALTER TABLE `users_roles_courses` DISABLE KEYS */;
INSERT INTO `users_roles_courses` VALUES (12,1,4),(13,2,4),(11,3,4);
/*!40000 ALTER TABLE `users_roles_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'its_registro'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-14 14:17:53
