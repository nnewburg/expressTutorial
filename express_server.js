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
  urlDatabase[shortURL] = req.body.longURL
  res.redirect('urls/' + shortURL);
});

app.post("/urls/:shortURL/delete", (req,res) =>{
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls');
});

app.post("/urls/:id", (req,res) =>{
  urlDatabase[req.params.id] = req.body.updatedURL;
  res.redirect('/urls')
});

app.post("/login", (req,res) =>{
  res.cookie("username", req.body.username)
  res.redirect('/urls')
});

app.post("/logout", (req,res) =>{
  res.clearCookie("username");
  res.redirect('/urls')
});

app.post("/register", (req, res) =>{
  let randomID = generateRandomString()

  if(req.body.email === "" || req.body.password === ""){
    res.status(400).end()
  }

  if(sameMail(req.body.email,users)){
    res.status(400).end()
  }

  users[randomID] = {
    'id' : randomID,
    'email' : req.body.email,
    'password' : req.body.password
  }
  res.cookie("user_"+randomID, randomID)
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


app.get("/", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {username: req.cookies["username"], urls: urlDatabase };
  console.log(users);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/register", (req, res) => {
   let templateVars = {username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]  };
  res.render("register", templateVars);
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