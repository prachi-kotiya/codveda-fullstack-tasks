
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env file");
}

// Register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (
        typeof name !== "string" || !name.trim() ||
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof password !== "string" || password.length < 8
    ) {
        return res.status(400).json({
            message: "Valid name, email and password (at least 8 characters) are required"
        });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();

        const [existing] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
            [name.trim(), normalizedEmail, hashedPassword]
        );

        res.status(201).json({
            message: "Registration successful",
            user: {
                id: result.insertId,
                name: name.trim(),
                email: normalizedEmail,
                role: "user"
            }
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({ message: "Registration failed" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (
        typeof email !== "string" || !email.trim() ||
        typeof password !== "string" || !password
    ) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        const [rows] = await pool.execute(
            "SELECT id, name, email, password, role FROM users WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        if (
            rows.length === 0 ||
            !(await bcrypt.compare(password, rows[0].password))
        ) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = rows[0];

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Login failed" });
    }
});

module.exports = router;
