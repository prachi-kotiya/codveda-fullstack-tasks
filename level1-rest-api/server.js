
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// GET - Get all students
app.get("/api/students", async (req, res) => {
    try {
        const [students] = await pool.query(
            "SELECT * FROM students ORDER BY id ASC"
        );
        res.status(200).json(students);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to fetch students" });
    }
});

// GET - Get one student
app.get("/api/students/:id", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM students WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to fetch student" });
    }
});

// POST - Add a student
app.post("/api/students", async (req, res) => {
    const { name, age, course } = req.body;

    if (
        typeof name !== "string" || !name.trim() ||
        !Number.isInteger(Number(age)) || Number(age) <= 0 ||
        typeof course !== "string" || !course.trim()
    ) {
        return res.status(400).json({
            message: "Valid name, positive age and course are required"
        });
    }

    try {
        const [result] = await pool.execute(
            "INSERT INTO students (name, age, course) VALUES (?, ?, ?)",
            [name.trim(), Number(age), course.trim()]
        );

        const [rows] = await pool.execute(
            "SELECT * FROM students WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            message: "Student added successfully",
            student: rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to add student" });
    }
});

// PUT - Update a student
app.put("/api/students/:id", async (req, res) => {
    const { name, age, course } = req.body;

    if (
        typeof name !== "string" || !name.trim() ||
        !Number.isInteger(Number(age)) || Number(age) <= 0 ||
        typeof course !== "string" || !course.trim()
    ) {
        return res.status(400).json({
            message: "Valid name, positive age and course are required"
        });
    }

    try {
        const [result] = await pool.execute(
            "UPDATE students SET name = ?, age = ?, course = ? WHERE id = ?",
            [name.trim(), Number(age), course.trim(), req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        const [rows] = await pool.execute(
            "SELECT * FROM students WHERE id = ?",
            [req.params.id]
        );

        res.status(200).json({
            message: "Student updated successfully",
            student: rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to update student" });
    }
});

// DELETE - Delete a student
app.delete("/api/students/:id", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM students WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        await pool.execute(
            "DELETE FROM students WHERE id = ?",
            [req.params.id]
        );

        res.status(200).json({
            message: "Student deleted successfully",
            student: rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to delete student" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
