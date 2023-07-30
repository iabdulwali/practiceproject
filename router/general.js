const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const fs = require('fs');
const path = require('path');

const USERS_FILE_PATH = path.join(__dirname, 'users.json');

// Load users from the JSON file on server startup
try {
  const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
  users = JSON.parse(data);
} catch (err) {
  console.error('Error loading users from file:', err);
}

// Write the users array to the JSON file
function saveUsersToFile() {
  const data = JSON.stringify(users, null, 2);
  fs.writeFileSync(USERS_FILE_PATH, data, 'utf8');
}
  
  // Get the book list available in the shop
  public_users.get('/', function (req, res) {
    // Write your code here to get all books
    const bookList = Object.values(books);
    return res.status(200).json(bookList);
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    // Write your code here to get book details based on ISBN
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
  
  public_users.get('/author/:author', function (req, res) {
    // Write your code here to get books by author
    const author = req.params.author;
    const booksByAuthor = Object.entries(books)
      .filter(([isbn, book]) => book.author === author)
      .map(([isbn, book]) => ({ ...book, isbn }));
  
    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res.status(404).json({ message: "Books by author not found" });
    }
  });  

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    // Write your code here to get books by title
    const title = req.params.title;
    const booksByTitle = Object.values(books).filter(book => book.title === title);
  
    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      return res.status(404).json({ message: "Books by title not found" });
    }
  });
  

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    // Write your code here to get book reviews based on ISBN
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });

  
  public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (users.some((user) => user.username === username)) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // Register the new user and save to the users array and file
    users.push({ username, password });
    saveUsersToFile();
  
    return res.status(201).json({ message: "User registered successfully" });
  });

  // Function to get the list of books available in the shop using Promise callbacks
function getBookListPromise() {
    return new Promise((resolve, reject) => {
      const bookList = Object.values(books);
      if (bookList.length > 0) {
        resolve(bookList);
      } else {
        reject(new Error("No books available"));
      }
    });
  }
  
  // Route using Promise callbacks
  public_users.get('/books-promise', function (req, res) {
    getBookListPromise()
      .then((bookList) => res.status(200).json(bookList))
      .catch((error) => res.status(404).json({ message: error.message }));
  });
  
  // Function to get the list of books available in the shop using async-await with Axios
  async function getBookListAsync() {
    try {
      const response = await axios.get('http://localhost:5000/customer/books-promise');
      return response.data;
    } catch (error) {
      throw new Error("No books available");
    }
  }
  
  // Route using async-await with Axios
  public_users.get('/books-async', async function (req, res) {
    try {
      const bookList = await getBookListAsync();
      res.status(200).json(bookList);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });

  // Function to get book details based on ISBN using Promise callbacks
function getBookByISBNCallback(isbn) {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error("Book not found"));
      }
    });
  }
  
  // Route using Promise callbacks
  public_users.get('/isbn-promise/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBNCallback(isbn)
      .then((book) => res.status(200).json(book))
      .catch((error) => res.status(404).json({ message: error.message }));
  });
  
  // Function to get book details based on ISBN using async-await with Axios
  async function getBookByISBNAsync(isbn) {
    try {
      const response = await axios.get(`http://localhost:5000/customer/isbn-promise/${isbn}`);
      return response.data;
    } catch (error) {
      throw new Error("Book not found");
    }
  }
  
  // Route using async-await with Axios
  public_users.get('/isbn-async/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
      const book = await getBookByISBNAsync(isbn);
      res.status(200).json(book);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });

  function getBooksByAuthorCallback(author) {
    return new Promise((resolve, reject) => {
      const booksByAuthor = Object.values(books).filter(book => book.author === author);
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject(new Error("Books by author not found"));
      }
    });
  }
  
  // Route using Promise callbacks
  public_users.get('/author-promise/:author', function (req, res) {
    const author = req.params.author;
    getBooksByAuthorCallback(author)
      .then((booksByAuthor) => res.status(200).json(booksByAuthor))
      .catch((error) => res.status(404).json({ message: error.message }));
  });
  
  // Function to get books by author using async-await with Axios
  async function getBooksByAuthorAsync(author) {
    try {
      const response = await axios.get(`http://localhost:5000/customer/author-promise/${author}`);
      return response.data;
    } catch (error) {
      throw new Error("Books by author not found");
    }
  }
  
  // Route using async-await with Axios
  public_users.get('/author-async/:author', async function (req, res) {
    const author = req.params.author;
    try {
      const booksByAuthor = await getBooksByAuthorAsync(author);
      res.status(200).json(booksByAuthor);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });

  // Function to get books by title using Promise callbacks
function getBooksByTitleCallback(title) {
    return new Promise((resolve, reject) => {
      const booksByTitle = Object.values(books).filter(book => book.title === title);
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject(new Error("Books by title not found"));
      }
    });
  }
  
  // Route using Promise callbacks
  public_users.get('/title-promise/:title', function (req, res) {
    const title = req.params.title;
    getBooksByTitleCallback(title)
      .then((booksByTitle) => res.status(200).json(booksByTitle))
      .catch((error) => res.status(404).json({ message: error.message }));
  });
  
  // Function to get books by title using async-await with Axios
  async function getBooksByTitleAsync(title) {
    try {
      const response = await axios.get(`http://localhost:5000/customer/title-promise/${title}`);
      return response.data;
    } catch (error) {
      throw new Error("Books by title not found");
    }
  }
  
  // Route using async-await with Axios
  public_users.get('/title-async/:title', async function (req, res) {
    const title = req.params.title;
    try {
      const booksByTitle = await getBooksByTitleAsync(title);
      res.status(200).json(booksByTitle);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });

module.exports.general = public_users;
