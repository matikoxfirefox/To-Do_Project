import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5263/api";

const getPriorityLabel = (priority) => {
    switch (priority) {
        case 0: return "Niski";
        case 1: return "Średni";
        case 2: return "Wysoki";
        default: return "Średni";
    }
};

function ToDoList({ todos, fetchTodos, userId, groupId }) {
    const [newTask, setNewTask] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newPriority, setNewPriority] = useState(1);
    const [filter, setFilter] = useState("all");

    const handleAddTask = async () => {
        if (!newTask.trim()) return;

        try {
            await axios.post(`${API}/todos/${userId}`, {
                title: newTask,
                description: newDescription.slice(0, 100),
                groupId,
                isDone: false,
                priority: Number(newPriority),
                dateAdded: new Date().toISOString()
            });

            setNewTask("");
            setNewDescription("");
            setNewPriority(1);
            fetchTodos(groupId);
        } catch (err) {
            console.error("Błąd dodawania zadania:", err);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await axios.delete(`${API}/todos/${id}`);
            fetchTodos(groupId);
        } catch (err) {
            console.error("Błąd usuwania zadania:", err);
        }
    };

    const handleToggleDone = async (todo) => {
        try {
            await axios.put(`${API}/todos/${todo.id}`, {
                ...todo,
                isDone: !todo.isDone
            });
            fetchTodos(groupId);
        } catch (err) {
            console.error("Błąd aktualizacji zadania:", err);
        }
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === "done") return todo.isDone;
        if (filter === "pending") return !todo.isDone;
        return true;
    });

    return (
        <div style={{
            width: "100%",
            maxWidth: "100%",
            overflowX: "hidden",
            boxSizing: "border-box",
            padding: 16
        }}>
            <h2 style={{ marginBottom: 12 }}>Lista zadań</h2>

            {/* FILTRY */}
            <div style={{ marginBottom: 12 }}>
                <button onClick={() => setFilter("all")} disabled={filter === "all"}>
                    Wszystkie
                </button>
                <button
                    onClick={() => setFilter("pending")}
                    disabled={filter === "pending"}
                    style={{ marginLeft: 8 }}
                >
                    Do wykonania
                </button>
                <button
                    onClick={() => setFilter("done")}
                    disabled={filter === "done"}
                    style={{ marginLeft: 8 }}
                >
                    Wykonane
                </button>
            </div>

            {/* LISTA */}
            <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box"
            }}>
                {filteredTodos.map(todo => (
                    <li
                        key={todo.id}
                        style={{
                            marginBottom: 10,
                            padding: 10,
                            background: "#020617",
                            borderRadius: 8,
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            wordBreak: "break-word",
                            overflowWrap: "anywhere"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <input
                                type="checkbox"
                                checked={todo.isDone}
                                onChange={() => handleToggleDone(todo)}
                            />
                            <strong>{todo.title}</strong>
                        </div>

                        {todo.description && (
                            <div style={{ opacity: 0.85 }}>
                                {todo.description}
                            </div>
                        )}

                        <div style={{
                            fontSize: "0.8em",
                            color: "#94a3b8",
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 8
                        }}>
                            <span>[{getPriorityLabel(todo.priority)}]</span>
                            <span>
                                Dodano:{" "}
                                {todo.dateAdded
                                    ? new Date(todo.dateAdded).toLocaleString()
                                    : ""}
                            </span>
                        </div>

                        <button
                            onClick={() => handleDeleteTask(todo.id)}
                            style={{
                                alignSelf: "flex-start",
                                background: "#7f1d1d",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "6px 10px",
                                cursor: "pointer"
                            }}
                        >
                            Usuń
                        </button>
                    </li>
                ))}
            </ul>

            {/* DODAWANIE */}
            <div style={{
                marginTop: 16,
                display: "flex",
                flexWrap: "wrap",
                gap: 8
            }}>
                <input
                    type="text"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    placeholder="Nowe zadanie"
                    style={{ maxWidth: 200 }}
                />

                <input
                    type="text"
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="Opis (max 100 znaków)"
                    style={{ maxWidth: 260 }}
                />

                <select
                    value={newPriority}
                    onChange={e => setNewPriority(Number(e.target.value))}
                    style={{ maxWidth: 120 }}
                >
                    <option value={0}>Niski</option>
                    <option value={1}>Średni</option>
                    <option value={2}>Wysoki</option>
                </select>

                <button onClick={handleAddTask}>
                    Dodaj
                </button>
            </div>
        </div>
    );
}

export default ToDoList;
