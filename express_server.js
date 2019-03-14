const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = {
    "longURL" : req.body.longURL,
    "userID" : req.cookies["user_id"]
  }
  res.redirect('urls/' + shortURL);
});

app.post("/urls/:shortURL/delete", (req,res) =>{
  if(req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID){
    delete urlDatabase[req.params.shortURL]
    res.redirect('/urls')
} else {
    res.redirect('/urls');
}
 res.redirect('/urls');
});

app.post("/urls/:id", (req,res) =>{

  if(req.cookies["user_id"] === urlDatabase[req.params.id].userID){
    urlDatabase[req.params.id].longURL = req.body.updatedURL;
    res.redirect('/urls')
  }
  else{
    res.redirect('/urls')
  }

});

app.post("/login", (req,res) =>{

  let loginEmail = req.body.email
  let loginPassword = req.body.password

 for(let key in users){
  if(users[key].email === loginEmail){
    if(users[key].password === loginPassword){
      res.cookie("user_id", users[key].id);
      res.redirect("/urls");
    }
    else {
      res.status(403).send("<h1>Status Code: 403<h1>Wrong Password</h1>")
    }
  }
}
  res.status(403).send("<h1>Status Code: 403<h1>Email not found</h1>")
});

app.post("/logout", (req,res) =>{
  res.clearCookie("user_id");
  res.redirect('/urls')
});

app.post("/register", (req, res) =>{
  let randomID = generateRandomString()

  if(req.body.email === "" || req.body.password === ""){
    res.status(400).send("<h1>Status Code: 403<h1>Cannot register with an empty email or password</h1>")
  }

  if(sameMail(req.body.email,users)){
    res.status(400).send("<h1>Status Code: 403<h1>E-mail is already taken</h1>")
  }

  users[randomID] = {
    'id' : randomID,
    'email' : req.body.email,
    'password' : req.body.password
  }
  res.cookie("user_id", randomID)
  res.redirect('/urls')

});

let sameMail = function(newMail, db){
  for(let key in db){
    if(users[key].email === newMail){
      return true;
    }
  }
  return false;
}

function generateRandomString() {
  let alphaNumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let output = ""
  for(let i = 0; i < 6; i++) {
    output += alphaNumeric.charAt(Math.floor(Math.random() * alphaNumeric.length));
  }
  return output;
}

const users = {

}

const urlDatabase = {

};


app.get("/", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {


  let filteredDB = {

  }

  for(let keys in urlDatabase){
    if(urlDatabase[keys].userID === req.cookies["user_id"]){
      filteredDB[keys] = urlDatabase[keys];
    }
  }

  let templateVars = {user: users[req.cookies["user_id"]], urls: filteredDB };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]], urls: urlDatabase };
  if(users[req.cookies["user_id"]] !== undefined) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/register", (req, res) => {
   let templateVars = {user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
   let templateVars = {user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]  };
  res.render("login", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});