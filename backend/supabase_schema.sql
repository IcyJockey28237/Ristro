-- Supabase Database Schema for Ristro
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_price INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price_at_time INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on menu category
CREATE INDEX idx_menu_items_category ON menu_items(category);

-- Insert sample admin user (password: admin123)
-- IMPORTANT: Change this password in production!
INSERT INTO users (name, email, hashed_password, role) VALUES
('Admin', 'admin@ristro.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MebAJu', 'admin');

-- Insert sample menu items
INSERT INTO menu_items (title, description, price, category, image_url, available) VALUES
('Pasta Truffle', 'Creamy truffle pasta with parmesan', 1299, 'Main Course', '/dishes/pasta_truffle.png', true),
('Croissant', 'Buttery flaky French croissant', 399, 'Breakfast', '/dishes/croissant.png', true),
('Cheesecake', 'New York style cheesecake with berry compote', 599, 'Dessert', '/dishes/cheesecake.png', true),
('Coffee Latte', 'Smooth espresso with steamed milk', 299, 'Beverages', '/dishes/coffee_latte.png', true);
