const API_URL = '/items';
const form = document.getElementById('todo-form');
const input = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

async function fetchTasks() {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    renderTasks(tasks);
}

function renderTasks(tasks) {
    taskList.innerHTML = ''; 
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        
        const span = document.createElement('span');
        span.textContent = task.description;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.className = 'btn-edit';
        editBtn.onclick = () => updateTask(index, task.description);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Remover';
        deleteBtn.className = 'btn-delete';
        deleteBtn.onclick = () => deleteTask(index);

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        li.appendChild(span);
        li.appendChild(actionsDiv);
        taskList.appendChild(li);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = input.value;

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
    });

    input.value = '';
    fetchTasks();
});

async function updateTask(index, oldDescription) {
    const newDescription = prompt('Editar tarefa:', oldDescription);
    if (newDescription && newDescription !== oldDescription) {
        await fetch(`${API_URL}?index=${index}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: newDescription })
        });
        fetchTasks();
    }
}

async function deleteTask(index) {
    if (confirm('Tem certeza que deseja remover esta tarefa?')) {
        await fetch(`${API_URL}?index=${index}`, {
            method: 'DELETE'
        });
        fetchTasks();
    }
}

fetchTasks();