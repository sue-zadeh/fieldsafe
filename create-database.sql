
-- Schema fieldbase

--DROP TABLE IF EXISTS login;
--DROP TABLE IF EXISTS projects;
--DROP TABLE IF EXISTS objects;
--DROP TABLE IF EXISTS competitions;

--the login table
CREATE TABLE IF NOT EXISTS login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- the registration table
CREATE TABLE registration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    role ENUM('Volunteer', 'Field Staff', 'Team Leader') NOT NULL
);

-- Populate the table with sample data
INSERT INTO registration (firstname, lastname, email, phone, role) VALUES
(1, 'John', 'Doe', 'john.doe@example.com', '1234567890', 'Volunteer'),
(2, 'Jane', 'Smith', 'jane.smith@example.com', '0987654321', 'Field Staff'),
(3, 'Alice', 'Brown', 'alice.brown@example.com', '5678901234', 'Team Leader'),
(4, 'Mark', 'Taylor', 'mark.taylor@example.com', '4567890123', 'Volunteer'),
(5, 'Emily', 'Davis', 'emily.davis@example.com', '7890123456', 'Field Staff');