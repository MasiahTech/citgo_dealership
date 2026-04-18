CREATE TABLE IF NOT EXISTS `player_vehicles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `citizenid` VARCHAR(50) NOT NULL,
  `vehicle` VARCHAR(50) NOT NULL,
  `hash` VARCHAR(50) NOT NULL,
  `mods` LONGTEXT NOT NULL,
  `plate` VARCHAR(8) NOT NULL,
  `garage` VARCHAR(50) NOT NULL DEFAULT 'pillboxgarage',
  `fuel` INT NOT NULL DEFAULT 100,
  `engine` FLOAT NOT NULL DEFAULT 1000.0,
  `body` FLOAT NOT NULL DEFAULT 1000.0,
  `state` INT NOT NULL DEFAULT 0,
  `depotprice` INT NOT NULL DEFAULT 0,
  `drivingdistance` INT DEFAULT NULL,
  `status` TEXT DEFAULT NULL,
  INDEX (`citizenid`),
  INDEX (`plate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
