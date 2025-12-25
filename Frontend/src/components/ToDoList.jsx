import React, { useState, useEffect } from 'react';

function TodoApp() {
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: "Zrobic backend", isDone: false },
            { id: 2, title: "Odpalic Reacta", isDone: false }
        ];
    });

    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(todos));
    }, [todos]);

    const [newTask, setNewTask] = useState('');
    const [filter, setFilter] = useState('all');

    const handleAddTask = () => {
        if (newTask.trim() === '') return;

        const newTaskObj = {
            id: Date.now(),
            title: newTask,
            isDone: false
        };

        setTodos(prev => [...prev, newTaskObj]);
        setNewTask('');
    };

    const handleDeleteTask = (id) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };

    const handleToggleDone = (id) => {
        setTodos(prev =>
            prev.map(todo =>
                todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
            )
        );
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
                            onChange={() => handleToggleDone(todo.id)}
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

export default TodoApp;
