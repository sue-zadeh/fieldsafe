
-- Schema fieldbase

--DROP TABLE IF EXISTS login;
--DROP TABLE IF EXISTS projects;
--DROP TABLE IF EXISTS objects;
--DROP TABLE IF EXISTS competitions;

--the login table
CREATE TABLE IF NOT EXISTS login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50), 
    lastname VARCHAR(50),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50)
);


-- the registration table
CREATE TABLE IF NOT EXISTS registration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    role ENUM('Volunteer', 'Field Staff', 'Team Leader', 'Group Admin') NOT NULL
);

