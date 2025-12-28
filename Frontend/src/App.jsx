import { useState } from "react";

function ToDoList() {
    const [todos, setTodos] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [filter, setFilter] = useState("all");

    const filteredTodos = todos.filter(todo => {
        if (filter === "done") return todo.isDone;
        if (filter === "todo") return !todo.isDone;
        return true;
    });

    return (
        <div>
            <h1>Moja lista zadań</h1>

            <div>
                <button onClick={() => setFilter("all")}>Wszystkie</button>
                <button onClick={() => setFilter("todo")}>Do zrobienia</button>
                <button onClick={() => setFilter("done")}>Zrobione</button>
            </div>

            <ul>
                {filteredTodos.map(todo => (
                    <li key={todo.id}>
                        <input
                            type="checkbox"
                            checked={todo.isDone}
                            onChange={() =>
                                setTodos(t =>
                                    t.map(x =>
                                        x.id === todo.id ? { ...x, isDone: !x.isDone } : x
                                    )
                                )
                            }
                        />
                        {todo.title}
                        <button onClick={() =>
                            setTodos(t => t.filter(x => x.id !== todo.id))
                        }>
                            Usuń
                        </button>
                    </li>
                ))}
            </ul>

            <input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="Nowe zadanie"
            />
            <button
                onClick={() => {
                    if (!newTask.trim()) return;
                    setTodos(t => [
                        ...t,
                        { id: Date.now(), title: newTask, isDone: false }
                    ]);
                    setNewTask("");
                }}
            >
                Dodaj
            </button>
        </div>
    );
}

export default ToDoList;
