create database rakta_connect;
use rakta_connect;
USE blood_donation;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    password VARCHAR(255),
    role ENUM('donor','ngo','hospital','bloodbank','csr','admin'),
    age INT,
    blood_type VARCHAR(10),
    reward_points INT DEFAULT 0
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ngo_id INT,
    event_name VARCHAR(200),
    description TEXT,
    location VARCHAR(200),
    google_form_link TEXT,
    FOREIGN KEY (ngo_id) REFERENCES users(id)
);

CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT,
    event_id INT,
    status ENUM('pending','verified') DEFAULT 'pending',
    points_awarded INT DEFAULT 0
);

CREATE TABLE rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reward_name VARCHAR(200),
    points_required INT,
    quantity INT
);

CREATE TABLE claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT,
    reward_id INT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending'
);

select * from users;

CREATE TABLE sos_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT,
    description TEXT,
    location VARCHAR(255),
    blood_type VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);
