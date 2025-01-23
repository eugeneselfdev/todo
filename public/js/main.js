// Initialize the database
let db;

// Open or create database if it doesn't exist
const request = indexedDB.open('NotesDB', 1);

// Triggered when the database is created or its version is updated
request.onupgradeneeded = (event) => {
    // Save a reference to the database 
    db = event.target.result;
    // Create an object store named notes with auto-incrementing key
    const objectStore = db.createObjectStore('notes', { keyPath: "id", autoIncrement: true });
    // Create an index on the 'title' property
    objectStore.createIndex('title', 'title', { unique: false });
};

// Triggered when the database is opened successfully
request.onsuccess = (event) => {
    db = event.target.result;
};

// Triggered when an error occurs while accessing the database
request.onerror = (event) => {
    console.error('Database error:', event.target.error);
};