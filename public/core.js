var app = angular.module('myApp',[]);
app.controller('mainController',function($scope,$http){

  $scope.loggedInUser = "";

  $scope.showView = 'login.html';
  $scope.login = false;

  $scope.verify = function(username,password){
    var loginDetails = {'user':username,'pwd':password};
    $http.post('/login',JSON.stringify(loginDetails)).then(function(res){
      if(res.data!=='access_denied'){
        $scope.showView = 'team.html';
        $scope.login = true;
        $scope.loggedInUser = res.data;
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


  $scope.changeView = function(viewName){
    $scope.showView = viewName;
    if(viewName=='players.html'){
      $http.get("http://192.168.33.123:8080/players").then(function(res){
        $scope.playerData = res.data;
      });
    }
  };

  $scope.search = function(type,value){
    if(value.match(/^[a-z0-9]+$/i) !== null)
      $http.get("http://192.168.33.123:8080/search/player/"+type+"/"+value).then(function(res){
          $scope.playerData = res.data;
      });
  };
});
