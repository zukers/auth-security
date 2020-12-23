require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption")
const mongoose = require("mongoose");
const { Schema } = mongoose;
const _ = require("lodash");
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('debug', true);

mongoose.connect("mongodb+srv://Marcin-admin:"+process.env.ADMINPASS+"@cluster0.0xsbd.mongodb.net/userDB");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const userSchema = new Schema ({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]})

const User = mongoose.model("User", userSchema);


app.route("/")
.get((req, res)=>{
  res.render("home")
})

app.route("/:query")
.get((req, res)=>{
  console.log();
  res.render(req.params.query)
})
.post((req, res)=>{
  if(req.params.query === "register") {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password
    });
    newUser.save((err)=>{
      if(err){
        console.log(err);
      } else {
        res.render("secrets")
      }
    });
  } else if (req.params.query === "login"){
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username}, (err, foundUser)=>{
      if(err){
        console.log(err);
      } else if (foundUser){
        if(foundUser.password === password) {
          res.render("secrets");
        } else {
          console.log("Wrong password");
          res.redirect("/login");
        }
      } else {
        console.log("No user found");
        res.redirect("/login");
      }
    })
  } else if (req.params.query === "favicon.ico"){
    console.log("no favicon");
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
