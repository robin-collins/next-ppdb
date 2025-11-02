SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `animal` (
  `animalID` mediumint(4) NOT NULL,
  `animalname` varchar(12) NOT NULL DEFAULT '',
  `breedID` mediumint(4) NOT NULL DEFAULT 0,
  `customerID` mediumint(6) NOT NULL DEFAULT 0,
  `SEX` enum('Male','Female') NOT NULL DEFAULT 'Male',
  `colour` text NOT NULL,
  `cost` smallint(6) NOT NULL DEFAULT 0,
  `lastvisit` date NOT NULL DEFAULT '0000-00-00',
  `thisvisit` date NOT NULL DEFAULT '0000-00-00',
  `comments` tinytext DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci PACK_KEYS=1;

CREATE TABLE `breed` (
  `breedID` mediumint(4) NOT NULL,
  `breedname` varchar(30) NOT NULL DEFAULT '',
  `avgtime` time DEFAULT '00:00:00',
  `avgcost` smallint(5) DEFAULT 0
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci PACK_KEYS=1;

CREATE TABLE `customer` (
  `customerID` mediumint(6) NOT NULL,
  `surname` varchar(20) NOT NULL DEFAULT '',
  `firstname` varchar(20) DEFAULT NULL,
  `address` varchar(50) DEFAULT NULL,
  `suburb` varchar(20) DEFAULT NULL,
  `postcode` smallint(4) DEFAULT 0,
  `phone1` varchar(10) DEFAULT '0',
  `phone2` varchar(10) DEFAULT NULL,
  `phone3` varchar(10) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci PACK_KEYS=1;

CREATE TABLE `notes` (
  `noteID` mediumint(4) NOT NULL,
  `animalID` mediumint(4) NOT NULL DEFAULT 0,
  `notes` mediumtext NOT NULL,
  `date` date NOT NULL DEFAULT '0000-00-00'
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci PACK_KEYS=1;


ALTER TABLE `animal`
  ADD PRIMARY KEY (`animalID`),
  ADD KEY `animalname` (`animalname`),
  ADD KEY `breedID` (`breedID`),
  ADD KEY `customerID` (`customerID`);

ALTER TABLE `breed`
  ADD PRIMARY KEY (`breedID`),
  ADD UNIQUE KEY `breedID` (`breedID`),
  ADD UNIQUE KEY `breedname` (`breedname`);

ALTER TABLE `customer`
  ADD PRIMARY KEY (`customerID`),
  ADD UNIQUE KEY `customerID` (`customerID`),
  ADD KEY `surname` (`surname`);

ALTER TABLE `notes`
  ADD PRIMARY KEY (`noteID`),
  ADD UNIQUE KEY `noteID` (`noteID`),
  ADD KEY `animalID` (`animalID`);


ALTER TABLE `animal`
  MODIFY `animalID` mediumint(4) NOT NULL AUTO_INCREMENT;

ALTER TABLE `breed`
  MODIFY `breedID` mediumint(4) NOT NULL AUTO_INCREMENT;

ALTER TABLE `customer`
  MODIFY `customerID` mediumint(6) NOT NULL AUTO_INCREMENT;

ALTER TABLE `notes`
  MODIFY `noteID` mediumint(4) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
