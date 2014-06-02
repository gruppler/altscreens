-- phpMyAdmin SQL Dump
-- version 3.4.10.1deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 02, 2014 at 03:20 PM
-- Server version: 5.5.37
-- PHP Version: 5.3.10-1ubuntu3.11

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `altscreens`
--

-- --------------------------------------------------------

--
-- Table structure for table `definitions`
--

CREATE TABLE IF NOT EXISTS `definitions` (
  `participant` int(10) unsigned NOT NULL,
  `metric` tinyint(3) unsigned NOT NULL,
  `not` tinyint(1) NOT NULL,
  `word` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`participant`,`metric`,`not`,`word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `participants`
--

CREATE TABLE IF NOT EXISTS `participants` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `finished` tinyint(1) NOT NULL,
  `name` varchar(32) NOT NULL,
  `age` tinyint(3) unsigned NOT NULL,
  `gender` tinyint(1) NOT NULL,
  `year` tinyint(3) unsigned NOT NULL,
  `make` tinyint(3) unsigned NOT NULL,
  `model` tinyint(3) unsigned NOT NULL,
  `word1` varchar(32) NOT NULL DEFAULT '',
  `word2` varchar(32) NOT NULL DEFAULT '',
  `word3` varchar(32) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE IF NOT EXISTS `ratings` (
  `participant` int(10) unsigned NOT NULL,
  `concept` tinyint(3) unsigned NOT NULL,
  `metric` tinyint(3) unsigned NOT NULL,
  `rating` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`participant`,`concept`,`metric`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `weights`
--

CREATE TABLE IF NOT EXISTS `weights` (
  `participant` int(10) unsigned NOT NULL,
  `metric` tinyint(3) unsigned NOT NULL,
  `weight` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`participant`,`metric`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `definitions`
--
ALTER TABLE `definitions`
  ADD CONSTRAINT `definitions_ibfk_1` FOREIGN KEY (`participant`) REFERENCES `participants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`participant`) REFERENCES `participants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `weights`
--
ALTER TABLE `weights`
  ADD CONSTRAINT `weights_ibfk_1` FOREIGN KEY (`participant`) REFERENCES `participants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
