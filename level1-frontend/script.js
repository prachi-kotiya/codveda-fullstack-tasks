
const API_URL = "http://localhost:3000/api/students";

const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const loadButton = document.getElementById("loadStudents");

// Load all students
async function loadStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();

        studentList.innerHTML = "";

        if (students.length === 0) {
            studentList.textContent = "No students found.";
            return;
        }

        students.forEach(function (student) {
            const div = document.createElement("div");

            const info = document.createElement("p");
            info.textContent =
                `ID: ${student.id} | Name: ${student.name} | Age: ${student.age} | Course: ${student.course}`;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", async function () {
                try {
                    const result = await fetch(
                        `${API_URL}/${student.id}`,
                        { method: "DELETE" }
                    );

                    const data = await result.json();

                    if (!result.ok) {
                        alert(data.message || "Could not delete student.");
                        return;
                    }

                    alert("Student deleted successfully!");
                    loadStudents();
                } catch (error) {
                    alert("Could not connect to the API.");
                }
            });

            div.appendChild(info);
            div.appendChild(deleteButton);
            studentList.appendChild(div);
        });
    } catch (error) {
        studentList.textContent =
            "Could not connect to API. Please start the server.";
    }
}

// Add a new student
studentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const student = {
        name: document.getElementById("name").value.trim(),
        age: Number(document.getElementById("age").value),
        course: document.getElementById("course").value.trim()
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Could not add student.");
            return;
        }

        alert("Student added successfully!");
        studentForm.reset();
        loadStudents();
    } catch (error) {
        alert("Could not connect to the API. Please start the server.");
    }
});

loadButton.addEventListener("click", loadStudents);
