import { useState } from "react";
import axios from "axios";
const getPriorityLabel = (priority) => {
    switch(priority) {
        case 0: return "Niski";
        case 1: return "Średni";
        case 2: return "Wysoki";
        default: return "Średni";
    }
};

const API = "http://localhost:5263/api";

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
    }
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
        if (filter === "all") return true;
        if (filter === "done") return todo.isDone;
        if (filter === "pending") return !todo.isDone;
        return true;
    });
    return (
        <div style={{ marginTop: "20px" }}>
            <h2>Lista zadań</h2>
            <div style={{ marginBottom: "10px" }}>
                <button onClick={() => setFilter("all")} disabled={filter === "all"}>Wszystkie</button>
                <button onClick={() => setFilter("pending")} disabled={filter === "pending"} style={{ marginLeft: 5 }}>Do wykonania</button>
                <button onClick={() => setFilter("done")} disabled={filter === "done"} style={{ marginLeft: 5 }}>Wykonane</button>
            </div>
            <ul>
                {filteredTodos.map(todo => (
                    <li key={todo.id} style={{ marginBottom: "5px" }}>
                        <input
                            type="checkbox"
                            checked={todo.isDone}
                            onChange={() => handleToggleDone(todo)}
                            style={{ marginRight: "10px" }}
                        />
                        <strong>{todo.title}</strong> {todo.description && `- ${todo.description}`}
                        <span style={{ marginLeft: "10px", fontSize: "0.8em", color: "gray" }}>
                           [{getPriorityLabel(todo.priority)}] Dodano: {todo.dateAdded ? new Date(todo.dateAdded).toLocaleString() : ""}
                        </span>
                        <button onClick={() => handleDeleteTask(todo.id)} style={{ marginLeft: "10px" }}>
                            Usuń
                        </button>
                    </li>
                ))}
            </ul>
            <div style={{ marginTop: "10px" }}>
                <input
                    type="text"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    placeholder="Nowe zadanie"
                    style={{ marginRight: "10px" }}
                />
                <input
                    type="text"
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="Opis (max 100 znaków)"
                    style={{ marginRight: "10px" }}
                />
                <select
                    value={newPriority}
                    onChange={e => setNewPriority(Number(e.target.value))} // <-- konwersja na int
                    style={{ marginRight: "10px" }}
                >
                    <option value={0}>Niski</option>
                    <option value={1}>Średni</option>
                    <option value={2}>Wysoki</option>
                </select>
                <button onClick={handleAddTask}>Dodaj</button>
            </div>
        </div>
    );
}
export default ToDoList;
