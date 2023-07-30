const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const fs = require("fs");
const path = require('path');

let users = [];
const secretKey = "1abba";

const usersFilePath = path.join(__dirname, 'users.json');

fs.readFile(usersFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading users.json:', err);
    return;
  }

  try {
    users = JSON.parse(data);
  } catch (parseError) {
    console.error('Error parsing users.json:', parseError);
  }
});

// Check if the username is valid
const isValid = (username) => {
    return users.some((user) => user.username === username);
  };
  
  // Check if the username and password match for login
  const authenticatedUser = (username, password) => {
    const user = users.find((user) => user.username === username);
    if (!user) return false;
  
    return user.password === password;
  };
  
  //only registered users can login
  regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (!isValid(username)) {
      return res.status(401).json({ message: "Invalid username" });
    }
  
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  
    // Create a JWT token for the user
    const token = jwt.sign({ username }, secretKey);
  
    return res.status(200).json({ message: "Login successful", token });
  });


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username; // This is set in the authentication middleware
  
    if (!isbn || !review) {
      return res.status(400).json({ message: "ISBN and review are required" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!books[isbn].reviews[username]) {
      books[isbn].reviews[username] = review;
      return res.status(201).json({ message: "Review added successfully" });
    } else {
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully" });
    }
  });

  // Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username; // This is set in the authentication middleware
  
    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
    }
  
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  });  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
