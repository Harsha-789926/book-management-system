
const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "books.json");

// Middleware to process JSON data
app.use(express.json());

// Middleware to serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Read books from JSON file
async function readBooks() {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
}

// Save books to JSON file
async function saveBooks(books) {
    await fs.writeFile(
        DATA_FILE,
        JSON.stringify(books, null, 2)
    );
}

// Validate book details
function validateBook(req, res, next) {
    const { title, author, price } = req.body;

    if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof author !== "string" ||
        !author.trim() ||
        price === undefined ||
        price === null ||
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
    ) {
        return res.status(400).json({
            message: "Please enter valid title, author and price."
        });
    }

    req.body.title = title.trim();
    req.body.author = author.trim();
    req.body.price = Number(price);

    next();
}

// 1. Retrieve all books
app.get("/api/books", async (req, res, next) => {
    try {
        const books = await readBooks();

        res.status(200).json({
            message: "Books retrieved successfully",
            books
        });
    } catch (error) {
        next(error);
    }
});

// 2. Retrieve a particular book
app.get("/api/books/:id", async (req, res, next) => {
    try {
        const books = await readBooks();

        const book = books.find(
            b => b.id === Number(req.params.id)
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book retrieved successfully",
            book
        });
    } catch (error) {
        next(error);
    }
});

// 3. Add a new book
app.post(
    "/api/books",
    validateBook,
    async (req, res, next) => {
        try {
            const books = await readBooks();

            const newBook = {
                id: books.length
                    ? Math.max(...books.map(b => b.id)) + 1
                    : 1,
                title: req.body.title,
                author: req.body.author,
                price: req.body.price
            };

            books.push(newBook);

            await saveBooks(books);

            res.status(201).json({
                message: "Book added successfully",
                book: newBook
            });
        } catch (error) {
            next(error);
        }
    }
);

// 4. Update book details
app.put(
    "/api/books/:id",
    validateBook,
    async (req, res, next) => {
        try {
            const books = await readBooks();

            const index = books.findIndex(
                b => b.id === Number(req.params.id)
            );

            if (index === -1) {
                return res.status(404).json({
                    message: "Book not found"
                });
            }

            books[index] = {
                id: books[index].id,
                title: req.body.title,
                author: req.body.author,
                price: req.body.price
            };

            await saveBooks(books);

            res.status(200).json({
                message: "Book updated successfully",
                book: books[index]
            });
        } catch (error) {
            next(error);
        }
    }
);

// 5. Delete a book
app.delete("/api/books/:id", async (req, res, next) => {
    try {
        const books = await readBooks();

        const index = books.findIndex(
            b => b.id === Number(req.params.id)
        );

        if (index === -1) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const deletedBook = books.splice(index, 1)[0];

        await saveBooks(books);

        res.status(200).json({
            message: "Book deleted successfully",
            book: deletedBook
        });
    } catch (error) {
        next(error);
    }
});

// Handle invalid routes
app.use("/api", (req, res) => {
    res.status(404).json({
        message: "API route not found"
    });
});

// Handle invalid JSON and server errors
app.use((err, req, res, next) => {
    console.error(err);

    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({
            message: "Invalid JSON request data"
        });
    }

    res.status(500).json({
        message: "Internal server error"
    });
});

// Start HTTP server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
