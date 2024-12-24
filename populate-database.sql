
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
