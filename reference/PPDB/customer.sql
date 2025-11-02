DROP TABLE IF EXISTS `customer`;
CREATE TABLE `customer` (
  `customerID` mediumint(6) NOT NULL auto_increment,
  `surname` varchar(20) NOT NULL default '',
  `firstname` varchar(20) default NULL,
  `address` varchar(50) default NULL,
  `suburb` varchar(20) default NULL,
  `postcode` smallint(4) default '0',
  `phone1` varchar(10) default '0',
  `phone2` varchar(10) default NULL,
  `phone3` varchar(10) default NULL,
  `email` varchar(200) default NULL,
  PRIMARY KEY  (`customerID`),
  UNIQUE KEY `customerID` (`customerID`),
  KEY `surname` (`surname`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 PACK_KEYS=1 AUTO_INCREMENT=8320 ;
