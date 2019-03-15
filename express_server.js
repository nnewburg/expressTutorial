"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const PORT = 8080;
const bcrypt = require('bcrypt');


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

//intializing an empty usersDatabase object
const users = {};

//intializing an empty urlDatabase object
const urlDatabase = {};

//Route to the urls index,
//The target of the create urls_new ejs page generates its
//short URL and adds the input longURL as well as userID
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    "longURL" : req.body.longURL,
    "userID" : req.session.user_id
  };

  res.redirect('urls/' + shortURL);
});

//Route to the delete functionality,
//Disables someone from deleting links who is not the owner
app.post("/urls/:shortURL/delete", (req,res) =>{
  if(req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
});

//Route to the page to update shortURLS checks if the current cookie is a registered user
//if not redirects them back to the index
app.post("/urls/:id", (req,res) =>{
  if(req.session.user_id === urlDatabase[req.params.id].userID){
    urlDatabase[req.params.id].longURL = req.body.updatedURL;
    res.redirect('/urls');
  }
  else{
    res.redirect('/urls');
  }
});

//login route with proper error messages retrieves the email and password
//from the login form and compares them to the users database
app.post("/login", (req,res) =>{
  let loginEmail = req.body.email;
  let loginPassword = req.body.password;

  for(let key in users){
    if(users[key].email === loginEmail){
      if(bcrypt.compareSync(loginPassword, users[key].password)){
        req.session.user_id = users[key].id;
          return res.redirect("/urls");
      }
      else {
        return res.status(403).send("<h1>Status Code: 403<h1>Wrong Password</h1>");
      }
    }
  }
  return res.status(403).send("<h1>Status Code: 403<h1>Email not found</h1>");
});

//logout route, clears the current cookie and redirects to the index page
app.post("/logout", (req,res) =>{
  req.session = null;
  res.redirect('/urls');
});

//register route firstly creating a randomID for the new user
//two if statements to ensure the password or email are not empty
//retrieving the email and password from the form on the register template
//hashing the password when it is stored in the database
//setting the cookie to random ID
app.post("/register", (req, res) =>{
  let randomID = generateRandomString();

  if(req.body.email === "" || req.body.password === ""){
    res.status(400).send("<h1>Status Code: 403<h1>Cannot register with an empty email or password</h1>");
  }

  if(sameMail(req.body.email,users)){
    res.status(400).send("<h1>Status Code: 403<h1>E-mail is already taken</h1>");
  }

  let ogPassword = req.body.password;

  users[randomID] = {
    'id' : randomID,
    'email' : req.body.email,
    'password' : bcrypt.hashSync(ogPassword, 10)
  };

  req.session.user_id = randomID;
  res.redirect('/urls');
});

//function to check if an email is already in use within the users Database
let sameMail = function(newMail, db){
  for(let key in db){
    if(users[key].email === newMail){
      return true;
    }
  }
  return false;
};

//generate a random id 6 characters in length consisting of alphanumeric numbers except _
function generateRandomString() {
  let alphaNumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let output = "";

  for(let i = 0; i < 6; i++) {
    output += alphaNumeric.charAt(Math.floor(Math.random() * alphaNumeric.length));
  }
  return output;
}


//root get renders the index page
app.get("/", (req, res) => {
  if(req.session.user_id){
    res.redirect('/urls');
  }
  else{
    res.redirect('/login');
  }
});

//get route to display the urls index page create an empty urlDatabase
//and filter the real database by urls that were created by the logged in user
app.get("/urls", (req, res) => {
  let filteredDB = {};

  for(let keys in urlDatabase){
    if(urlDatabase[keys].userID === req.session.user_id){
      filteredDB[keys] = urlDatabase[keys];
    }
  }

  let templateVars = {user: users[req.session.user_id], urls: filteredDB };
  res.render("urls_index", templateVars);
});

//get route to render the create new shortURL only for the currently logged in user
//otherwise redirects to login menu
app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.session.user_id], urls: urlDatabase };
  if(users[req.session.user_id] !== undefined) {
    return res.render("urls_new", templateVars);
  } else {

    return res.render("pleaselogin", templateVars);
  }
});

//route to show a specific tiny URLS page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

//get route that redirects the user to the Long URL
app.get("/u/:shortURL", (req, res) => {
  let templateVars = {user: users[req.session.user_id], urls: urlDatabase };
  if(urlDatabase.hasOwnProperty(req.params.shortURL)){
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.render("nosuchURL", templateVars)
  }
});

//get route to the register page
app.get("/register", (req, res) => {
   let templateVars = {user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]  };
  res.render("register", templateVars);
});

//get route to the login menu
app.get("/login", (req, res) => {
   let templateVars = {user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]  };
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});