

INSERT INTO login (firstname, lastname, username, password, role) VALUES
('Dave', 'Sharp', 'dsharp@cvnz.org.nz', '$2b$10$N7DPleAOP2N.y7WduTzDNOZgZUJe/1rMbFaMcYd4a1G.5q4dGzEwO', 'Admin'),
('Sue', 'Zadeh', 'suezadeh.a@gmail.com', '$2b$10$eSvyjg24wZ5dtU62eJwbruhgrP3Sypb2KF173D.zJoiIH1RXbXEFe', 'Admin'),
('john', 'Doe', 'admin1@example.com', '$2b$10$rwIEU2qP2HIWYqcEkOLBQeUvjT0fKKRHu7RSOBbQwvqrzc1nGemFu', 'Admin'),
('Helen', 'voly', 'admin2@example.com', '$2b$10$Vsnykdh17MiXGioCef2BoO4z/zL6iZE9YQRH5YJux89suK5SZyDu2', 'Admin'),
('Bill', 'Hey', 'admin3@example.com', '$2b$10$.Ok2dnOA0lXmyuLE9IfpIOj9IBM7gkS8manwOb0EU1I4A8JfOtqdG', 'Admin');

-- Populate the table with sample data
INSERT INTO registration (firstname, lastname, email, phone, role) VALUES
('John', 'Doe', 'john.doe@example.com', '1234567890', 'Volunteer'),
('Jane', 'Smith', 'jane.smith@example.com', '0987654321', 'Field Staff'),
('Alice', 'Brown', 'alice.brown@example.com', '5678901234', 'Team Leader'),
('Mark', 'Taylor', 'mark.taylor@example.com', '4567890123', 'Volunteer'),
('Emily', 'Davis', 'emily.davis@example.com', '7890123456', 'Field Staff');
