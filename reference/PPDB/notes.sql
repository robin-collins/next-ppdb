DROP TABLE IF EXISTS `notes`;
CREATE TABLE `notes` (
  `noteID` mediumint(4) NOT NULL auto_increment,
  `animalID` mediumint(4) NOT NULL default '0',
  `notes` mediumtext NOT NULL,
  `date` date NOT NULL default '0000-00-00',
  PRIMARY KEY  (`noteID`),
  UNIQUE KEY `noteID` (`noteID`),
  KEY `animalID` (`animalID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 PACK_KEYS=1 AUTO_INCREMENT=104526 ;

COMMIT;
