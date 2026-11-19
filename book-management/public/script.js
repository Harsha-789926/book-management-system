
const API_URL = "/api/books";

const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const message = document.getElementById("message");

const bookId = document.getElementById("bookId");
const title = document.getElementById("title");
const author = document.getElementById("author");
const price = document.getElementById("price");

const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Display messages
function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
}

// API request helper
async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

// Retrieve all books
async function getBooks() {
    try {
        const data = await apiRequest(API_URL);

        displayBooks(data.books);

    } catch (error) {
        bookList.textContent = error.message;
        showMessage(error.message, "error");
    }
}

// Display books dynamically
function displayBooks(books) {
    bookList.innerHTML = "";

    if (books.length === 0) {
        bookList.textContent = "No books available";
        return;
    }

    books.forEach(book => {

        const card = document.createElement("div");
        card.className = "book-card";

        const details = document.createElement("div");

        const idText = document.createElement("p");
        idText.textContent = `ID: ${book.id}`;

        const titleText = document.createElement("h3");
        titleText.textContent = book.title;

        const authorText = document.createElement("p");
        authorText.textContent = `Author: ${book.author}`;

        const priceText = document.createElement("p");
        priceText.textContent = `Price: ₹${book.price}`;

        details.append(
            idText,
            titleText,
            authorText,
            priceText
        );

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", () => {
            editBook(book);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteBook(book.id);
        });

        card.append(
            details,
            editButton,
            deleteButton
        );

        bookList.appendChild(card);
    });
}

// Add or update book
bookForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const id = bookId.value;

    const bookData = {
        title: title.value,
        author: author.value,
        price: Number(price.value)
    };

    try {

        const url = id
            ? `${API_URL}/${id}`
            : API_URL;

        const method = id ? "PUT" : "POST";

        const data = await apiRequest(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookData)
        });

        showMessage(data.message, "success");

        bookForm.reset();
        resetForm();

        await getBooks();

    } catch (error) {
        showMessage(error.message, "error");
    }
});

// Edit book
function editBook(book) {

    bookId.value = book.id;
    title.value = book.title;
    author.value = book.author;
    price.value = book.price;

    submitBtn.textContent = "Update Book";
    document.getElementById("formTitle").textContent =
        "Update Book Details";

    cancelBtn.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Reset form
function resetForm() {

    bookId.value = "";

    submitBtn.textContent = "Add Book";

    document.getElementById("formTitle").textContent =
        "Add New Book";

    cancelBtn.hidden = true;
}

// Cancel editing
cancelBtn.addEventListener("click", () => {
    bookForm.reset();
    resetForm();
});

// Delete book
async function deleteBook(id) {

    if (!confirm("Are you sure you want to delete this book?")) {
        return;
    }

    try {

        const data = await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        showMessage(data.message, "success");

        await getBooks();

    } catch (error) {
        showMessage(error.message, "error");
    }
}

// Search particular book
document.getElementById("searchBtn")
.addEventListener("click", async () => {

    const id = document.getElementById("searchId").value;

    if (!id || Number(id) < 1) {
        showMessage("Please enter a valid book ID", "error");
        return;
    }

    try {

        const data = await apiRequest(`${API_URL}/${id}`);

        const book = data.book;

        const result = document.getElementById("searchResult");

        result.textContent =
            `ID: ${book.id} | Title: ${book.title} | ` +
            `Author: ${book.author} | Price: ₹${book.price}`;

        showMessage(data.message, "success");

    } catch (error) {
        document.getElementById("searchResult").textContent = "";
        showMessage(error.message, "error");
    }
});

// Show all books
document.getElementById("showAllBtn")
.addEventListener("click", () => {

    document.getElementById("searchId").value = "";
    document.getElementById("searchResult").textContent = "";

    getBooks();
});

// Load books when page opens
getBooks();
