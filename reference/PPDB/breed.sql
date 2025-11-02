DROP TABLE IF EXISTS `breed`;
CREATE TABLE `breed` (
  `breedID` mediumint(4) NOT NULL auto_increment,
  `breedname` varchar(30) NOT NULL default '',
  `avgtime` time default '00:00:00',
  `avgcost` smallint(5) default '0',
  PRIMARY KEY  (`breedID`),
  UNIQUE KEY `breedID` (`breedID`),
  UNIQUE KEY `breedname` (`breedname`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 PACK_KEYS=1 AUTO_INCREMENT=181 ;
