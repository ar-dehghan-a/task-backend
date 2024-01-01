// Mock tasks data
let allTasks = [];

// Function to fetch tasks
async function fetchTask() {
  const token = window.localStorage.getItem('token');

  try {
    const res = await fetch('http://localhost:3000/tasks/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 200) {
      const tasks = await res.json();
      allTasks = tasks.data.tasks;
    } else {
      window.location.replace('/login');
    }
  } catch (error) {
    console.error('Error in fetch tasks', error);
  }
}

// Function to render tasks
function renderTasks() {
  const todoList = document.getElementById('todo-list');
  todoList.innerHTML = '';

  allTasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `${task.task} <button class="btn-delete" onclick="deleteTask(${task.id})">حذف</button>`;
    todoList.appendChild(li);
  });
}

// Function to add a new task
async function addTask() {
  const token = window.localStorage.getItem('token');
  const taskInput = document.getElementById('task-input');
  const newTask = taskInput.value.trim();

  const data = new URLSearchParams();
  data.append('task', newTask);

  if (newTask !== '')
    try {
      const res = await fetch('http://localhost:3000/tasks/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      });

      if (res.status === 201) {
        const task = await res.json();
        allTasks.unshift(task.data.task);
        renderTasks();
        taskInput.value = '';
      }
    } catch (error) {
      console.error('Error in add task', error);
    }
}

// Function to delete a task
async function deleteTask(id) {
  const token = window.localStorage.getItem('token');

  try {
    const res = await fetch(`http://localhost:3000/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 204) {
      allTasks = allTasks.filter(task => task.id !== id);
      renderTasks();
    }
  } catch (error) {
    console.error('Error in add task', error);
  }
}

// Initial rendering
fetchTask()
  .then(() => renderTasks())
  .catch(() => console.log('Unexpected Error'));
