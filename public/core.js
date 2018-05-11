var app = angular.module('myApp',[]);
app.controller('mainController',function($scope,$http){
  var ip_address = "192.168.33.123:8080";

  $scope.loggedInUser = "";//stores value of user logged in
  $scope.position = "";//stores value of player being edited
  $scope.showView = 'login.html';//stores value of current page being shown
  $scope.login = false;//stores boolean value to indicated if login successful or not
  $scope.transferCredits = 0;//stores how many transfer credits left for the user to use
  $scope.editInProgress = false;//indicates if edit is being done
/***************************verification and login*******************************/
  //verification of user
  $scope.verify = function(username,password){
    var loginDetails = {'user':username,'pwd':password};
    $http.post('/login',JSON.stringify(loginDetails)).then(function(res){
      if(res.data!=='access_denied'){
        $scope.showView = 'team.html';
        $scope.login = true;
        $scope.teamData = res.data.Team[0];
        $scope.loggedInUser = res.data.Username;
        $scope.transferCredits = res.data.Team[0].credit;
      }
    });
  };

  //registration of new user
  $scope.createUser = function(username,password){
    var newUserDetails = {'user':username,'pwd':password};
    $http.post('/register',JSON.stringify(newUserDetails)).then(function(res){
      if(res.data!=='error')
      $scope.showView = 'login.html';
      else {
        $scope.showView = 'register.html';
      }
    });
  }

/***************************index page*******************************/

  //manages page view change and retrieval of relevant data
  $scope.changeView = function(viewName,pos){
    $scope.showView = viewName;

    if($scope.editInProgress){
      var r = confirm("Exit from player selection?");
      if(r){
        if($scope.teamData[$scope.position].split("#").length>1){
          $scope.transferCredits -= Number($scope.teamData[$scope.position].split("#")[3]);
        }
        $scope.editInProgress = false;
      }
      return;
    }

    if(viewName==='players.html'){
      $http.get("http://"+ip_address+"/players").then(function(res){
        $scope.playerData = res.data;
      });
    }
    else if(viewName==='choosePlayer.html'){
      $scope.position = pos;
      //console.log($scope.teamData[pos].split("#"),$scope.transferCredits);
      $scope.editInProgress = true;
      if($scope.teamData[pos].split("#").length>1){
        $scope.transferCredits += Number($scope.teamData[pos].split("#")[3]);
      }
      $http.get("http://"+ip_address+"/search/player/position/"+$scope.position+"/"+$scope.transferCredits).then(function(res){
        $scope.playerData = res.data;
      });
    }
    else if (viewName === 'groups.html') {
      $http.get("http://"+ip_address+"/group/list").then(function(res){
        $scope.groupData = res.data;
      });
    }
    else if (viewName === 'matches.html') {
      $http.get("http://"+ip_address+"/group/matches").then(function(res){
        $scope.matchData = res.data;
      });
    }
    else if (viewName === 'leaderboard.html') {
      $http.get("http://"+ip_address+"/users").then(function(res){
        $scope.userData = res.data;
      });
    }

  };

/***************************search functionality*******************************/

  //search for players based on multiple attributes
  $scope.search = function(name,nationality,position,rating,value){

    var toSend = {};

    if(name){
      toSend.name = name;
    }
    if(nationality){
      toSend.nationality = nationality;
    }
    if(position){
      if(position==='CHOOSE_PLAYER')
        toSend.position = $scope.position;
      else
        toSend.position = position;
    }
    if(rating){
      toSend.rating = rating;
    }
    if(value){
      toSend.value = value;
    }

    if(Object.keys(toSend).length === 0){
      $http.get("http://"+ip_address+"/search/player/position/"+$scope.position+"/"+$scope.transferCredits).then(function(res){
        $scope.playerData = res.data;
      });
    }
    else{
      $http.post('/search/player',JSON.stringify(toSend)).then(function(res){
        $scope.playerData = res.data;
      });
    }
  };

/***************************team changes*******************************/

  //add player to user's squad
  $scope.addPlayer = function(name,nationality,rating,value){
    var combinedString = name+"#"+nationality+"#"+rating+"#"+value;
    $scope.editInProgress = false;
    var addPlayerDetails = {'user':$scope.loggedInUser,'name':combinedString,'position':$scope.position,'credit':Math.floor($scope.transferCredits - value)};
    $http.post('/add/player',JSON.stringify(addPlayerDetails)).then(function(res){
      $scope.teamData = res.data;
      $scope.transferCredits = res.data.credit;
      $scope.showView = 'team.html';
    });
  };

  //delete player from user's squad
  $scope.deletePlayer = function(pos){
    if($scope.teamData[pos].split("#").length>1)
    {
      var deletePlayerDetails = {'user':$scope.loggedInUser,'position':pos,'credit':Math.floor($scope.transferCredits + Number($scope.teamData[pos].split("#")[3]))};
      $http.post('/delete/player',JSON.stringify(deletePlayerDetails)).then(function(res){
        $scope.teamData = res.data;
        $scope.transferCredits = res.data.credit;
      });
    }
  };

  //validate if players retrieved have value less than transferCredits value
  $scope.validate = function(){
    var validatedArray = $scope.playerData.filter(function(p){
      if(p.Value<$scope.transferCredits)
      return true;
    });
    return validatedArray;
  };


  /***************************group standings*******************************/
  $scope.groupData = [];
  /*************************** leaderboard *******************************/

  $scope.getNetWorth = function(credit){
    return 500 - Number(credit);
  };

});
