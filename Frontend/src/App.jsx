import { useState, useEffect, useCallback } from "react";
import axios from "axios";
/* eslint-disable react-hooks/exhaustive-deps */
import Groups from "./components/Groups";
import ToDoList from "./components/ToDoList";
import Contact from "./components/Contact";
import About from "./components/About.jsx";
const API = "http://localhost:5263/api";

function App() {
    const [userId, setUserId] = useState(() => {
        const saved = localStorage.getItem("userId");
        return saved ? Number(saved) : null;
    });
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [page, setPage] = useState("todos");
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [todos, setTodos] = useState([]);
    const fetchGroups = useCallback(async () => {
        if (!userId) return;

        const res = await axios.get(`${API}/users/${userId}/groups`);
        setGroups(res.data);
        if (!selectedGroup && res.data.length > 0) {
            setSelectedGroup(res.data[0]);
        }
    }, [userId, selectedGroup]);

    const fetchTodos = useCallback(async (groupId) => {
        if (!groupId) return;
        const res = await axios.get(`${API}/todos/group/${groupId}/all`);
        setTodos(res.data);
    }, []);
    useEffect(() => { fetchGroups(); }, [fetchGroups]);
    useEffect(() => {
        if (selectedGroup) fetchTodos(selectedGroup.id);
    }, [selectedGroup, fetchTodos]);

    const handleAuth = async (action) => {
        setLoginError("");
        try {
            const res = await axios.post(`${API}/auth`, { action, email, password });
            localStorage.setItem("userId", res.data.id);
            setUserId(res.data.id);
        } catch {
            setLoginError("Błąd logowania");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setUserId(null);
    };

    if (!userId) {
        return (
            <div style={styles.loginWrapper}>
                <div style={styles.loginBox}>
                    <h2>Logowanie</h2>
                    <input
                        placeholder="Email"
                        onChange={e => setEmail(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Hasło"
                        onChange={e => setPassword(e.target.value)}
                        style={styles.input}
                    />
                    <button
                        onClick={() => handleAuth("login")}
                        style={styles.loginButton}
                    >Login
                    </button>
                    <button
                        onClick={() => handleAuth("register")}
                        style={{ ...styles.loginButton, ...styles.registerButton }}
                    >Register
                    </button>
                    {loginError && <p style={styles.loginError}>{loginError}</p>}
                </div>
            </div>
        );
    }

    return (
        <div style={styles.app}>
            <aside style={styles.sidebar}>
                <h3>📁 Grupy</h3>
                <Groups
                    groups={groups}
                    selectedGroup={selectedGroup}
                    setSelectedGroup={setSelectedGroup}
                    fetchGroups={fetchGroups}
                    userId={userId}
                />
                <button onClick={handleLogout} style={{background:"darkred",}}>Wyloguj</button>
            </aside>

            <main style={styles.main}>
                <header style={styles.header}>
                    <h2>{selectedGroup?.name || "Wybierz grupę"}</h2>

                    <nav style={styles.nav}>
                        {page !== "todos" && (
                            <button onClick={() => setPage("todos")}>← Tasks</button>
                        )}
                        <button onClick={() => setPage("about")}>About Us</button>
                        <button onClick={() => setPage("contact")}>Contact</button>
                    </nav>
                </header>

                <section style={styles.content}>
                    {page === "todos" && selectedGroup && (
                        <ToDoList
                            todos={todos}
                            fetchTodos={fetchTodos}
                            userId={userId}
                            groupId={selectedGroup.id}
                        />
                    )}
                    {page === "about" && <About />}
                    {page === "contact" && <Contact />}
                </section>
                <p> &nbsp; &nbsp;© 2026 - TodoWebsite</p>
            </main>
        </div>
    );
}

const styles = {
    input: {
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #1e293b",
        background: "#020617",
        color: "#e5e7eb",
        outline: "none",
        fontSize: 14
    },
    loginButton: {
        padding: "10px",
        borderRadius: 8,
        border: "none",
        background: "#2563eb",
        color: "white",
        fontWeight: 600,
        cursor: "pointer",
        marginTop: 6
    },
    registerButton: {
        background: "#16a34a"
    },
    loginError: {
        color: "#f87171",
        fontSize: 13,
        textAlign: "center",
        marginTop: 8
    },
    app: {
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        background: "#0f172a",
        color: "#e5e7eb",
        fontFamily: "Inter, system-ui",
        boxSizing: "border-box"
    },
    sidebar: {
        width: 280,
        background: "#020617",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12
    },
    main: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box"
    },
    header: {
        height: 64,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        borderBottom: "1px solid #1e293b",
        background: "#020617"
    },
    nav: {
        display: "flex",
        gap: 10
    },
    content: {
        flex: 1,
        padding: 20,
        overflowY: "auto"
    },
    loginWrapper: {
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#020617"
    },
    loginBox: {
        width: 360,
        background: "#0f172a",
        padding: 30,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12
    }
};

export default App;
