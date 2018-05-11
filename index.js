const MongoClient  = require('mongodb').MongoClient;
const express = require('express');
const app = express();
var path = require("path");
var bodyParser = require('body-parser');
var db = null;
var localtunnel = require('localtunnel');
var fs = require('fs');
var schedule = JSON.parse(fs.readFileSync('data.json', 'utf8'));
var teamList = [];

for(let i=0;i<schedule.teams.length;i++){
  teamList.push(schedule.teams[i].name);
}

app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing

/*****************************login and registration**************************************/

app.post('/login', function (req, res) {
  authCollection = db.collection("users");
  authCollection.findOne({Username:req.body.user,Password:req.body.pwd},function(err,r){
    if(err){
      res.send("error");
    }
    else{
      if(r!==null){
        var query = {'user':r.Username};
        lineupCollection = db.collection('lineup');
        lineupCollection.find(query,{limit:20}).toArray(function(err,data){
          res.send({Team:data,Username:r.Username,Schedule:schedule});
        });
      }
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
      lineupCollection = db.collection('lineup');
      lineupCollection.insertOne({'user':req.body.user,'ST':'ST','LW':'LW','RW':'RW','LM':'LM','CM':'CM','RM':'RM','LB':'LB','CB1':'CB','CB2':'CB','RB':'RB','GK':'GK','credit':500,'points':0},
      function(err,r){
        if(err){
          res.send("error");
        }
        else{
          res.send("done");
        }
      });
    }
  });
});

app.get('/users',function(req,res){
  lineupCollection = db.collection('lineup');
  lineupCollection.find().sort({"points":-1}).toArray(function(err,data){
    res.send(data);
  });
});

/*****************************search players**************************************/

app.get('/players',function(req,res){
  playerCollection = db.collection('players');
  playerCollection.find({},{limit:20}).toArray(function(err,data){
    var toSend = data.filter(function(player){
      if(teamList.includes(player.Nationality))
      return true;
    });
    res.send(toSend);
  });
});

app.get('/search/player/all/:type/:value',function(req,res){
  var type = req.params.type;
  var value = req.params.value;

  var query = {};

  switch(type){
    case 'Name':
    query = {Name:{$regex:value}};
    break;
    case 'Rating':
    query = {Rating:{$lte:Number(value)}};
    break;
    case 'Nationality':
    query = {Nationality:{$regex:value}};
    break;
    case 'Value':
    query = {Value:{$lte:Number(value)}};
    break;
    case 'Preffered_Position':
    query = {Preffered_Position:{$regex:value}};
    break;
  }
  playerCollection = db.collection('players');
  playerCollection.find(query,{limit:20}).toArray(function(err,data){
    var toSend = data.filter(function(player){
      if(teamList.includes(player.Nationality))
      return true;
    });
    res.send(toSend);
  });

});

app.get('/search/player/one/:position/:type/:value',function(req,res){
  var type = req.params.type;
  var value = req.params.value;
  var position = req.params.position;
  var query = {};
  if(position=='CB1' || position=='CB2'){
    position = 'CB';
  }
  switch(type){
    case 'Name':
    query = {Name:{$regex:value},Preffered_Position:{$regex:position}};
    break;
    case 'Rating':
    query = {Rating:{$lte:Number(value)},Preffered_Position:{$regex:position}};
    break;
    case 'Nationality':
    query = {Nationality:{$regex:value},Preffered_Position:{$regex:position}};
    break;
    case 'Value':
    query = {Value:{$lte:Number(value)},Preffered_Position:{$regex:position}};
    break;
  }
  playerCollection = db.collection('players');
  playerCollection.find(query,{limit:20}).toArray(function(err,data){
    var toSend = data.filter(function(player){
      if(teamList.includes(player.Nationality))
      return true;
    });
    res.send(toSend);
  });

});

app.get('/search/player/position/:position/:value',function(req,res){
  var position = req.params.position;
  var value = Number(req.params.value);
  if(position=='CB1' || position=='CB2'){
    position = 'CB';
  }
  var query = {Value:{$lte:Number(value)},Preffered_Position:{$regex:position}};

  playerCollection = db.collection('players');
  playerCollection.find(query,{limit:20}).toArray(function(err,data){
    var toSend = data.filter(function(player){
      if(teamList.includes(player.Nationality))
      return true;
    });
    res.send(toSend);
  });

});


app.post('/search/player/',function(req,res){

  var query = {};

  var keysArray = Object.keys(req.body);

  playerCollection = db.collection('players');

  if(keysArray.includes('name')){
    query["Name"] = {$regex:req.body.name};
  }
  if(keysArray.includes('rating')){
    query["Rating"] = {$lte:Number(req.body.rating)};
  }
  if(keysArray.includes('nationality')){
    query["Nationality"] = {$regex:req.body.nationality};
  }
  if(keysArray.includes('value')){
    query["Value"] = {$lte:Number(req.body.value)};
  }
  if(keysArray.includes('position')){
    query["Preffered_Position"] = {$regex:req.body.position};
  }

  playerCollection.find(query,{limit:20}).toArray(function(err,data){
    var toSend = data.filter(function(player){
      if(teamList.includes(player.Nationality))
      return true;
    });
    res.send(toSend);
  });

});

/*****************************add and delete player**************************************/

app.post('/add/player/',function(req,res){
  lineupCollection = db.collection('lineup');
  var pos = req.body.position;
  var query = {};
  switch(pos){
    case 'ST':
    query = {'ST':req.body.name,'credit':req.body.credit};
    break;
    case 'LW':
    query = {'LW':req.body.name,'credit':req.body.credit};
    break;
    case 'RW':
    query = {'RW':req.body.name,'credit':req.body.credit};
    break;
    case 'LM':
    query = {'LM':req.body.name,'credit':req.body.credit};
    break;
    case 'CM':
    query = {'CM':req.body.name,'credit':req.body.credit};
    break;
    case 'RM':
    query = {'RM':req.body.name,'credit':req.body.credit};
    break;
    case 'LB':
    query = {'LB':req.body.name,'credit':req.body.credit};
    break;
    case 'CB1':
    query = {'CB1':req.body.name,'credit':req.body.credit};
    break;
    case 'CB2':
    query = {'CB2':req.body.name,'credit':req.body.credit};
    break;
    case 'RB':
    query = {'RB':req.body.name,'credit':req.body.credit};
    break;
    case 'GK':
    query = {'GK':req.body.name,'credit':req.body.credit};
    break;
  }
  //console.log(query,req.body);
  lineupCollection.updateOne({user:req.body.user},{$set:query},function(err,r){
    if(err){
      res.send("error");
    }
    else{
      lineupCollection.findOne({user:req.body.user},function(err,r){
        if(err){
          res.send("error");
        }
        else{
          if(r!==null){
            res.send(r);
          }
          else {
            res.send("access_denied");
          }
        }
      });
    }
  });
});
app.post('/delete/player/',function(req,res){
  lineupCollection = db.collection('lineup');
  var pos = req.body.position;
  var query = {};
  switch(pos){
    case 'ST':
    query = {'ST':'ST','credit':req.body.credit};
    break;
    case 'LW':
    query = {'LW':'LW','credit':req.body.credit};
    break;
    case 'RW':
    query = {'RW':'RW','credit':req.body.credit};
    break;
    case 'LM':
    query = {'LM':'LM','credit':req.body.credit};
    break;
    case 'CM':
    query = {'CM':'CM','credit':req.body.credit};
    break;
    case 'RM':
    query = {'RM':'RM','credit':req.body.credit};
    break;
    case 'LB':
    query = {'LB':'LB','credit':req.body.credit};
    break;
    case 'CB1':
    query = {'CB1':'CB1','credit':req.body.credit};
    break;
    case 'CB2':
    query = {'CB2':'CB2','credit':req.body.credit};
    break;
    case 'RB':
    query = {'RB':'RB','credit':req.body.credit};
    break;
    case 'GK':
    query = {'GK':'GK','credit':req.body.credit};
    break;
  }
  //console.log(query,req.body);
  lineupCollection.updateOne({user:req.body.user},{$set:query},function(err,r){
    if(err){
      res.send("error");
    }
    else{
      lineupCollection.findOne({user:req.body.user},function(err,r){
        if(err){
          res.send("error");
        }
        else{
          if(r!==null){
            res.send(r);
          }
          else {
            res.send("access_denied");
          }
        }
      });
    }
  });
});

/*****************************group standings**************************************/

app.get("/group/list",function(req,res){
  teamCollection = db.collection("teams");
  teamCollection.find().sort({"id":1}).toArray(function(err,data){
    let teams = data;
    let mapping = schedule.groupMapping;
    let keys = Object.keys(mapping);
    let allGroups = [];
    for(i=0;i<keys.length;i++){
      let group = {"name":"","teams":[]};
      let startId = mapping[keys[i]];
      group.name = keys[i];
      for(j=startId-1;j<(startId+3);j++){
        group.teams.push(teams[j]);
      }
      allGroups.push(group);
    }
    res.send(allGroups);
  });
});

app.get("/group/matches",function(req,res){
  matchesCollection = db.collection("matches");
  matchesCollection.find().sort({"name":1}).toArray(function(err,data){
    let allMatches = [];
    for(var i=0;i<data.length;i++){
        let matchMap = {};
        if(data[i].type==="group")
          matchMap = {"name":data[i].name,"homeTeam":teamList[data[i].home_team-1],"awayTeam":teamList[data[i].away_team-1],"date":data[i].date,"homeGoals":data[i].home_result,"awayGoals":data[i].away_result,"type":data[i].type};
        else {
          matchMap = {"name":data[i].name,"homeTeam":data[i].home_team,"awayTeam":data[i].away_team,"date":data[i].date,"homeGoals":data[i].home_result,"awayGoals":data[i].away_result,"type":data[i].type};
        }
        allMatches.push(matchMap);
    }
    res.send(allMatches);
  });
});

app.post("/match/score",function(req,res){
  matchesCollection = db.collection("matches");
  console.log(req.body);
  matchesCollection.updateOne({"name":req.body.matchId},{$set:{"home_result":req.body.homeGoals,"away_result":req.body.awayGoals}},function(err,r){
    matchesCollection.find().sort({"name":1}).toArray(function(err,data){
      let allMatches = [];
      for(var i=0;i<data.length;i++){
          let matchMap = {};
          if(data[i].type==="group")
            matchMap = {"name":data[i].name,"homeTeam":teamList[data[i].home_team-1],"awayTeam":teamList[data[i].away_team-1],"date":data[i].date,"homeGoals":data[i].home_result,"awayGoals":data[i].away_result,"type":data[i].type};
          else {
            matchMap = {"name":data[i].name,"homeTeam":data[i].home_team,"awayTeam":data[i].away_team,"date":data[i].date,"homeGoals":data[i].home_result,"awayGoals":data[i].away_result,"type":data[i].type};
          }
          allMatches.push(matchMap);
      }
      res.send(allMatches);
    });
  });
  teamCollection = db.collection("teams");

  //homeTeam
  teamCollection.findOne({name:req.body.homeTeam},function(err,r){
    let played = Number(r.played)+1;
    let win=Number(r.win),draw=Number(r.draw),loss=Number(r.loss),goal=Number(r.goal),gd=Number(r.goalDiff),points=Number(r.points);

    if(Number(req.body.homeGoals)>Number(req.body.awayGoals)){
      win = win+1;
      points =points+3;
    }
    else if(Number(req.body.homeGoals)<Number(req.body.awayGoals)){
      loss = loss+1;
    }
    else{
      draw = draw+1;
      points = points+1;
    }

    goal = goal+Number(req.body.homeGoals);
    gd = goalDiff+(Number(req.body.homeGoals)-Number(req.body.awayGoals));

    let updateQuery = {"played":played,"win":win,"draw":draw};
    teamCollection.updateOne({})
    console.log(r);
  });

  //awayTeam
  teamCollection.findOne({name:req.body.awayTeam},function(err,r){
    let played = Number(r.played)+1;
    let win=0,draw=0,loss=0,goal=0,gd=0,points=0;

    if(Number(req.body.homeGoals)<Number(req.body.awayGoals)){
      win = Number(r.win)+1;
      points = Number(r.points)+3;
    }
    else if(Number(req.body.homeGoals)>Number(req.body.awayGoals)){
      loss = Number(r.loss)+1;
    }
    else{
      draw = Number(r.draw)+1;
      points = Number(r.points)+1;
    }

    goal = Number(goal)+Number(req.body.awayGoals);
    gd = Number(r.goalDiff)+(Number(req.body.awayGoals)-Number(req.body.homeGoals));

    console.log(r);
  });

});

/*****************************connection scripts**************************************/

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
