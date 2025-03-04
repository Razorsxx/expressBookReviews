const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
    username: "user1",
    password: "password1",
    },
    {
    username: "user2",
    password: "password2",
    },
    {
    username: "user3",
    password: "password3",
    },
];

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
    req.session.username = username
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
  const username = req.session.username;

  if (!review) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const book = books[isbn];
  let existingReview = book.reviews.find(r => r.username === username);
  if(existingReview) {
    existingReview.review = review;
    return res.status(200).json({ message: `Review updated for ISBN ${isbn} by ${username}`, book });
  }
  if(review){
    book.reviews.push({ username, review });
    //book['reviews'][username] = review;
    books[isbn] = book;
  }
  if(username){
    book['reviews'][username] = review;
    books[isbn] = book;
  }
  
  //books[isbn]["reviews"] = `${username}: ${review}`;
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  //books[isbn].push({"reviews": username, review });
  return res.status(200).json({ message: `Review added for ISBN ${isbn} by ${username}`, book });
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

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;

    const book = books[isbn];

    if(!book){
        return res.status(404).json({message: "Book not found."});
    }
    book.reviews = book.reviews.filter((review) => review.username !== username);
    return res.status(200).json({message: `Review from User: ${username} has been deleted.`});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;