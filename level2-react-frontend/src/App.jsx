
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to load students");

      const data = await response.json();
      setStudents(data);
    } catch {
      setError("API se connect nahi ho pa raha. Server start karo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function addStudent(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: Number(age),
          course: course.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add student");

      setName("");
      setAge("");
      setCourse("");
      await loadStudents();
    } catch (err) {
      setError(err.message || "Student add nahi hua.");
    }
  }

  async function deleteStudent(id) {
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete student");

      await loadStudents();
    } catch (err) {
      setError(err.message || "Student delete nahi hua.");
    }
  }

  return (
    <main className="container">
      <h1>Student Management System</h1>
      <p className="subtitle">React Frontend with REST API</p>

      <section className="card">
        <h2>Add New Student</h2>

        <form onSubmit={addStudent}>
          <input
            placeholder="Student name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="1"
            required
          />

          <input
            placeholder="Course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          />

          <button type="submit">Add Student</button>
        </form>
      </section>

      <section className="card">
        <div className="list-heading">
          <h2>Student List</h2>
          <button type="button" onClick={loadStudents}>
            Refresh
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading students...</p>}

        {!loading && !error && students.length === 0 && (
          <p>No students found.</p>
        )}

        {!loading &&
          students.map((student) => (
            <div className="student" key={student.id}>
              <div>
                <strong>{student.name}</strong>
                <p>
                  ID: {student.id} | Age: {student.age} | Course: {student.course}
                </p>
              </div>

              <button
                className="delete-button"
                onClick={() => deleteStudent(student.id)}
              >
                Delete
              </button>
            </div>
          ))}
      </section>
    </main>
  );
}

export default App;
