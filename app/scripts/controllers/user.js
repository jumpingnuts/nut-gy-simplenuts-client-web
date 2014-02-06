define(['angular', 'services/user'], function (angular) {
  'use strict';

  angular.module('userCtrls', ['userServices'])
    .controller('UserCtrl', ['$scope', '$location', 'User', function ($scope, $location, User) {
      $scope.userInfo = {};
      
      //session login
      User.get({}, function(res) {
        if(res) {
          $scope.userInfo = res;
        }
      });
      
      $scope.isLogin = function(){
        return $scope.userInfo.id?true:false;
      };
      
      $scope.logout = function(){
        User.delete();
        $scope.userInfo = {};
//        $scope.move( '/list/trends' );
      };

    }])
    .controller('LoginCtrl', ['$scope', '$routeParams', 'UserLogin', function($scope, $routeParams, UserLogin){
      $scope.loginAction = function(){
        UserLogin($scope.userInfo.username, $scope.userInfo.password).then(function(res){
          if(res) {
            $scope.userInfo = res;
            $scope.move( $routeParams.redirectUrl || '/list/trends' );
          } else {
            alert('로그인 실패');
          }
        });
      };
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
console.log($scope.regist);
        UserRegist($scope.regist).then(function(res){
          //res가 성공이면 로그인 처리 후 list/trends페이지로
        });
      }
    }]);

});
