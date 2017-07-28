CREATE DATABASE  IF NOT EXISTS `art`;
USE `art`;

DROP TABLE IF EXISTS `painting`;

CREATE TABLE `painting` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `movement` varchar(45) NOT NULL,
  `artist` varchar(45) NOT NULL,
  `museumName` varchar(50) NOT NULL,
  `museumLocation` varchar(45) NOT NULL,
  `yearCreated` int(10) unsigned NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;



INSERT INTO `painting` VALUES (1,'Bal du moulin de la Galette','impressionism','Pierre-Auguste Renoires','Musée d’Orsay','Paris',1877),
(2,'The Last Supper','Renaissance','Leonardo da Vinci','Santa Maria delle Grazie','Milan',1495),
(3,'The Starry Night','post-impressionism','Vincent van Gogh','Museum of Modern Art','New York',1889),
(4,'A Sunday Afternoon on the Island of La Grande Jatte','impressionism','Georges Seurat','Art Institute of Chicago','Chicago',1884),
(5,'Water Lilies Nympheas','impressionism','Claude Monet','Art Gallery of Ontario','Toronto',1907),
(10,'The Persistence of Memory','surrealism','Salvador Dali','Musuem of Modern Art','New York',1931);
