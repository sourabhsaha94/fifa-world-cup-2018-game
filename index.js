const MongoClient  = require('mongodb').MongoClient;
const express = require('express');
const app = express();
var path = require("path");
var bodyParser = require('body-parser');
var collection = null;
var db = null;

app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing

app.get('/players',function(req,res){
  playerCollection = db.collection('players');
  playerCollection.find({},{limit:100}).toArray(function(err,data){
    res.send(data);
  });
});

app.get('/search/player/:type/:value',function(req,res){
  var type = req.params.type;
  var value = req.params.value;

  var query = {};

  switch(type){
    case 'Name':
    query = {Name:{$regex:value}};
    break;
    case 'Rating':
    query = {Rating:{$lt:Number(value)}};
    break;
    case 'Nationality':
    query = {Nationality:{$regex:value}};
    break;
    case 'Preffered_Position':
    query = {Preffered_Position:{$regex:value}};
    break;
  }
  playerCollection = db.collection('players');
  playerCollection.find(query,{limit:20}).toArray(function(err,data){
    res.send(data);
  });

});

app.post('/login', function (req, res) {
  authCollection = db.collection("users");
  authCollection.findOne({Username:req.body.user,Password:req.body.pwd},function(err,r){
    if(err){
      res.send("error");
    }
    else{
      if(r!==null)
        res.send(r.Username);
      else {
        res.send("access_denied");
      }
    }
  });
});

app.post('/register', function (req, res) {
  authCollection = db.collection("users");
  authCollection.insertOne({Username:req.body.user,Password:req.body.pwd},function(err,r){
    if(err){
      res.send("error");
    }
    else{
      res.send(String(r.insertedCount));
    }
  });
});

app.listen(8080,function(){
  console.log("Listening at 8080");
});


MongoClient.connect("mongodb://localhost:27017",function(err,client){
  if(err){
    console.log("error");
  }
  else{
      console.log("Connected");
      db = client.db('fifa');
  }
});
