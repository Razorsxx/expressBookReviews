const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let sameName = users.filter((user) => {
        return user.username === username
    });
    if(sameName.length > 0){
        return true;
    } else{
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let validUsers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if(validUsers .length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).send("Error logging in");
  }

  if(authenticatedUser(username, password)) {
    let accesssToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 60});

    req.session.authorization = {
        accesssToken,username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(404).send("Invalid Login.");
  }
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const { review } = req.body;
  const { username } = req.session.authorization['username'];

  if (!review) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const book = books[isbn];
  if(review){
    book['reviews'][username] = review;
    books[isbn] = book;
  }
  
  //books[isbn]["reviews"] = `${username}: ${review}`;
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  //books[isbn].push({"reviews": username, review });
  return res.status(200).json({ message: "Review added", book });
  /*const isbn = req.params.isbn;

    let filtered_book = books[isbn];

    if (filtered_book) {

        let review = req.query.review;

        let reviewer = req.session.authorization['username'];

        if (review) {

            filtered_book['reviews'][reviewer] = review;

            books[isbn] = filtered_book;

        }

        res.send(`The review for the book with ISBN ${isbn} has been added/updated.`);

    } else {

       res.send("Unable to find this ISBN!");

    }*/
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
