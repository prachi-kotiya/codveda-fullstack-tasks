const express = require("express");

const app = express();

app.use(express.json());

const PORT = 3000;

// Temporary student data
let students = [
    {
        id: 1,
        name: "Rahul",
        age: 20,
        course: "BCA"
    },
    {
        id: 2,
        name: "Priya",
        age: 21,
        course: "BCA"
    }
];

// GET - Get all students
app.get("/api/students", (req, res) => {
    res.status(200).json(students);
});

// GET - Get one student
app.get("/api/students/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const student = students.find(student => student.id === id);

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    res.status(200).json(student);
});

// POST - Add a student
app.post("/api/students", (req, res) => {
    const { name, age, course } = req.body;

    if (!name || !age || !course) {
        return res.status(400).json({
            message: "Name, age and course are required"
        });
    }

    const newStudent = {
        id: students.length > 0 ? students[students.length - 1].id + 1 : 1,
        name: name,
        age: age,
        course: course
    };

    students.push(newStudent);

    res.status(201).json({
        message: "Student added successfully",
        student: newStudent
    });
});

// PUT - Update a student
app.put("/api/students/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const student = students.find(student => student.id === id);

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    const { name, age, course } = req.body;

    if (!name || !age || !course) {
        return res.status(400).json({
            message: "Name, age and course are required"
        });
    }

    student.name = name;
    student.age = age;
    student.course = course;

    res.status(200).json({
        message: "Student updated successfully",
        student: student
    });
});

// DELETE - Delete a student
app.delete("/api/students/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const studentIndex = students.findIndex(student => student.id === id);

    if (studentIndex === -1) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    const deletedStudent = students.splice(studentIndex, 1);

    res.status(200).json({
        message: "Student deleted successfully",
        student: deletedStudent[0]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
node_modules/
.env