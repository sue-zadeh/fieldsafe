-- some code i need them to use in mysql terminal
--ALTER TABLE login
  --MODIFY role ENUM('Admin', 'Field Staff', 'Team Leader', 'Group Admin') NOT NULL;

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
    role ENUM('admin','Field Staff', 'Team Leader', 'Group Admin') NOT NULL;
);


-- the staffs table
CREATE TABLE IF NOT EXISTS staffs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL
    role ENUM('Field Staff', 'Team Leader', 'Group Admin') NOT NULL
    -- FOREIGN KEY (login_id) REFERENCES login(id) ON DELETE CASCADE
    
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

--the hazards table
CREATE TABLE hazards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_hazard VARCHAR(255) NOT NULL,
    activity_people_hazard VARCHAR(255) NOT NULL
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);

--the project_hazards table
CREATE TABLE IF NOT EXISTS project_hazards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  hazard_id INT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (hazard_id) REFERENCES hazards(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS project_risks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  risk_id INT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  likelihood ENUM('highly unlikely', 'unlikely', 'quite possible', 'likely', 'almost certain') NOT NULL,
  consequences ENUM('insignificant', 'minor', 'moderate', 'major', 'catastrophic') NOT NULL,
  risk_rating VARCHAR(30) AS (
    CASE 
WHEN likelihood = 'highly unlikely' AND consequences IN ('insignificant', 'minor', 'moderate') THEN 'Low risk'  
      WHEN likelihood = 'highly unlikely' AND consequences IN ('major') THEN 'moderate risk'
      WHEN likelihood = 'highly unlikely' AND consequences IN (  'catastrophic')THEN 'High risk'
      WHEN likelihood = 'unlikely' AND consequences IN 'insignificant' THEN 'Low risk'
      WHEN likelihood = 'unlikely' AND consequences IN ('moderate', 'minor') THEN 'moderate risk'
      WHEN likelihood = 'unlikely' AND consequences = ('catastrophic', 'major') THEN 'High risk'
      WHEN likelihood = 'quite possible' AND consequences IN 'insignificant' THEN 'Low risk'
      WHEN likelihood = 'quite possible' AND consequences IN 'minor' THEN 'moderate risk'
      WHEN likelihood = 'quite possible' AND consequences IN ('moderate', 'major') THEN 'High risk'
      WHEN likelihood = 'quite possible' AND consequences IN 'catastrophic' THEN 'Extreme risk'
      WHEN likelihood = 'likely' AND consequences IN ('minor', 'moderate') THEN 'High risk'
      WHEN likelihood IN ('likely', 'almost certain') AND consequences IN 'insignificant' THEN 'moderate risk'
      WHEN likelihood IN ('likely', 'almost certain') AND consequences IN ('major', 'catastrophic') THEN 'Extreme risk'
      WHEN likelihood = 'almost certain' AND consequences IN 'moderate' THEN 'Extreme risk'
      
    ELSE 'Unknown'
    END
  ) STORED,
  additional_controls TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);









