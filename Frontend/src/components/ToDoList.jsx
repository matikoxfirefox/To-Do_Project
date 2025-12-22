import React, { useState } from 'react';

function TodoApp() {
    const [todos, setTodos] = useState([
        { id: 1, title: "First task", isDone: false }
    ]);
    const [newTask, setNewTask] = useState('');
    const [filter, setFilter] = useState('all');

    const handleAddTask = () => {
        if (newTask.trim() === '') return;

        const newTaskObj = {
            id: Date.now(), // unikalne id
            title: newTask,
            isDone: false
        };

        setTodos([...todos, newTaskObj]);
        setNewTask('');
    };

    const handleDeleteTask = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const handleToggleDone = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
        ));
    };
    const filteredTodos = todos.filter(todo => {
        if (filter === 'all') return true;
        if (filter === 'done') return todo.isDone;
        if (filter === 'todo') return !todo.isDone;
    });

    return (

        <div>
            <div>
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
