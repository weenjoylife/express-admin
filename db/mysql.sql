DROP TABLE IF EXISTS bs_trontoken;

CREATE TABLE `bs_trontoken` (
`id` INT(20) NOT NULL AUTO_INCREMENT,
`tokenname` VARCHAR(20) NOT NULL,
`tokensymbol` VARCHAR(10) NOT NULL,
`tokencontract` VARCHAR(50) NOT NULL,
`tokenpair` VARCHAR(50) NOT NULL,
`tokensupply` FLOAT NOT NULL,
`tokendicimal` FLOAT NOT NULL,
`tokenblockid` BIGINT NOT NULL,
`tokenhash` VARCHAR(50) NOT NULL,
`tokencreator` VARCHAR(50) NOT NULL DEFAULT 'system' ,
`createtime` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
`updatorid` VARCHAR(15),
`updatetime` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
`deletetime` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
`is_del` TINYINT(1) DEFAULT '0',
`bak1` DECIMAL(20,5) ,
`bak2` VARCHAR(20) ,
`bak3` VARCHAR(20) ,
`bak4` VARCHAR(20) ,
`bak5` VARCHAR(20) ,
PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;

INSERT INTO bs_trontoken(id, tokenname,tokensymbol,tokencontract,tokenpair,tokensupply,tokendicimal,tokenblockid,tokenhash)
VALUES(1,'PGNLZ TOKEN','PGNLZ','TYNBghcrizLDpSGxovMu5gxfWHmD556D6X','TSxg4HUFVi6xgc8DyLHkKGnX6UdfTYrrEC',1022000000,6,32234846,'68df8199bdd836eaf2d87ea03fc7c12f9497fe131d11347e05d42e50eafc697c');