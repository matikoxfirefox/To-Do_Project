import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ToDoList() {
    const [todos, setTodos] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const res = await axios.get('http://localhost:5263/api/todos');
                setTodos(res.data);
            } catch (err) {
                console.error("Błąd pobierania todos:", err);
            }
        };
        fetchTodos();
    }, []);

    const handleAddTask = async () => {
        if (newTask.trim() === '') return;
        try {
            const res = await axios.post('http://localhost:5263/api/todos', {
                title: newTask,
                isDone: false
            });
            setTodos(prev => [...prev, res.data]);
            setNewTask('');
        } catch (err) {
            console.error("Błąd dodawania todo:", err);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:5263/api/todos/${id}`);
            setTodos(prev => prev.filter(todo => todo.id !== id));
        } catch (err) {
            console.error("Błąd usuwania todo:", err);
        }
    };

    const handleToggleDone = async (id, isDone) => {
        try {
            const todoToUpdate = todos.find(todo => todo.id === id);
            const res = await axios.put(`http://localhost:5263/api/todos/${id}`, {
                ...todoToUpdate,
                isDone: !isDone
            });
            setTodos(prev =>
                prev.map(todo =>
                    todo.id === id ? res.data : todo
                )
            );
        } catch (err) {
            console.error("Błąd aktualizacji todo:", err);
        }
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'all') return true;
        if (filter === 'done') return todo.isDone;
        if (filter === 'todo') return !todo.isDone;
    });

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => setFilter('all')}>Wszystkie</button>
                <button onClick={() => setFilter('todo')}>Do zrobienia</button>
                <button onClick={() => setFilter('done')}>Zrobione</button>
            </div>
            <h2>Lista zadań</h2>
            <ul>
                {filteredTodos.map(todo => (
                    <li key={todo.id}>
                        <input
                            type="checkbox"
                            checked={todo.isDone}
                            onChange={() => handleToggleDone(todo.id, todo.isDone)}
                        />
                        {todo.title}
                        <button onClick={() => handleDeleteTask(todo.id)}>Usuń</button>
                    </li>
                ))}
            </ul>
            <input
                type="text"
                placeholder="Nowe zadanie"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
            />
            <button onClick={handleAddTask}>Dodaj</button>
        </div>
    );
}

export default ToDoList;
