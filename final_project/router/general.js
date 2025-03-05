const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password

  if(username && password){
    if(!isValid(username)){
        users.push({"username": username, "password": password});
        return res.status(200).json({message: `${username} successfully registered.`});
    }else{
        return res.status(404).json({message: "User already exists."});
    }
  }
  return res.status(300).json({message: "Unable to register user."});
});

// Get the book list available in the shop
/*public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books, null, 4));
});*/

// Get the book list available in the shop using async callback
public_users.get('/', async function (req, res) {
    try {
        await new Promise(resolve => setTimeout(resolve, 100));
        res.send(JSON.stringify(books, null, 4));
    } catch (error) {
        res.status(404).json({message: "Error fetching books", error: error.message});
    }
});


// Get book details based on ISBN
/*public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn
  res.send(books[isbn]);
 });*/

 // Get book details based on ISBN using promises
 public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn

  new Promise((resolve, reject) => {
    const book = books[isbn];
    
    if (book){
        resolve(book);
    } else {
        reject("Book not found");
    }
  })
  .then(book => res.send(book))
  .catch(error => res.status(404).json({message: error}));
 });
  
// Get book details based on author
/*public_users.get('/author/:author',function (req, res) {
  //Write your code here
  let booksByAuthor = [];
  let isbns = Object.keys(books);

  isbns.forEach((isbn) => {
    if(books[isbn]["author"] === req.params.author) {
        booksByAuthor.push({
            "isbn": isbn,
            "author": books[isbn]["author"],
            "title": books[isbn]["title"],
            "reviews": books[isbn]["reviews"]
        });
    }
  });
  res.send(JSON.stringify({booksByAuthor}, null, 4));
});*/

// Get book details based on author using async/await
public_users.get('/author/:author',function (req, res) {
  try{
    let booksByAuthor = [];
    let isbns = Object.keys(books);

    isbns.forEach((isbn) => {
        if(books[isbn]["author"] === req.params.author) {
            booksByAuthor.push({
                "isbn": isbn,
                "author": books[isbn]["author"],
                "title": books[isbn]["title"],
                "reviews": books[isbn]["reviews"]
            });
        }
    });
    if (booksByAuthor.length === 0) {
        return res.status(404).json({message: "No books found for this author."});
    }
    res.send(JSON.stringify({booksByAuthor}, null, 4));
  } catch(error) {
    res.status(500).json({message: "Error retrieving books.", error: error.message});
  }
});

// Get all books based on title
/*public_users.get('/title/:title',function (req, res) {
  //Write your code here
  let booksByTitle = [];
  let isbns = Object.keys(books);

  isbns.forEach((isbn) => {
    if(books[isbn]["title"] === req.params.title) {
        booksByTitle.push({
            "isbn": isbn,
            "author": books[isbn]["author"],
            "title": books[isbn]["title"],
            "reviews": books[isbn]["reviews"]
        });
    }
  });
  res.send(JSON.stringify({booksByTitle}, null, 4));
  //return res.status(300).json({message: "Yet to be implemented"});
});*/

// Get all books based on title using promises
public_users.get('/title/:title',function (req, res) {
  new Promise((resolve, reject) => {
    let booksByTitle = [];
    let isbns = Object.keys(books);

    isbns.forEach((isbn)=> {
        if(books[isbn]["title"] === req.params.title) {
            booksByTitle.push({
            "isbn": isbn,
            "author": books[isbn]["author"],
            "title": books[isbn]["title"],
            "reviews": books[isbn]["reviews"]
            });
        }
    });
    
    if (booksByTitle.length > 0) {
        resolve(booksByTitle);
    } else {
        reject("No books found with this title");
    }
    })
    .then(booksByTitle => res.send(JSON.stringify({ booksByTitle }, null, 4)))
    .catch(error => res.status(404).json({ message: error }));
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const review = books[isbn]["reviews"];
  const name = books[isbn]["title"];

  //res.send(`The review for the book ${name} is "${review}".`);
  res.json({title: name, reviews: review})
  //return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
