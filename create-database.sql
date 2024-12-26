
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


-- the staffs table
CREATE TABLE IF NOT EXISTS staffs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    role ENUM('Field Staff', 'Team Leader', 'Group Admin') NOT NULL
);

-- the volunteers table
CREATE TABLE volunteers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    emergencyContact VARCHAR(50) NOT NULL,
    emergencyContactNumber VARCHAR(15) NOT NULL,
    role ENUM('Volunteer') DEFAULT 'Volunteer'
);
-- The projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,           
  location VARCHAR(255) NOT NULL,       
  startDate DATE NOT NULL,
  status ENUM('inprogress', 'completed', 'onhold') NOT NULL DEFAULT 'inprogress',
  createdBy INT,
  FOREIGN KEY (createdBy) REFERENCES login(id),
  emergencyServices VARCHAR(255) DEFAULT '111 will contact all emergency services',
  localMedicalCenterAddress VARCHAR(255),
  localMedicalCenterPhone VARCHAR(20),
  localHospital VARCHAR(255),
  primaryContactName VARCHAR(100),
  primaryContactPhone VARCHAR(20),
  imageUrl VARCHAR(255),         
  inductionFileUrl VARCHAR(255), 
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

--the objectives table
CREATE TABLE IF NOT EXISTS objectives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  measurement VARCHAR(255),
  dateStart DATE,
  dateEnd DATE
);

-- the project_objectives table
CREATE TABLE IF NOT EXISTS project_objectives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  objective_id INT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (objective_id) REFERENCES objectives(id)
);















CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectname VARCHAR(255) NOT NULL,
  objectives ENUM('Establishing predator control: measurement=trap numbers',
•	'Walking track building: measurement=metres',
•	'Walking track maintenance: measurement=metres',
•	'Species monitoring: measurement=number of species',
•	'Community Participation # of participants',
•	'Weed Treatment m2',
•	'Debris Removal(Weight) tonnes',
•	'Fencing  m',
•	'Plant Propagation # of plants',
•	'Revegetation(Number) # of plants',
•	'Seed Collection kg',
•	'Debris Removal(Area)',
•	'Revegetation(Area)',
•	'Sire Prepration(Treatment)')NOT NULL
  location VARCHAR(255) NOT NULL,
  startDate DATE NOT NULL,
  createdby VARCHAR(255) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  emergencyservicescontacts:
  '111 will contact all emergency services',)
'
  status ENUM('inprogress', 'completed', 'onhold') NOT NULL DEFAULT 'inprogress',
  imageUrl VARCHAR(255),           -- store the path/URL of the uploaded image
  inductionFileUrl VARCHAR(255),   -- store the path/URL of the induction doc
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
