DROP TABLE IF EXISTS `animal`;
CREATE TABLE `animal` (
  `animalID` mediumint(4) NOT NULL auto_increment,
  `animalname` varchar(12) NOT NULL default '',
  `breedID` mediumint(4) NOT NULL default '0',
  `customerID` mediumint(6) NOT NULL default '0',
  `SEX` enum('Male','Female') NOT NULL default 'Male',
  `colour` text NOT NULL,
  `cost` smallint(6) NOT NULL default '0',
  `lastvisit` date NOT NULL default '0000-00-00',
  `thisvisit` date NOT NULL default '0000-00-00',
  `comments` tinytext,
  PRIMARY KEY  (`animalID`),
  KEY `animalname` (`animalname`),
  KEY `breedID` (`breedID`),
  KEY `customerID` (`customerID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 PACK_KEYS=1 AUTO_INCREMENT=11476 ;

