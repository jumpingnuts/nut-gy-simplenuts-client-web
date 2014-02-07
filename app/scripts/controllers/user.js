define(['angular', 'services/user'], function (angular) {
  'use strict';

  angular.module('userCtrls', ['userServices'])
    .controller('UserCtrl', ['$scope', '$routeParams', 'User', 'UserLogin', function ($scope, $routeParams, User, UserLogin) {
      $scope.userInfo = {isLogin:false};
      
      $scope.sessLogin = function(){
        User.get({}, function(res, httpResponse) {
console.log(res);
        if(res) {
            $scope.userInfo = res;
          }
        });
      };
      $scope.sessLogin();
      
      $scope.isLogin = function(){
        return $scope.userInfo.isLogin?true:false;
      };
      
      $scope.logout = function(){
        User.delete();
        $scope.userInfo = {};
        $scope.userInfo.isLogin = false;
        $scope.move( '/list/trends' );
      };
      
      $scope.loginAction = function(){
        UserLogin($scope.userInfo.username, $scope.userInfo.password).then(function(res){
          $scope.userInfo.password = '';
          if(res.id) {
            $scope.userInfo.isLogin = true;
            $scope.userInfo.id = res.id;
            $scope.userInfo.email = res.email;
            $scope.userInfo.is_confirmed = res.is_confirmed;
            $scope.userInfo.updated = res.updated;
            
            $scope.move( $routeParams.redirectUrl || '/list/trends' );
          } else {
            $scope.alerts.push({ type: 'danger', msg: '아이디 또는 비밀번호가 틀립니다.' });
          }
          
        });
      };
      
      $scope.moveLogin = function(){
        $scope.move('/login?redirectUrl='+$scope.webInfo.currentPath);
      };
    }])
    .controller('LoginCtrl', ['$scope', '$window', function($scope, $window){
      if($scope.userInfo.id) {
        $window.history.back();
      }
    }])
    .controller('RegistCtrl', ['$scope', 'UserRegist', function($scope, UserRegist){
      $scope.regist = {
        'username': '',
        'password': '',
        'password_confirm': '',
        'age': 20,
        'gender': '여',
      }

      $scope.userRegist = function(){
        UserRegist($scope.regist).then(function(res){
          if(res.insertId) {
            $scope.userInfo.username = $scope.regist.username;
            $scope.userInfo.password = $scope.regist.password;
            $scope.loginAction();
          }
        }, function(res){
          $scope.alerts.push({ type: 'danger', msg: res.data.message });
        });
      }
    }]);

});
