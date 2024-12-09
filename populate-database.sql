

INSERT INTO login (username, password, role) VALUES
('dsharp@cvnz.org.nz', 'Ausnew#2021!', 'Admin'),
('admin 1', '$2b$10$S0L7QCgQgD6Mzs5M4QHcPOk0i3vblotdTO4haMQ/ppaKYmfPNjVn.', 'Admin'),
('admin 2', '$2b$10$tNSIQA7/hHHD19AGey5U1Ov0bAHfUVj2cKjldk1E2kQJkTjGduxVO', 'Admin'),
('admin 3', '$2b$10$DA0t.LhyUkIEfLorNgyCaOklJrKAIrrDoS1dyy3rnBGloyaySrGMS', 'Admin');

-- Populate the table with sample data
INSERT INTO registration (firstname, lastname, email, phone, role) VALUES
('John', 'Doe', 'john.doe@example.com', '1234567890', 'Volunteer'),
('Jane', 'Smith', 'jane.smith@example.com', '0987654321', 'Field Staff'),
('Alice', 'Brown', 'alice.brown@example.com', '5678901234', 'Team Leader'),
('Mark', 'Taylor', 'mark.taylor@example.com', '4567890123', 'Volunteer'),
('Emily', 'Davis', 'emily.davis@example.com', '7890123456', 'Field Staff');
