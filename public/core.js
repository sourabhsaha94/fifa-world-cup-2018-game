var app = angular.module('myApp',[]);
app.controller('mainController',function($scope,$http){

  $scope.loggedInUser = "";
  $scope.position = "";
  $scope.showView = 'login.html';
  $scope.login = false;
  $scope.loggedInUuid = "";

  $scope.verify = function(username,password){
    var loginDetails = {'user':username,'pwd':password};
    $http.post('/login',JSON.stringify(loginDetails)).then(function(res){
      if(res.data!=='access_denied'){
        $scope.showView = 'team.html';
        $scope.login = true;
        $scope.teamData = res.data.Team[0];
        $scope.loggedInUser = res.data.Username;
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
    if(viewName==='players.html'){
      $http.get("http://fantasyfifaworldcup2018.localtunnel.me/players").then(function(res){
        $scope.playerData = res.data;
      });
    }
    else if(viewName==='choosePlayer.html'){
      $scope.position = pos;
      $http.get("http://fantasyfifaworldcup2018.localtunnel.me/search/player/position/"+$scope.position).then(function(res){
        $scope.playerData = res.data;
      });
    }
  };

  $scope.search = function(type,value){
    if(value.match(/^[a-z0-9]+$/i) !== null)
      $http.get("http://fantasyfifaworldcup2018.localtunnel.me/search/player/all/"+type+"/"+value).then(function(res){
          $scope.playerData = res.data;
      });
  };

  $scope.searchPlayer = function(type,value){
    if(value.match(/^[a-z0-9]+$/i) !== null)
      $http.get("http://fantasyfifaworldcup2018.localtunnel.me/search/player/one/"+$scope.position+"/"+type+"/"+value).then(function(res){
          $scope.playerData = res.data;
      });
  };

  $scope.addPlayer = function(name,nationality,rating){
    var combinedString = name+"#"+nationality+"#"+rating;
    var addPlayerDetails = {'user':$scope.loggedInUser,'name':combinedString,'position':$scope.position};
    $http.post('/add/player',JSON.stringify(addPlayerDetails)).then(function(res){
      $scope.teamData = res.data;
      $scope.showView = 'team.html';
    });
  }
});
