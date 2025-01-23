/*
-- some code i need them to use in mysql terminal
--ALTER TABLE login
  --MODIFY role ENUM('Admin', 'Field Staff', 'Team Leader', 'Group Admin') NOT NULL;
--UPDATE staffs
SET role = 'Field Staff'
WHERE role = 'Volunteer';

--SELECT DISTINCT role FROM staffs;
-- DELETE FROM risk_controls WHERE risk_id= 49;

--INSERT INTO risk_titles (title, isReadOnly)
SELECT DISTINCT title, 1 FROM risks;
--DELETE FROM risk_titles WHERE id IN (41, 42);
--RENAME TABLE old_table_name TO new_table_name

--UPDATE project_objectives
SET amount = NULL
WHERE amount = 1;
=============================================

-- Schema fieldbase

--DROP TABLE IF EXISTS staffs;
--DROP TABLE IF EXISTS volunteers;
--DROP TABLE IF EXISTS objectives; 
--DROP TABLE IF EXISTS projects;
--DROP TABLE IF EXISTS project_objectives;
--DROP TABLE IF EXISTS site_hazards;
--DROP TABLE IF EXISTS activity_people_hazards;
--DROP TABLE IF EXISTS project_site_hazards;
--DROP TABLE IF EXISTS project_activity_people_hazards;
DROP TABLE IF EXISTS project_risk_controls;
DROP TABLE IF EXISTS project_risks;
DROP TABLE IF EXISTS risk_controls;
DROP TABLE IF EXISTS risks;
*/

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

--the project_staffs
CREATE TABLE IF NOT EXISTS project_staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    staff_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staffs(id) ON DELETE CASCADE
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

--the project_volunteer table
CREATE TABLE IF NOT EXISTS project_volunteer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
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
-----------------------------------------
-------====Objectives TABLES=======-----
-------------------------------------
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
  amount INT NOT NULL DEFAULT NULL,
  dateStart DATE NULL,
  dateEnd   DATE NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (objective_id) REFERENCES objectives(id)
);
-----------------------
--The pradator table
CREATE TABLE IF NOT EXISTS predator (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sub_type VARCHAR(100) NOT NULL
);

--The project_pradator table
CREATE TABLE IF NOT EXISTS project_predator (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  predator_id INT NOT NULL,
  measurement INT NULL,
  dateStart DATE NULL,
  dateEnd DATE NULL,
  rats INT DEFAULT 0,
  possums INT DEFAULT 0,
  mustelids INT DEFAULT 0,
  hedgehogs INT DEFAULT 0,
  others INT DEFAULT 0,
  others_description VARCHAR(255) NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (predator_id) REFERENCES predator(id) ON DELETE CASCADE
);



-------====Hazards TABLES=======-----
-- Site Hazards Table
CREATE TABLE site_hazards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hazard_description VARCHAR(255) NOT NULL
);

-- Activity/People Hazards Table
CREATE TABLE activity_people_hazards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hazard_description VARCHAR(255) NOT NULL
);

-- Project-Site Hazards Relationship Table
CREATE TABLE project_site_hazards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    site_hazard_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (site_hazard_id) REFERENCES site_hazards(id) ON DELETE CASCADE
);

-- Project-Activity/People Hazards Relationship Table
CREATE TABLE project_activity_people_hazards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    activity_people_hazard_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_people_hazard_id) REFERENCES activity_people_hazards(id) ON DELETE CASCADE
);

----------====RISK TABLES=======-----

-- Drop tables if they exist
DROP TABLE IF EXISTS project_risk_controls;
DROP TABLE IF EXISTS project_risks;
DROP TABLE IF EXISTS risk_controls;
DROP TABLE IF EXISTS risks;
DROP TABLE IF EXISTS risk_titles;

-- Recreate the tables
CREATE TABLE risk_titles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isReadOnly BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    risk_title_id INT NOT NULL,
    likelihood ENUM('highly unlikely', 'unlikely', 'quite possible', 'likely', 'almost certain') NOT NULL,
    consequences ENUM('insignificant', 'minor', 'moderate', 'major', 'catastrophic') NOT NULL,
    risk_rating VARCHAR(30) AS (
        CASE
            WHEN likelihood = 'highly unlikely' AND consequences IN ('insignificant', 'minor', 'moderate') THEN 'Low risk'
            WHEN likelihood = 'highly unlikely' AND consequences = 'major' THEN 'moderate risk'
            WHEN likelihood = 'highly unlikely' AND consequences = 'catastrophic' THEN 'High risk'
            WHEN likelihood = 'unlikely' AND consequences = 'insignificant' THEN 'Low risk'
            WHEN likelihood = 'unlikely' AND consequences IN ('minor', 'moderate') THEN 'moderate risk'
            WHEN likelihood = 'unlikely' AND consequences IN ('major', 'catastrophic') THEN 'High risk'
            WHEN likelihood = 'quite possible' AND consequences = 'insignificant' THEN 'Low risk'
            WHEN likelihood = 'quite possible' AND consequences = 'minor' THEN 'moderate risk'
            WHEN likelihood = 'quite possible' AND consequences IN ('moderate', 'major') THEN 'High risk'
            WHEN likelihood = 'quite possible' AND consequences = 'catastrophic' THEN 'Extreme risk'
            WHEN likelihood = 'likely' AND consequences IN ('minor', 'moderate') THEN 'High risk'
            WHEN likelihood IN ('likely', 'almost certain') AND consequences = 'insignificant' THEN 'moderate risk'
            WHEN likelihood IN ('likely', 'almost certain') AND consequences IN ('major', 'catastrophic') THEN 'Extreme risk'
            WHEN likelihood = 'almost certain' AND consequences = 'minor' THEN 'High risk'
            WHEN likelihood = 'almost certain' AND consequences = 'moderate' THEN 'Extreme risk'
            ELSE 'Unknown'
        END
    ) STORED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (risk_title_id) REFERENCES risk_titles(id) ON DELETE CASCADE
);

CREATE TABLE risk_controls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    risk_title_id INT NOT NULL,
    control_text TEXT NOT NULL,
    isReadOnly BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (risk_title_id) REFERENCES risk_titles(id) ON DELETE CASCADE
);

CREATE TABLE project_risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    risk_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE
);

/*-- Create the project_risk_titles table*/
CREATE TABLE IF NOT EXISTS project_risk_titles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    risk_title_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (risk_title_id) REFERENCES risk_titles(id) ON DELETE CASCADE
);


CREATE TABLE project_risk_controls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    risk_control_id INT NOT NULL,
    is_checked BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (risk_control_id) REFERENCES risk_controls(id) ON DELETE CASCADE
);

---====Checklist =====----

/* Checklist Table */
CREATE TABLE checklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL
);

/* Project_Checklist Table */
CREATE TABLE project_checklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    checklist_id INT NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (checklist_id) REFERENCES checklist(id) ON DELETE CASCADE
);

--==============================
--====Activity Notes=====----
--==============================

/* Create an "activities" table */
 -- Each row = 1 "Activity Note", linked to a single Project
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    activity_date DATE NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    createdBy INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);