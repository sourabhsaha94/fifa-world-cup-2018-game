var app = angular.module('myApp',[]);
app.controller('mainController',function($scope,$http){
  var ip_address = "192.168.33.123:8080";
  //var ip_address = "fantasyfifaworldcup2018.localtunnel.me";
  $scope.loggedInUser = "";
  $scope.position = "";
  $scope.showView = 'login.html';
  $scope.login = false;
  $scope.loggedInUuid = "";
  $scope.transferCredits = 0;
  $scope.editInProgress = false;

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
  };

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

  $scope.validate = function(){
    //console.log($scope.transferCredits,$scope.playerData);
    var validatedArray = $scope.playerData.filter(function(p){
      if(p.Value<$scope.transferCredits)
      return true;
    });
    return validatedArray;
  }
});
