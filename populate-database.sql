
-- Populate the login table
INSERT INTO login (firstname, lastname, username, password, role) VALUES
('Sue', 'zadeh', 'raisianz@gmil.com', '$2b$10$QDmiuOEG.MHyjP4h0KR2Uewon1a6UL68uAh0zKiy6Vvn2gH98weGG', 'admin')
('Dave', 'Sharp', 'dsharp@cvnz.org.nz', '$2b$10$N7DPleAOP2N.y7WduTzDNOZgZUJe/1rMbFaMcYd4a1G.5q4dGzEwO', 'Admin'),
('Sue', 'Zadeh', 'suezadeh.a@gmail.com', '$2b$10$eSvyjg24wZ5dtU62eJwbruhgrP3Sypb2KF173D.zJoiIH1RXbXEFe', 'Admin'),
('john', 'Doe', 'admin1@example.com', '$2b$10$rwIEU2qP2HIWYqcEkOLBQeUvjT0fKKRHu7RSOBbQwvqrzc1nGemFu', 'Admin'),
('Helen', 'voly', 'admin2@example.com', '$2b$10$Vsnykdh17MiXGioCef2BoO4z/zL6iZE9YQRH5YJux89suK5SZyDu2', 'Admin'),
('Bill', 'Hey', 'admin3@example.com', '$2b$10$.Ok2dnOA0lXmyuLE9IfpIOj9IBM7gkS8manwOb0EU1I4A8JfOtqdG', 'Admin');

-- Populate the staffs table
INSERT INTO staffs (firstname, lastname, email, phone, password, role) VALUES
('Dave', 'Sharp', 'dsharp.unique@example.com', '0987654321', '$2b$10$N7DPleAOP2N.y7WduTzDNOZgZUJe/1rMbFaMcYd4a1G.5q4dGzEwO', ' '),
('Sue', 'Zadeh', 'suezadeh.a@gmail.com', '5678901234', '$2b$10$eSvyjg24wZ5dtU62eJwbruhgrP3Sypb2KF173D.zJoiIH1RXbXEFe', 'Group Admin'),
('Helen', 'voly', 'admin2@example.com', '7890123456', '$2b$10$Vsnykdh17MiXGioCef2BoO4z/zL6iZE9YQRH5YJux89suK5SZyDu2', 'Team Leader'),
('Bill', 'Hey', 'admin3@example.com', '4567890123', '$2b$10$.Ok2dnOA0lXmyuLE9IfpIOj9IBM7gkS8manwOb0EU1I4A8JfOtqdG', 'Field Staff');

('John', 'Dell', 'john.doe@example.com', '1234567890', 'Team Leader'),
('Jane', 'Smith', 'jane.smith@example.com', '0987654321', 'Field Staff'),
('Alice', 'Brown', 'alice.brown@example.com', '5678901234', 'Team Leader'),
('Mark', 'Taylor', 'mark.taylor@example.com', '4567890123', 'Field Staff'),
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
  id, name, location, startDate, status,
  createdBy,
  emergencyServices,
  localMedicalCenterAddress, localMedicalCenterPhone,
  localHospital,
  primaryContactName, primaryContactPhone,
  imageUrl, inductionFileUrl
)
VALUES (
  1,'River Restoration',
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


----------====RISK TABLES=======-----
/*--Populated the risk_titles table */
 INSERT INTO risk_titles (id, title, isReadOnly, created_at) VALUES
(1, 'Asbestos-containing Materials', 1, '2025-01-13 22:10:50'),
(2, 'Bites & Stings', 1, '2025-01-13 22:10:50'),
(3, 'Boardwalk Construction - impact injuries, strains, manual handling, remote locations', 1, '2025-01-13 22:10:50'),
(4, 'Bushfire', 1, '2025-01-13 22:10:50'),
(5, 'Bushwalking', 1, '2025-01-13 22:10:50'),
(6, 'COVID-19', 1, '2025-01-13 22:10:50'),
(7, 'Chemical use - poisoning (inhalation, ingestion, absorption)', 1, '2025-01-13 22:10:50'),
(8, 'Collecting sharps', 1, '2025-01-13 22:10:50'),
(9, 'Fencing - injuries from wire (failure under strain or coiling), impact injury from picket rammer', 1, '2025-01-13 22:10:50'),
(10, 'Litter collection - laceration/spike injuries, bites/stings, infections', 1, '2025-01-13 22:10:50'),
(11, 'Manual Handling', 1, '2025-01-13 22:10:50'),
(12, 'Mulching - inhalation/eye injury, allergies from dust, soft tissue injuries', 1, '2025-01-13 22:10:50'),
(13, 'Plant Propagation - Strains, soil borne diseases, manual handling', 1, '2025-01-13 22:10:50'),
(14, 'Predator control /checking traps', 1, '2025-01-13 22:10:50'),
(15, 'Seed collection - cuts/scratches, eye injuries, allergic reactions, falls from height', 1, '2025-01-13 22:10:50'),
(16, 'Slips, Trips & Falls', 1, '2025-01-13 22:10:50'),
(17, 'Soil Borne Diseases & Inflections', 1, '2025-01-13 22:10:50'),
(18, 'Surveying & Data Collection', 1, '2025-01-13 22:10:50'),
(19, 'Track Construction and Maintenance - impact injuries, strains, manual handling, remote locations', 1, '2025-01-13 22:10:50'),
(20, 'Tree Planting - impact injuries, muscle strain', 1, '2025-01-13 22:10:50'),
(21, 'Using Machete or cane knife', 1, '2025-01-13 22:10:50'),
(22, 'Using Power Tools - electrocution, impact injuries, strains, manual handling, flying particles', 1, '2025-01-13 22:10:50'),
(23, 'Using Swinging Tools - Impact injuries, blisters, eye injuries', 1, '2025-01-13 22:10:50'),
(24, 'Using Temporary Accommodation', 1, '2025-01-13 22:10:50'),
(25, 'Using picket rammers', 1, '2025-01-13 22:10:50'),
(26, 'Vehicle Travel', 1, '2025-01-13 22:10:50'),
(27, 'Weeding - Scratches, strains, chemical exposure, impact injuries', 1, '2025-01-13 22:10:50'),
(28, 'Working at heights - impact injury from falls or falling objects', 1, '2025-01-13 22:10:50'),
(29, 'Working in Cold Conditions (Hypothermia)', 1, '2025-01-13 22:10:50'),
(30, 'Working in Windy Conditions', 1, '2025-01-13 22:10:50'),
(31, 'Working in the dark', 1, '2025-01-13 22:10:50'),
(32, 'Working in tick habitat - allergic reaction, tick borne diseases', 1, '2025-01-13 22:10:50'),
(33, 'Working near heavy machinery', 1, '2025-01-13 22:10:50'),
(34, 'Working near road sides - impact injuries from vehicles', 1, '2025-01-13 22:10:50'),
(35, 'Working near water - drowning', 1, '2025-01-13 22:10:50'),
(36, 'Working with schools', 1, '2025-01-13 22:10:50'),
(37, 'Working with/ near Power Auger', 1, '2025-01-13 22:10:50'),
(38, 'Working with/ near animals', 1, '2025-01-13 22:10:50'),
(39, 'Working with/ near brush cutters', 1, '2025-01-13 22:10:50'),
(40, 'Working with/ near chainsaws', 1, '2025-01-13 22:10:50');


/*--Populate the risks table*/
INSERT INTO risks (id, risk_title_id, likelihood, consequences, created_at) VALUES
(1, 1, 'unlikely', 'moderate', NOW()),
(2, 2, 'likely', 'major', NOW()),
(3, 3, 'almost certain', 'minor', NOW());



/*-- Populate the risk_controls table
-- ==================================================
-- RISK ID 1:  Asbestos-containing Materials
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isreadonly)VALUES
(1, 'Explain and demonstrate how to use, carry and store tools correctly.', 1),
(1, 'Do not wear jewellery that may become entangled.', 1),
(1, 'Maintain strict supervision.', 1),
(1, 'Use and maintain tools in accordance with manufacturer specifications.', 1),
(1, 'Specify and maintain a safe buffer zone around users.', 1),
(1, 'Ensure all equipment are in a safe working condition.', 1),
(1, 'Check for broken or cracked components or switches.', 1),
(1, 'Emergency shutdown procedures in place.', 1),
(1, 'Check that protective guards on tools are attached and effective.', 1),
(1, 'Clear trip hazards from the work site.', 1),
(1, 'Check team members have hair tied back and clothing tucked in, including drawstrings on jackets, hats, etc.', 1),
(1, 'Wear appropriate PPE as recommended by the manufacturer e.g. eye and ear protection, safety boots.', 1),
(1, 'Work with project partner/landholder to identify and isolate any areas that contain material suspected as being asbestos (before the project starts).', 1),
(1, 'Do not work in areas contaminated by asbestos.', 1),
(1, 'Volunteers to immediately notify supervisor if they find material that may contain asbestos.', 1),
(1, 'Do not remove or handle any material that may contain asbestos.', 1),
(1, 'Do not disturb soil or any other material that may contain asbestos.', 1),
(1, 'If you suspect asbestos, use flagging tape to cordon off the area, record the location (site name, description, !at/longs) and work in a different area.', 1),
(1, 'Team Leader to notify Regional Manager immediately upon finding suspected asbestos containing material.', 1);

/*-- ==================================================
-- RISK ID 2:   Bites & Stings  
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(2, 'ID and redeploy people with known allergies.', 1),
(2, 'Visually inspect site for insect/ spider activity.', 1),
(2, 'Mark and avoid insect nests.', 1),
(2, 'Wear PPE; Long sleeves & pants, gloves, enclosed shoes and hat.', 1),
(2, 'Provide and use insect repellent.', 1);

/*-- ==================================================
-- RISK ID 3:  Boardwalk Construction - impact injuries, strains, manual handling,
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(3, 'Arrange for materials to be delivered as near as possible to the work site to reduce the need for carrying.', 1),
(3, 'Keep the work site tidy and minimise trip hazards such as power cords, tools, timber.', 1),
(3, 'Erect signs that warn the public and restrict access to the work site.', 1),
(3, 'Do not allow team members to walk along bearers and joists.', 1),
(3, 'Specify & maintain a safe working space between team members.', 1),
(3, 'Maintain clear access to the construction site, and in any areas where tools or timber will be carried..', 1),
(3, 'Wear appropriate PPE, e.g. hard hats if working at different levels.', 1);

/*-- ==================================================
-- RISK ID 4:  Bushfire
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(4, 'Ensure that all team members know the boundaries of the survey area and remain within them at all times.', 1),
(4, 'Set times at which teams must return or report to the supervisor.', 1),
(4, 'Anyone lost should find nearest shelter & use distress signal (3 whistle blasts).', 1),
(4, 'Instruct that any team member who becomes lost should find the nearest shelter and remain there while using an agreed distress signal eg. three whistle blasts.', 1),
(4, 'Ensure that all team members have means of communicating an emergency signal (eg: whistle, radios) and fully understand the signals to be used.', 1),
(4, 'If the survey involves collecting seats, ensure that this is done hygienically eg. by using gloves, tongs etc.', 1),
(4, 'Work in pairs as a minimum group size.', 1),
(4,'Wear boots that are suitable for walking, and sufficiently sturdy for the terrain.', 1);
/*-- ==================================================
-- RISK ID 5:   Bushwalking
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(5, 'Check that all participants have the physical capacity to safely complete the planned walk.',1),
(5, 'If unfamiliar with the route, seek local advice and carry a reliable map.',1),
(5, 'Do not proceed, or modify the plan, if extreme weather is likely. (Do not proceed on days of total fire ban.)',1),
(5, 'Advise a reliable person of the proposed route and return time. Advise this person when the group has returned.',1),
(5, 'Remind participants to carry necessary medications eg. Ventolin.',1),
(5, 'Check that all participants have sufficient water.',1),
(5, 'Check that participants have suitable footwear and clothing for the likely weather and terrain.',1),
(5, 'Regulate walk pace. Generally the leader will walk at the front.',1),
(5, 'Appoint a reliable person as "whip" or "tailend Charlie" who remains at the rear of the group and alerts the leader to any problems.',1),
(5, 'Provide each person with a whistle and ensure that each person knows that three long blasts is the standard emergency/distress signal.',1),
(5, 'Carry a first aid kit.', 1);

/*-- ==================================================
-- RISK ID 6:  COVID-19
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(6, 'COVID 19 Management SOP in place.', 1),
(6, 'In-depth screen process for all new employees, volunteers and participants.', 1),
(6, 'COVID-19 specific induction process.', 1),
(6, 'Cleaning and disinfection regimen at all CV managed projects and activities.', 1),
(6, 'Good personal hygiene practices reinforced.', 1),
(6, 'Appropriate hygiene supplies available for each worksite.', 1),
(6, 'All workers to have their own personally labelled items.', 1),
(6, 'All worksites and CV vehicles to have a cleaning register.', 1);

/*-- ==================================================
-- RISK ID 7:  working with the Chemical use / poisoning 
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(7, 'Read, retain and comply with the relevant Material Safety Data Sheet (MSDS).', 1),
(7, 'Check that there are no leaks in containers, and that spray equipment is operating correctly.', 1),
(7, 'Rotate tasks to avoid prolonged periods of exposure; specify frequency of rotations.', 1),
(7, 'Explain and demonstrate how to use, carry and store correctly.', 1),
(7, 'Specify and maintain safe working distance to avoid splash or spray drift contamination and take account of wind (spray drift) direction.', 1),
(7, 'Provide adequate washing facilities as directed by the MSDS.', 1),
(7, 'Wear appropriate PPE as advised on the MSDS. (Note that the use of certain PPE may accelerate the onset of heat stress.)', 1);
/*-- ==================================================
-- RISK ID 8:     Collecting sharps
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(8, 'Use tongs to pick up sharps', 1),
(8, 'Determine a search strategy i.e. gain local knowledge of area, conduct a visual inspection of the site and flag any sharps for collection, minimise the number of persons involved in a search.', 1),
(8, 'Rake through known areas of disposal.', 1),
(8, 'Maintain a safe working distance of at least two metres to avoid the inadvertent scratching or spiking of other team members.', 1),
(8, 'Provide soap and water on site.', 1),
(8, 'Withdraw team if necessary to allow for professional removal of sharps.', 1),
(8, 'Put all sharps in approved sharps containers for disposal. Disposal to be in accordance with local health authority/council regulations.', 1),
(8, 'Wear gloves, sturdy footwear and high visibility vest. Eye protection may also be necessary.', 1);
/*-- ==================================================
-- RISK ID 9:  Fencing - injuries from wire 
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(9, 'Arrange delivery of materials as near to fencing site as possible ie. minimise the need for carrying.', 1),
(9, 'Use only approved methods of straining wire with a proper fencing strainer. Do not use a vehicle to strain wire.', 1),
(9, 'Keep team members, who are not directly involved, well clear of any unsecured wire under tension.', 1),
(9, 'Demonstrate correct use of picket rammers, with emphasis on head, eye, hearing and hand safety.', 1),
(9, 'Do not raise the barrel of the rammer clear of the picket head.', 1),
(9, 'Specify and maintain safe working space between team members, especially when digging post holes or ramming the base of posts.', 1),
(9, 'Keep the work site clear of trip hazards such as posts, wire off-cuts, stones, tools etc.', 1),
(9, 'Wear gloves and eye protection whenever working with, or in close proximity to, wire that is coiled or under tension. Gloves should have gauntlets that protect the wrists when handling barbed wire.', 1),
(9, 'Wear gloves when handling chemically treated posts.', 1);

/*-- ==================================================
-- RISK ID 10:  Litter collection - laceration/spike injuries, bites/
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(10, 'Ensure adequate washing facilities are available and are used by team members.', 1),
(10, 'Look carefully at litter items or piles that might be a refuge for snakes or spiders.', 1),
(10, 'Check objects for spikes or sharp edges.', 1),
(10, 'Use tongs to pick up any objects that are known, or suspected, to be dangerous eg. syringes.', 1),
(10, 'Place any syringes in a proper sharps container.', 1),
(10, 'Seek assistance when lifting heavy objects.', 1),
(10, 'Wear gloves and eye protection when handling litter.', 1),
(10, 'Place any glass or other small sharp objects on a bucket or other hard sided container.', 1);

/*-- ==================================================
-- RISK ID 11:  Manual Handling
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(11,'Gentle warm up stretches prior to starting task/activity.', 1), 
(11, 'Use mechanical aids.', 1), 
(11, 'Set weight limits based on load terrain and people.', 1), 
(11, 'Eliminate or limit twisting and over-reaching.', 1), 
(11, 'Use 2 person lift where necessary.', 1), 
(11, 'Rotate tasks.', 1), 
(11, 'Maintain and check equipment condition.', 1), 
(11, 'Team Leader/Project Coord to demonstrate correct technique.', 1), 
(11, 'Direct supervision provided by Team Leader/Project Coord.', 1);

/*-- ==================================================
-- RISK ID 12:  Mulching - inhalation/eye injury
-- ==================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(12, 'Explain and demonstrate wheelbarrow loading and use.', 1), 
(12, 'Explain and demonstrate correct techniques for using a rake.', 1), 
(12, 'Explain and demonstrate correct use of fork/shovel.', 1), 
(12, 'Explain and demonstrate how to carry, put down and store the tools, giving consideration to both the users and the general public.', 1), 
(12, 'Check that all tools are in good repair, and that there are no split handles or loose tool heads.', 1),
(12, 'Redeploy to other tasks (upwind), any person who has disclosed a pre-existing respiratory infection or allergy eg. Asthma.', 1), 
(12, 'Damp down mulch before working with it.', 1), 
(12, 'Maintain safe working distance of at least 3 metres.', 1), 
(12, 'So far as possible, clear the area of any trip hazards.', 1); 

/*-- ==================================================
-- RISK ID 13:  Plant Propagation - Strains, soil borne diseases, 
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(13, 'Avoid prolonged standing on hard surfaces.', 1),
(13, 'Rotate tasks, even if team members are not experiencing discomfort.', 1),
(13, 'Take regular breaks for stretching and gentle exercise.', 1),
(13, 'Provide adequate washing facilities.', 1),
(13, 'Open bags of potting mix at arms length. (Avoid breathing the dust that may be released.)', 1),
(13, 'Damp down potting mix before use.', 1),
(13, 'Have eye protection available, and use as required.', 1),
(13, 'Wear gloves when handling soil.', 1),
(13, 'Wear face masks when handling potting mix.', 1);

/*-- ==================================================
-- RISK ID 14:  Predator control /checking traps
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(14, 'must be competent and confident in trap setting',1),
(14, 'check weather before',1),
(14, 'check all kit/tools on hand relevant to length of trap line; eg water',1),
(14, 'advise ‘buddy’ of leaving and return',1),
(14, 'wear disposable or washable gloves when handling traps/disposing of carcases',1),
(14, 'tongs used for clearing /cleaning traps',1),
(14, 'Use setting tools',1), 
(14, 'Carry hand sanitiser',1), 
(14, 'Wear high-vis vest -esp. if traps along road.',1);

/*-- ==================================================
-- RISK ID 15:  Seed collection - cuts/scratches, eye injuries
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(14, 'Rotate tasks to guard against postural overuse injuries.', 1),
(14, 'Specify and maintain a safe working distance between team members.', 1),
(14, 'Explain and demonstrate tool use.', 1),
(14, 'Ensure not team members are working directly under others.', 1),
(14, 'Wear PPE including safety glasses, gloves, high vis vests and if required hard hats.', 1);

/*-- ==================================================
-- RISK ID 16:  Slips, Trips & Falls
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(15, 'Remove trip hazards.', 1),
(15, 'Mark trip hazards.', 1),
(15, 'Ensure appropriate footwear with grip worn.', 1),
(15, 'Establish paths across slopes.', 1),
(15, 'Do not carry loads that limit visibility.', 1),
(15, 'Station vehicle in location with good access.', 1),
(15, 'Direct supervision by Team Leader/Project Coard.', 1);

/*-- ==================================================
-- RISK ID 17:  Soil Borne Diseases & Inflections
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(16, 'ID team members in higher risk categories (diabetes, lung/kidney disease, open cuts) and deploy.', 1),
(16, 'Cover any minor cuts or scratches prior to work.', 1),
(16, 'Suppress dust and modify task to reduce dust.', 1),
(16, 'Provide washing facilities and wash areas of potential soil contact prior to eating and drinking.', 1),
(16, 'Wear PPE; Long sleeves & pant, enclosed shoes, hat (when outside), gloves (impervious if wet), safety glasses, dust masks (if large amounts of dust).', 1);

/*-- ==================================================
-- RISK ID 18:  Surveying & Data Collection
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(17, 'Ensure that all team members know the boundaries of the survey area and remain within them at all times.', 1),  
(17, 'Set times at which teams must return or report to the supervisor.', 1), 
(17, 'Instruct that any team member who becomes lost should find the nearest shelter and remain there while using an agreed distress signal eg. three whistle blasts.', 1),
(17, 'Ensure that all team members have means of communicating an emergency signal (eg: whistle, radios) and fully understand the signals to be used.', 1),
(17, 'If the survey involves collecting seats, ensure that this is done hygienically eg. by using gloves, tongs etc.', 1),  
(17, 'Work in pairs as a minimum group size.', 1),  
(17, 'Wear boots that are suitable for walking, and sufficiently sturdy for the terrain.', 1);

/*-- ==================================================
-- RISK ID 19:  Track Construction and Maintenance - impact 
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(18, 'Arrange delivery of tools and materials so as to minimise distance over which things need to be carried.', 1),
(18, 'Encourage gentle warm up stretches before commencement and after breaks.', 1),
(18, 'Maintain tools in good condition.', 1),
(18, 'Maintain safe working distance of at least 3 metres.', 1),
(18, 'Arrange emergency communication and explain this to all team members.', 1),
(18, 'Rotate tasks even if team members are not experiencing discomfort.', 1),
(18, 'Wear appropriate PPE inc. high visibility vests, gloves, safety glasses.', 1),
(18, 'Ensure that boots are suitable for walking, and sufficiently sturdy for the terrain.', 1);

/*-- ==================================================
-- RISK ID 20:  Tree Planting/ impact injuries, muscle strain
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(19, 'Conduct a visual inspection of the site, and remove potential risks such as broken glass, wire etc.', 1),
(19, 'Use kneeling mats or padding if there is a danger of spike injuries from glass, stones etc.', 1),
(19, 'Rotate tasks, even if team members are not experiencing discomfort.', 1),
(19, 'Take regular breaks and encourage gentle stretching.', 1),
(19, 'Provide adequate hand washing facilities.', 1),
(19, 'Specify and maintain a safe working space between team members; usually two metres.', 1),
(19, 'Wear gloves when handling soil, and additional PPE as necessary.', 1);

/*-- ==================================================
-- RISK ID 21:  Using Machete or cane knife
-- ==================================================*/
INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES
(20, 'Use only when an alternate tool is not practicable (eg loppers, hand saws, secateurs or similar).', 1),
(20, 'Ensure machetes are kept sharp.', 1),
(20, 'Team leaders only to sharpen (sharpen away from blade).', 1),
(20, 'Ensure handle and wrist strap are securely fastened.', 1),
(20, 'Only assign machetes to volunteers who have previously demonstrated high levels of responsibility.', 1),
(20, 'Allow a maximum of four machetes to be used at any one time.', 1),
(20, 'Team Leader to maintain direct supervision.', 1),
(20, 'Demonstrate correct use, including appropriate cutting angle (to avoid blade bouncing off target) and safe working distance (5 metre buffer zone).', 1),
(20, 'Use only for cutting soft vegetation (small branches, vines, grasses etc) not hard wood.', 1),
(20, 'Ensure appropriate PPE is worn, including gloves, long pants, sturdy boots and shin pads.', 1),
(20, 'Rotate tasks or take regular breaks to maintain concentration and reduce repetitive strain injury.', 1),
(20, 'Cover blade with a sheath or split hose when not in use, and store in an appropriate place.', 1);

/*-- ===============================
-- RISK ID 21: Using Power Tools
-- ===============================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(21, 'Explain and demonstrate how to use, carry and store tools correctly.', 1),
(21, 'Maintain strict supervision.', 1),
(21, 'Use and maintain tools in accordance with manufacturer specifications.', 1),
(21, 'Specify and maintain a safe buffer zone around power tool users.', 1),
(21, 'Ensure all equipment and lead attachments have been tested and tagged and are in a safe working condition and protected from water.', 1),
(21, 'No broken plugs, sockets or switches.', 1),
(21, 'Emergency shutdown procedures in place.', 1),
(21, 'Circuit breaker/safety switch installed and/or RCD used when operating tool.', 1),
(21, 'Start/stop switches clearly marked, in easy reach of operator.', 1),
(21, 'Check that protective guards on tools are attached and effective.', 1),
(21, 'Clear trip hazards from the work site.', 1),
(21, 'Position the generator, if used, in a dry, stable location and prevent access to it by unauthorised people.', 1),
(21, 'Check that team members have hair tied back and clothing tucked in.', 1),
(21, 'Wear appropriate PPE (eye, ear, face protection, safety boots, hi-vis).', 1);

/*-- ============================================
-- RISK ID 22: Using Swinging Tools
-- ============================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(22, 'Ensure that suitable work boots, with reinforced toes, are being worn.', 1),
(22, 'Encourage gentle warm up stretches before commencement and after breaks.', 1),
(22, 'Maintain safe working distance of at least 3 metres; for short handled tools (e.g. hammer), 2 metres.', 1),
(22, 'Explain and demonstrate how to use, carry and store tools correctly.', 1),
(22, 'Maintain tools in good condition.', 1),
(22, 'Establish a firm footing before swinging tools.', 1),
(22, 'Raise tools no more than shoulder height on back swing.', 1),
(22, 'Rotate tasks to avoid fatigue; specify rotation frequency if needed.', 1),
(22, 'Adjust duration of work to physical capacities of team members.', 1),
(22, 'Wear appropriate PPE (hi-vis vest, hard hat, glasses, gloves).', 1);

/*-- ==============================================
-- RISK ID 23: Using Temporary Accommodation
-- ==============================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(23, 'Clear all exits so they are uncluttered and readily accessible.', 1),
(23, 'Inspect all gas and electrical appliances to ensure safe, operational condition.', 1),
(23, 'Do not overload power points with too many appliances.', 1),
(23, 'Formulate a fire evacuation plan and communicate it to all team members.', 1),
(23, 'Remove any combustible materials near a possible fire source.', 1),
(23, 'Ensure backup (emergency) lighting is available (e.g. extra torches).', 1),
(23, 'Enforce "No Smoking" policy.', 1),
(23, 'Keep food storage and preparation areas clean, and toilets hygienic.', 1),
(23, 'Store garbage outside the accommodation, dispose at earliest opportunity.', 1);

/*-- ===========================================
-- RISK ID 24: Using picket rammers
-- ===========================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(24, 'Use rammers with a minimum length of 1.2 metres.', 1),
(24, 'Explain and demonstrate proper technique for picket ramming.', 1),
(24, 'Encourage gentle warm up stretches before commencing picket ramming.', 1),
(24, 'Assign only to those physically capable of performing safely.', 1),
(24, 'Rotate tasks, even if members are not experiencing discomfort.', 1),
(24, 'Only grip the vertical section of the handles when using the rammer.', 1),
(24, 'Do not lift the rammer off the post during operation.', 1);

/*-- =============================
-- RISK ID 25: Vehicle Travel
-- =============================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(25, 'Comply with all road laws.', 1),
(25, 'Complete pre-start checklist prior to operation.', 1),
(25, 'Wear seat belts when vehicle is in motion.', 1),
(25, 'Secure all tools/equipment in cargo area.', 1),
(25, 'Minimise distraction and take breaks on long drives.', 1),
(25, 'Appoint navigator to assist with directions.', 1),
(25, 'Appoint a spotter when reversing.', 1),
(25, 'Close all doors/tailgates before vehicle moves; maintain vehicle as per manual.', 1);

/*-- ============================================
-- RISK ID 26: Weeding (scratches, strains...)
-- ============================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(26, 'Wear gloves whenever hands are at ground level.', 1),
(26, 'Encourage gentle warm up stretches.', 1),
(26, 'Comply with all MSDS directions if using chemicals.', 1),
(26, 'Maintain safe working space between team members.', 1),
(26, 'Provide adequate washing facilities.', 1),
(26, 'Wear eye protection for risk of chemical splashes or twig spikes.', 1);

/*-- =========================================================
-- RISK ID 27: Working at heights (falls, falling objects)
-- =========================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(27, 'Use safety rails, fall arrest devices, and helmet if fall height >2m.', 1),
(27, 'Check for electrical services in the work location.', 1),
(27, 'Maintain exclusion zone beneath elevated worker.', 1),
(27, 'Use well maintained ladder on non-slip surface.', 1),
(27, 'Only one person on ladder at a time; limit work at height.', 1),
(27, 'Secure tools/equipment used at height.', 1),
(27, 'Always face the ladder when ascending/descending.', 1),
(27, 'Appoint spotters if necessary.', 1);

/*-- =======================================================================
-- RISK ID 28: Working in Cold Conditions (Hypothermia)
-- =======================================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(28, 'Provide warm food/drinks if possible.', 1),
(28, 'Gentle warm up stretches before starting work/after breaks.', 1),
(28, 'Rotate tasks; avoid prolonged exposure in cold conditions.', 1),
(28, 'Use sheltered area during inactivity or extreme conditions.', 1),
(28, 'Schedule work outside the coldest times of day.', 1),
(28, 'Encourage layered clothing to adjust to weather and activity.', 1),
(28, 'Wear a warm hat, gloves, and appropriate footwear.', 1);

/*-- ========================================================
-- RISK ID 29: Predator control / checking traps
-- ========================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(29, 'Be competent/confident in trap setting.', 1),
(29, 'Check weather conditions beforehand.', 1),
(29, 'Have all necessary kit/tools, including water.', 1),
(29, 'Advise a "buddy" of departure and return times.', 1),
(29, 'Wear disposable or washable gloves for handling traps/carcasses.', 1),
(29, 'Use tongs for clearing/cleaning traps.', 1),
(29, 'Use setting tools as appropriate.', 1),
(29, 'Carry hand sanitizer.', 1);

/*-- =====================================================
-- RISK ID 30: Working in Windy Conditions
-- =====================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(30, 'Check local weather forecast for severe wind warnings.', 1),
(30, 'Assess if large trees, dead limbs, or hanging timber could fall.', 1),
(30, 'Consider activity type (mulching/digging may stir up dust/debris).', 1),
(30, 'Check bushfire warnings; windy weather can escalate fire risk.', 1),
(30, 'Confirm no participant has severe respiratory issues (e.g. asthma).', 1);

/*-- ==========================================
-- RISK ID 31: Working in the dark
-- ==========================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(31, 'Verify no participant is unfit (physically/psychologically) for night work.', 1),
(31, 'Ensure each person has a reliable torch.', 1),
(31, 'Advise participants to wear layered clothing.', 1),
(31, 'Confirm boundaries and meeting points before starting.', 1),
(31, 'Work in pairs minimum; use a buddy system.', 1),
(31, 'Inspect site in daylight to remove or mark hazards.', 1),
(31, 'Issue whistles for emergency signals (3 blasts).', 1),
(31, 'Avoid slippery or rough terrain.', 1),
(31, 'Minimise gear carried.', 1),
(31, 'Wear high visibility vests.', 1);

/*-- ============================================================
-- RISK ID 32: Working in tick habitat (allergic reaction...)
-- ============================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(32, 'Seek local advice on tick presence; reconsider if severe infestation.', 1),
(32, 'Wear long trousers tucked into socks, long sleeves, broad-brimmed hat.', 1),
(32, 'Use light-colored clothing to spot ticks easily.', 1),
(32, 'Apply DEET repellent to exposed skin.', 1),
(32, 'Minimise vegetation disturbance; short work periods in high-tick areas.', 1),
(32, 'After leaving area, check hair, neck, behind ears for ticks.', 1),
(32, 'Check thoroughly in shower for any ticks.', 1),
(32, 'If possible, run clothes in a hot dryer for 20 minutes post-activity.', 1);

/*-- =================================================
-- RISK ID 33: Working near heavy machinery
-- =================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(33, 'Eliminate or reduce need to work near heavy machinery.', 1),
(33, 'Advise machine operator of worker locations/patterns.', 1),
(33, 'Maintain direct liaison between team, supervisor, and operator.', 1),
(33, 'Develop and demonstrate clear signals, understood by all.', 1),
(33, 'Work upwind or out of dust/fume range.', 1),
(33, 'Use a spotter to provide additional supervision.', 1);

/*-- =============================================================
-- RISK ID 34: Working near road sides (vehicle impact)
-- =============================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(34, 'Minimise need to work near roadsides.', 1),
(34, 'Use appropriate signage: SLOW DOWN, WORKERS NEAR ROADSIDE, etc.', 1),
(34, 'Must have trained/authorised person for roads authority compliance.', 1),
(34, 'Maintain direct/continuous supervision.', 1),
(34, 'Spotter to supervise. Check signals are clear/unambiguous.', 1),
(34, 'Work upwind or out of dust/fume range.', 1),
(34, 'Wear high visibility vests/clothing.', 1);

/*-- =======================================================
-- RISK ID 35: Working near water (drowning)
-- =======================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(35, 'Keep safe distance if water is deep, swift, or hazardous.', 1),
(35, 'Mark no-go zones on steep/slippery banks.', 1),
(35, 'Identify non-swimmers; keep them away from higher-risk areas.', 1),
(35, 'Have rescue aids (rope, pole, flotation) downstream of likely entry.', 1),
(35, 'Create emergency plan for non-contact water rescue.', 1),
(35, 'Follow policy: no recreational swimming for volunteers.', 1),
(35, 'Encourage dry spare socks.', 1),
(35, 'Provide washing facilities (soap, clean water).', 1);

/*-- =========================================
-- RISK ID 36: Working with schools
-- =========================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(36, 'Never be alone with a school student/young person.', 1),
(36, 'Arrange access to toilet not used by students if possible.', 1),
(36, 'Avoid moving CV vehicle when students are in close proximity.', 1),
(36, 'Coordinate breaks to avoid conflict with student meal times.', 1),
(36, 'Store tools/personal items safely; no unsupervised areas.', 1),
(36, 'Teacher must remain present if students near a CV team.', 1),
(36, 'Observe sign in/out, school rules, no offensive slogans, etc.', 1),
(36, 'Know the school’s emergency evacuation plan and muster point.', 1);

/*-- ============================================================
-- RISK ID 37: Working with/ near Power Auger
-- ============================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(37, 'Operator must be trained/competent to use auger.', 1),
(37, 'Operator must be physically able to handle it safely.', 1),
(37, 'Check mechanical condition of auger before use.', 1),
(37, 'Remove obstacles/missiles (stones, wire) from area before starting.', 1),
(37, 'No one else within 20m while auger runs.', 1),
(37, 'Others in vicinity must wear eye protection.', 1),
(37, 'Follow manufacturer’s specs for use/maintenance.', 1),
(37, 'Keep hands/feet clear of rotating auger bit.', 1),
(37, 'Stop auger if others approach.', 1),
(37, 'Appoint spotter for site surveillance.', 1),
(37, 'Engage auger brake when moving holes; turn off auger when not in use.', 1),
(37, 'Limit continuous auger use to ~20 mins to avoid muscle strain/overheating.', 1),
(37, 'Wear PPE: boots, gloves, ear protection, hi-vis vest.', 1);

/*-- ==============================================
-- RISK ID 38: Working with/near animals
-- ==============================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(38, 'Provide appropriate animal handling training.', 1),
(38, 'All team members must be alert for unpredictable animal behavior.', 1),
(38, 'Consider physical strength/stature for handling certain animals.', 1),
(38, 'Wear PPE: glasses, gloves, long sleeves.', 1),
(38, 'Ensure adequate personal hygiene (clean water/soap).', 1);

/*-- =================================================
-- RISK ID 39: Working with/ near brush cutters
-- =================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(39, 'Ensure operator is trained to use brush cutter safely.', 1),
(39, 'Check mechanical condition prior to use.', 1),
(39, 'Remove obstacles/potential missiles from area.', 1),
(39, 'No one within 20m while brush cutter is running.', 1),
(39, 'Others in area must wear eye protection.', 1),
(39, 'Follow manufacturer specs for use/maintenance.', 1),
(39, 'Keep hands/feet clear of moving parts.', 1),
(39, 'Stop if others approach; turn off when not in use.', 1),
(39, 'Appoint spotter for site surveillance.', 1),
(39, 'Wear PPE: eye/face protection, boots, ear protection, hi-vis.', 1);

/*-- ==================================================
-- RISK ID 40: Working with/ near chainsaws
-- ==================================================*/
INSERT INTO risk_controls (risk_id, control_text, isReadOnly) VALUES
(40, 'Use only licensed operators for chainsaws.', 1),
(40, 'Post warning signs at work area boundaries.', 1),
(40, 'Clear workers/debris from immediate area & fall zone.', 1),
(40, 'Appoint spotter to guard against bystanders.', 1),
(40, 'Everyone on site wears high visibility vests.', 1),
(40, 'Engage chain brake when not cutting.', 1),
(40, 'Start saw on the ground (NO drop start).', 1),
(40, 'Wear appropriate PPE: hard hat, ear muffs, boots, face guard, chainsaw chaps.', 1);


/*--Populate the project_risks table*/
INSERT INTO project_risks (id, project_id, risk_id, created_at) VALUES
(1, 1, 1, NOW()),
(2, 1, 2, NOW());


/*-- Populate project_risk_controls table*/
INSERT INTO project_risk_controls (id, project_id, risk_control_id, is_checked, created_at) VALUES
(1, 1, 1, 1, NOW()),
(2, 1, 2, 0, NOW());
