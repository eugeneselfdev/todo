// Initialize the database
let db;

function initDatabase() {
    // Open or create database if it doesn't exist
    const request = indexedDB.open('TodosDB', 1);

    // Triggered when the database is created or its version is updated
    request.onupgradeneeded = (event) => {
        db = event.target.result;
        // Create an object store named notes with auto-incrementing key
        const objectStore = db.createObjectStore('todos', { keyPath: "id", autoIncrement: true });
        // Create an index on the 'title' property
        objectStore.createIndex('title', 'title', { unique: false });
    };

    // Triggered when the database is opened successfully
    request.onsuccess = (event) => {
        // Save a reference to the database
        db = event.target.result;
        // Log success message
        // console.log('Database opened successfully');
        // Display existing notes
        displayTodos();
    };

    // Triggered when an error occurs while accessing the database
    request.onerror = (event) => {
        // Log error message
        console.error('Database error:', event.target.error);
    };
}

// Function to add a note to the database
function addTodo(title, content) {
    // Start a new transaction
    const transaction = db.transaction(['todos'], 'readwrite');
    // Get the object store
    const objectStore = transaction.objectStore('todos');
    // Add the note to the object store
    let date = new Date().toLocaleString();
    const request = objectStore.add({ title, content, date });

    // Triggered when the note is added successfully
    request.onsuccess = () => {
        // Log success message
        console.log('Todos added to the database');
        // Display updated notes
        displayTodos();
    };

    // Triggered when an error occurs while adding the note
    request.onerror = (event) => {
        // Log error message
        console.error('Error adding todo:', event.target.error);
    };
}

// Function to display notes from the database
function displayTodos() {
    // Start a new transaction
    const transaction = db.transaction(['todos'], 'readonly');
    // Get the object store
    const objectStore = transaction.objectStore('todos');
    // Get all notes from the object store
    const request = objectStore.getAll();

    // Triggered when notes are retrieved successfully
    request.onsuccess = (event) => {
        // Get the notes from the event
        const notes = event.target.result;
        // Get the notes list element
        const notesList = document.getElementById('notesList');
        // Clear the notes list
        notesList.innerHTML = '';
        // Loop through the notes and display each one
        notes.forEach(note => {
            // Create a new div element for the note
            const noteElement = document.createElement('article');
            // Set the inner HTML of the note element
            noteElement.innerHTML = `
                <i class="material-icons icon-bookmark">bookmark</i>
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <div class="todo-footer">
                    <span>Created: <small>${note.date}</small></span>
                    <span class="dropdown">
                        <i class="material-icons icon-more" onclick="toggleDropdown(${note.id})">more_vert</i>
                        <div id="dropdown-${note.id}" class="dropdown-content" id="dropdown-content">
                            <a href="#" onclick="editTodo(${note.id})"><i class="material-icons icon-edit">edit</i> Edit</a>
                            <a href="#" onclick="deleteTodo(${note.id})"><i class="material-icons icon-delete">delete</i> Delete</a>
                        </div>
                    </span>
                </div>            
            `;
            // Append the note element to the notes list
            notesList.appendChild(noteElement);
        });
    };

    // Triggered when an error occurs while retrieving notes
    request.onerror = (event) => {
        // Log error message
        console.error('Error retrieving notes:', event.target.error);
    };
}

// Function to toggle the dropdown menu visibility
function toggleDropdown(id) {
    const dropdown = document.getElementById(`dropdown-${id}`);
    dropdown.classList.toggle('show');
}

// Function to delete a note from the database
function deleteTodo(id) {

    // Start a new transaction
    const transaction = db.transaction(['todos'], 'readwrite');
    // Get the object store
    const objectStore = transaction.objectStore('todos');
    // Delete the note from the object store
    const request = objectStore.delete(id);

    // Triggered when the note is deleted successfully
    request.onsuccess = () => {
        // Log success message
        console.log('Note deleted from the database');
        // Display updated notes
        displayTodos();
    };

    // Triggered when an error occurs while deleting the note
    request.onerror = (event) => {
        // Log error message
        console.error('Error deleting note:', event.target.error);
    };
}

// Function to edit a note
function editTodo(id) {

    // Retrieve the todo data from the database
    const transaction = db.transaction(['todos'], 'readonly');
    const objectStore = transaction.objectStore('todos');
    const request = objectStore.get(id);

    request.onsuccess = (event) => {
        const todo = event.target.result;
        if (todo) {
            
            // Populate the form with the todo data
            document.getElementById('todoId').value = todo.id;
            document.getElementById('todoTitle').value = todo.title;
            document.getElementById('todoContent').value = todo.content;
            document.getElementById('todoDate').value = todo.date;

            // Show the edit modal
            document.getElementById('editModal').style.display = 'block';
        } else {
            console.error('Todo not found');
        }
    };

    request.onerror = (event) => {
        console.error('Error retrieving todo:', event.target.error);
    };
}

// Function to save the edited todo
function saveTodo() {
    const idN = document.getElementById('todoId').value;
    const title = document.getElementById('todoTitle').value;
    const content = document.getElementById('todoContent').value;
    const date = document.getElementById('todoDate').value;

    id = Number(idN);

    const transaction = db.transaction(['todos'], 'readwrite');
    const objectStore = transaction.objectStore('todos');
    const request = objectStore.put({ title, content, date, id });

    request.onsuccess = () => {
        console.log('Todo updated successfully');
        // Hide the edit modal
        document.getElementById('editModal').style.display = 'none';
        // Refresh the todos list
        displayTodos();
    };

    request.onerror = (event) => {
        console.error('Error updating todo:', event.target.error);
    };
}

// Function to close the edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Add event listener to the note form
document.getElementById('noteForm').addEventListener('submit', (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();
    // Get the title from the form
    const title = document.getElementById('noteTitle').value;
    // Get the content from the form
    const content = document.getElementById('noteContent').value;
    // Add the note to the database
    addTodo(title, content);
    // Reset the form
    document.getElementById('noteForm').reset();
    // Close the modal
    document.getElementById('noteModal').style.display = 'none';
});

// Modal functionality
const modal = document.getElementById('noteModal');
const btn = document.getElementById('addTodoButton');
const span = document.getElementsByClassName('close')[0];

// Open the modal when the button is clicked
btn.onclick = () => {
    modal.style.display = 'block';
};

// Close the modal when the close button is clicked
span.onclick = () => {
    modal.style.display = 'none';
};

// Close the modal when clicking outside of the modal
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Initialize the database
initDatabase();