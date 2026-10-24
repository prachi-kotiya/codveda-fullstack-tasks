
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3000/api";

function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [age, setAge] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitAuth(event) {
    event.preventDefault();
    setMessage("");

    try {
      const endpoint = mode === "register" ? "register" : "login";
      const body =
        mode === "register" ? { name, email, password } : { email, password };

      const response = await fetch(`${API}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");

      if (mode === "register") {
        setMessage("Registration successful! Please log in.");
        setMode("login");
        setPassword("");
      } else {
        setToken(data.token);
        setUser(data.user);
        setPassword("");
        setMessage("Login successful!");
      }
    } catch (error) {
      setMessage(error.message || "Unable to connect to the API.");
    }
  }

  async function loadStudents() {
    setLoading(true);
    try {
      const response = await fetch(`${API}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load students");
      setStudents(data);
    } catch (error) {
      setMessage(error.message || "Could not load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadStudents();
  }, [token]);

  async function addStudent(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: studentName.trim(),
          age: Number(age),
          course: course.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add student");

      setStudentName("");
      setAge("");
      setCourse("");
      setMessage("Student added successfully!");
      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Could not add student.");
    }
  }

  async function deleteStudent(id) {
    setMessage("");

    try {
      const response = await fetch(`${API}/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete student");

      setMessage("Student deleted successfully!");
      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Could not delete student.");
    }
  }

  function logout() {
    setToken("");
    setUser(null);
    setStudents([]);
    setMessage("Logged out successfully.");
  }

  if (!token) {
    return (
      <main className="container">
        <h1>Student Management System</h1>
        <p className="subtitle">Full-Stack Application · JWT Authentication</p>

        <section className="card">
          <h2>{mode === "register" ? "Create Account" : "Login"}</h2>

          <form onSubmit={submitAuth}>
            {mode === "register" && (
              <input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password (minimum 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={mode === "register" ? 8 : undefined}
              required
            />

            <button type="submit">
              {mode === "register" ? "Register" : "Login"}
            </button>
          </form>

          <p>
            {mode === "login" ? "Don't have an account?" : "Already registered?"}
          </p>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setMessage("");
            }}
          >
            {mode === "login" ? "Create account" : "Back to login"}
          </button>

          {message && <p className="error">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Student Management System</h1>
      <p className="subtitle">
        Welcome, {user?.name || user?.email} · Role: {user?.role}
      </p>

      <button type="button" onClick={logout}>Logout</button>

      {message && <p className="error">{message}</p>}

      <section className="card">
        <h2>Add New Student</h2>
        <form onSubmit={addStudent}>
          <input
            placeholder="Student name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
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
          <button type="button" onClick={loadStudents}>Refresh</button>
        </div>

        {loading && <p>Loading students...</p>}
        {!loading && students.length === 0 && <p>No students found.</p>}

        {!loading && students.map((student) => (
          <div className="student" key={student.id}>
            <div>
              <strong>{student.name}</strong>
              <p>ID: {student.id} | Age: {student.age} | Course: {student.course}</p>
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
