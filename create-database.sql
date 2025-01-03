
-- Schema fieldbase

--DROP TABLE IF EXISTS login;
--DROP TABLE IF EXISTS staffs;
--DROP TABLE IF EXISTS volunteers;
--DROP TABLE IF EXISTS objectives; 
--DROP TABLE IF EXISTS projects;
--DROP TABLE IF EXISTS project_objectives;

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
  name VARCHAR(255) UNIQUE NOT NULL,
  location VARCHAR(255) NOT NULL,
  startDate DATE NOT NULL,
  status ENUM('inprogress', 'completed', 'onhold', 'archived') NOT NULL DEFAULT 'inprogress',
  createdBy INT,
  emergencyServices VARCHAR(255) DEFAULT '111 will contact all emergency services',
  localMedicalCenterAddress VARCHAR(255),
  localMedicalCenterPhone VARCHAR(20),
  localHospital VARCHAR(255),
  primaryContactName VARCHAR(100),
  primaryContactPhone VARCHAR(20),
  imageUrl VARCHAR(255),
  inductionFileUrl VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (createdBy) REFERENCES login(id)
);


--the objectives table
CREATE TABLE IF NOT EXISTS objectives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  measurement VARCHAR(255),
  dateStart DATE,
  dateEnd DATE,

  FOREIGN KEY (project_id) REFERENCES projects(id)
);


-- the project_objectives table
CREATE TABLE IF NOT EXISTS project_objectives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  objective_id INT NOT NULL,
  amount INT NOT NULL DEFAULT 1
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (objective_id) REFERENCES objectives(id)
);















