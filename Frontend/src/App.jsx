import { useState, useEffect, useCallback } from "react";
/* eslint-disable react-hooks/set-state-in-effect */
import Groups from "./components/Groups";
import ToDoList from "./components/ToDoList";
import axios from "axios";
const API = "http://localhost:5263/api";
function App() {
    const [userId, setUserId] = useState(() => {
        const saved = localStorage.getItem("userId");
        return saved ? Number(saved) : null;
    });
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [todos, setTodos] = useState([]);

    const fetchGroups = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`${API}/users/${userId}/groups`);
            setGroups(res.data);
            if (!selectedGroup && res.data.length > 0) setSelectedGroup(res.data[0]);
        } catch (err) {
            console.error("Błąd fetch grup:", err);
        }
    }, [userId, selectedGroup]);
    const fetchTodos = useCallback(async (groupId) => {
        if (!groupId) return;
        try {
            const res = await axios.get(`${API}/todos/group/${groupId}/all`);
            setTodos(res.data);
        } catch (err) {
            console.error("Błąd fetch todos:", err);
        }
    }, []);
    useEffect(() => { fetchGroups(); }, [fetchGroups]);

    useEffect(() => {
        if (selectedGroup) fetchTodos(selectedGroup.id);
    }, [selectedGroup, fetchTodos]);
    const handleAuth = async (action) => {
        setLoginError("");
        if (!username || !password) {
            setLoginError("Uzupełnij login i hasło");
            return;
        }
        try {
            const res = await axios.post(`${API}/auth`, { action, username, password });
            const id = res.data?.id;
            if (!id) {
                setLoginError("Nieprawidłowa odpowiedź serwera");
                return;
            }
            localStorage.setItem("userId", id);
            setUserId(id);
            setUsername("");
            setPassword("");
        } catch (err) {
            setLoginError(err.response?.data?.error || "Błąd połączenia z serwerem");
        }
    };
    const handleLogout = () => {
        localStorage.removeItem("userId");
        setUserId(null);
        setGroups([]);
        setTodos([]);
        setSelectedGroup(null);
    };
    if (!userId) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#163c84",
                color: "#e5e7eb",
                width: "100vw",
                fontFamily: "Inter, system-ui, sans-serif"
            }}>
                <div style={{
                    background: "#020617",
                    padding: 40,
                    borderRadius: 12,
                    boxShadow: "0 5px 50px rgba(0,0,0,0.5)",
                    width: 660,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: 300,

                }}>
                    <h1 style={{ marginBottom: 24 }}>Logowanie / Rejestracja</h1>
                    <input
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            marginBottom: 12,
                            borderRadius: 6,
                            border: "1px solid #374151",
                            background: "#0f172a",
                            color: "#e5e7eb"
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            marginBottom: 12,
                            borderRadius: 6,
                            border: "1px solid #374151",
                            background: "#0f172a",
                            color: "#e5e7eb"
                        }}
                    />
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                        <button
                            onClick={() => handleAuth("login")}
                            style={{
                                flex: 1,
                                padding: 10,
                                borderRadius: 6,
                                border: "none",
                                background: "#2563eb",
                                color: "#fff",
                                cursor: "pointer"
                            }}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => handleAuth("register")}
                            style={{
                                flex: 1,
                                padding: 10,
                                borderRadius: 6,
                                border: "none",
                                background: "#10b981",
                                color: "#fff",
                                cursor: "pointer"
                            }}
                        >
                            Register
                        </button>
                    </div>
                    {loginError && <p style={{ color: "#f87171" }}>{loginError}</p>}
                </div>
            </div>
        );
    }

    return (

        <div style={{
            height: "100vh",
            display: "flex",
            background: "#17274d",
            color: "#e5e7eb",
            fontFamily: "Inter, system-ui, sans-serif"
        }}>
            {/* SIDEBAR */}
            <aside style={{
                width: 280,
                background: "#020617",
                borderRight: "1px solid #1e293b",
                padding: 30,
                display: "flex",
                flexDirection: "column"
            }}>
                <h2 style={{ marginBottom: 20 }}>📁 Grupy</h2>

                <Groups
                    groups={groups}
                    selectedGroup={selectedGroup}
                    setSelectedGroup={setSelectedGroup}
                    fetchGroups={fetchGroups}
                    userId={userId}
                />

                <div style={{ marginTop: "auto" }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            background: "#7f1d1d",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer"
                        }}
                    >
                        Wyloguj
                    </button>
                </div>
            </aside>

            {/* CONTENT */}
            <main style={{
                flex: 1,
                display: "flex",
                flexDirection: "column"
            }}>
                {/* TOPBAR */}
                <header style={{
                    height: 64,
                    padding: "0 24px",
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #1e293b",
                    background: "#020617"
                }}>
                    <h1 style={{ fontSize: 20 }}>
                        {selectedGroup ? `📝 ${selectedGroup.name}` : "Wybierz grupę"}
                    </h1>
                </header>
                <section style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 24,
                    overflowY: "auto"
                }}>
                    {selectedGroup ? (
                        <div style={{ width: "100vw" }}>
                            <ToDoList
                                todos={todos}
                                fetchTodos={fetchTodos}
                                userId={userId}
                                groupId={selectedGroup.id}
                            />
                        </div>
                    ) : (
                        <p>Nie wybrano grupy</p>
                    )}
                </section>
            </main>
        </div>
    );


}

export default App;
