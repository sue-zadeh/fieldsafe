
-- Populate the login table
INSERT INTO login (firstname, lastname, username, password, role) VALUES
('Sue', 'zadeh', 'raisianz@gmil.com', 'admin', 'admin')
('Dave', 'Sharp', 'dsharp@cvnz.org.nz', '$2b$10$N7DPleAOP2N.y7WduTzDNOZgZUJe/1rMbFaMcYd4a1G.5q4dGzEwO', 'Admin'),
('Sue', 'Zadeh', 'suezadeh.a@gmail.com', '$2b$10$eSvyjg24wZ5dtU62eJwbruhgrP3Sypb2KF173D.zJoiIH1RXbXEFe', 'Admin'),
('john', 'Doe', 'admin1@example.com', '$2b$10$rwIEU2qP2HIWYqcEkOLBQeUvjT0fKKRHu7RSOBbQwvqrzc1nGemFu', 'Admin'),
('Helen', 'voly', 'admin2@example.com', '$2b$10$Vsnykdh17MiXGioCef2BoO4z/zL6iZE9YQRH5YJux89suK5SZyDu2', 'Admin'),
('Bill', 'Hey', 'admin3@example.com', '$2b$10$.Ok2dnOA0lXmyuLE9IfpIOj9IBM7gkS8manwOb0EU1I4A8JfOtqdG', 'Admin');

-- Populate the staffs table
INSERT INTO registration (firstname, lastname, email, phone, role) VALUES
('John', 'Doe', 'john.doe@example.com', '1234567890', 'Volunteer'),
('Jane', 'Smith', 'jane.smith@example.com', '0987654321', 'Field Staff'),
('Alice', 'Brown', 'alice.brown@example.com', '5678901234', 'Team Leader'),
('Mark', 'Taylor', 'mark.taylor@example.com', '4567890123', 'Volunteer'),
('Emily', 'Davis', 'emily.davis@example.com', '7890123456', 'Field Staff');

-- Populate the volunteers table
INSERT INTO volunteers (firstname, lastname, email, phone, emergencyContact, emergencyContactNumber, role)
VALUES
('John', 'Doe', 'johndoe@example.com', '123-456-7890', 'Jane Doe', '987-654-3210', 'Volunteer'),
('Alice', 'Smith', 'alicesmith@example.com', '555-123-4567', 'Bob Smith', '555-765-4321', 'Volunteer'),
('Mark', 'Johnson', 'markjohnson@example.com', '222-333-4444', 'Laura Johnson', '222-999-8888', 'Volunteer'),
('Emily', 'Davis', 'emilydavis@example.com', '111-222-3333', 'Sarah Davis', '111-444-5555', 'Volunteer'),
('Michael', 'Brown', 'michaelbrown@example.com', '444-555-6666', 'Paul Brown', '444-777-8888', 'Volunteer');

-- Populate the projects table
INSERT INTO projects (
  name, location, startDate, status,
  createdBy,
  emergencyServices,
  localMedicalCenterAddress, localMedicalCenterPhone,
  localHospital,
  primaryContactName, primaryContactPhone,
  imageUrl, inductionFileUrl
)
VALUES (
  'River Restoration',
  '123 River St, Auckland, NZ',
  '2024-07-01',
  'inprogress',
  1,  -- referencing the user with id=1 in login
  '111 will contact all emergency services',
  'Rose Medical Center, 456 Medical Rd', '09-1234567',
  'Auckland City Hospital, 789 Hospital Way',
  'John Manager', '027-999-1234',
  'uploads/river.jpg',
  'uploads/induction_river.docx'
);
-- Populate the objectives table

INSERT INTO objectives (title, measurement, dateStart, dateEnd)
VALUES
('Community Participation', '# of participants', NULL, NULL),
('Weed Treatment', '#m2', NULL, NULL),
('Debris Removal(Weight)', '# tonnes', NULL, NULL),
('Fencing(m)', '# metres', NULL, NULL),
('Plant Propagation(Number)', '# of plants', NULL, NULL),
('Revegetation(Number)', '# of plants', '2024-05-01', '2025-05-01'),
('Seed Collection kg', '# kg', NULL, NULL),
('Debris Removal(Area)', '#(Area)', NULL, NULL),
('Revegetation(Area)', '#(Area)', NULL, NULL),
('Site Preparation(Treatment)', '#(Treatment)', NULL, NULL),
('Establishing Predator Control', '# trap numbers', NULL, NULL),
('Walking track building', 'metres', NULL, NULL),
('Walking track maintenance', 'metres', NULL, NULL),
('Species monitoring', 'number of species', NULL, NULL);


-- Populate the project_objectives table
INSERT INTO project_objectives (project_id, objective_id)
VALUES
 (1, 1),
 (1, 2);
INSERT INTO site_hazards (hazard_description) VALUES 
('Slippery Surface'), 
('Bad Weather'), 
('Uneven Terrain');

INSERT INTO activity_people_hazards (hazard_description) VALUES 
('Fatigue'), 
('Lack of Training'), 
('Heavy Lifting');


-- Populate the project_hazards table
INSERT INTO project_hazards (project_id, hazard_id) VALUES
(1, 1), -- Bad Weather for Project 1
(1, 2), -- Muddy Track for Project 1
(2, 3), -- Steep Hill for Project 2
(3, 4); -- Low Visibility for Project 3

--Populate the risks table
INSERT INTO risks (title, likelihood, consequences,risk rating, additional_controls) VALUES
('Asbestos-containing Materials','unlikely', 'moderate', 'moderate risk',  )
('Bites & Stings','likely', 'major', 'extreme risk', )
('Boardwalk Construction - impact injuries, strains, manual handing, remote locations','almost certain', 'minor', 'high risk' )
('Bushfire', 'almost certain', 'minor', 'high risk' 'Follow trap-setting guidelines',)
('Bushwalking', 'quite possible', 'minor', 'moderate risk', 'Follow trap-setting guidelines')
('COVID-19', 'likely', 'moderate', 'high risk', )
('Chemical use - poisoning (inhalation, injestion, absorption)', 'likely', 'moderate', 'high risk',)
('Collecting sharps', 'almost certain', 'major', 'extreme risk', )
('Fencing - injuries from wire (failure under strain or coiling), impact injury from picket rammer', 'likely', 'moderate', 'high risk',)
('Litter collection - laceration/spike injuries, bites/stings, infections', 'likely', 'moderate', 'high risk',)
('Manual Handling', 'unlikely', 'insignificant', 'low risk',)
('Mulching - inhalation/eye injury, allergies from dust, soft tissue injuries', 'likely', 'moderate', 'high risk',)
('Plant Propagation - Strains, soil borne diseases, manual handling', 'almost certain', 'moderate', 'extreme risk',)
('Seed collection - cuts/scratches, eye injuries, allergic reactions, falls from height', 'likely', 'moderate', 'high risk',)
('Slips, Trips & Falls', 'quite possible', 'moderate', 'high risk',)
('Soil Borne Diseases & Inflections', 'almost certain', 'moderate', 'extreme risk',)
('Surveying & Data Collection', 'almost certain', 'insignificant', 'moderate risk',)
('Track Construction and Maintenance - impact injuries, strains, manual handing, remote locations', 'likely', 'minor', 'high risk',)
('Tree Planting- impact injuries, muscle strain', 'likely', 'insignificant', 'moderate risk',)
('Using Machete or cane knife', 'high unlikely', 'minor', 'low risk',)
('Using Swinging Tools - Impact injuries, blisters, eye injuries', 'high unlikely', 'major', 'moderate risk',)
('Using Temporary Accommodation', 'high unlikely', 'minor', 'low risk',)
('Using picket rammers', 'high unlikely', 'moderate', 'low risk',)
('Vehicle Travel', 'high unlikely, minor', 'low risk',)
('Weeding - Scratches, strains, chemical exposure, impact injuries', 'high unlikely', 'catastrophic', 'high risk',)
('Working at heights - impact injury from falls or falling objects', 'unlikely', 'insignificant', 'low risk',)
('Working in Cold Conditions (Hypothermia)', 'high unlikely', 'minor', 'low risk',)
('Predator control /checking traps','likely', 'major', 'extreme risk',)
('Working in Windy Conditions', 'almost certain', 'minor', 'high risk',)
('Working in the dark', 'almost certain', 'minor', 'high risk',)
('Working in tick habitat - allergic reaction, tick borne diseases', 'almost certain', 'minor', 'high risk',)
('Working near heavy machinery', 'likely', 'minor', 'high risk',)
('Working near road sides - impact injuries from vehicles', 'likely', 'minor', 'high risk',)
('Working near water - drowning	', 'unlikely', 'minor', 'moderate risk', 'Wear life jackets, avoid strong currents' 'likely', 'minor', 'high risk',)
('Working with schools' 'likely', 'minor', 'moderate risk',)
('Working with/ near Power Auger', 'unlikely', 'catastrophic', 'high risk',)
('Working with/ near animals', 'unlikely', 'major', 'high risk',)
('Working with/ near brush cutters', 'unlikely', 'major', 'high risk',)
('Working with/ near chainsaws', 'likely', 'insignificant', 'moderate risk',)

-- Populate the project_risks table
INSERT INTO project_risks (project_id, risk_id) VALUES
(1, 1), -- Working near water for Project 1
(1, 2), -- Slips, Trips & Falls for Project 1
(2, 3), -- Working near heavy machinery for Project 2
(3, 4); -- Working in Windy Conditions for Project 3

