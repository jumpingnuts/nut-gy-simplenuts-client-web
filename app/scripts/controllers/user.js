define(['angular', 'jquery', 'services/user', 'services/native'], function (angular, $) {
  'use strict';

  angular.module('userCtrls', ['userServices', 'nativeServices'])
    .controller('UserCtrl', [
      '$scope',
      '$routeParams',
      'Auth',
      'UserLogin',
      'UserConnection',
      function ($scope, $routeParams, Auth, UserLogin, UserConnection) {
        $scope.userInfo = {
          isLogin:false,
          connection: []
        };
        
        $scope.sessLogin = function(){
          if(window.android) {
            window.android.login('$("#nativeCallback").scope().loginCallback');
          } else {
            new Auth.get({}, function(res) {
              if(res.id) {
                $scope.userInfo.isLogin = true;
                $scope.userInfo.id = res.id;
                $scope.userInfo.email = res.email;
                $scope.userInfo.is_confirmed = res.is_confirmed;
                $scope.userInfo.updated = res.updated;
              }
            });
          }
        };
        $scope.sessLogin();
        
        $scope.isLogin = function(){
          return $scope.userInfo.isLogin?true:false;
        };
        
        $scope.logout = function(){
          new Auth.delete();
          $scope.userInfo = {};
          $scope.userInfo.isLogin = false;
          $scope.move( '/list/trends' );
        };
        
        $scope.loginAction = function(){
          new UserLogin($scope.userInfo.username, $scope.userInfo.password).then(function(res, code){
            $scope.userInfo.password = '';
            if(res.id) {
              $scope.userInfo.isLogin = true;
              $scope.userInfo.id = res.id;
              $scope.userInfo.email = res.email;
              $scope.userInfo.is_confirmed = res.is_confirmed;
              $scope.userInfo.updated = res.updated;

              if($.inArray('kakao', $scope.userInfo.connection) > -1) {
                $scope.setKakaoConn();
              }
              $scope.move( $routeParams.redirectUrl || '/list/trends' );
            }
            
          }, function(res){
            if(res.status === 401) {
              $scope.alerts.push({ type: 'danger', msg: '아이디 또는 비밀번호가 틀립니다.' });
            }
          });
        };
        
        $scope.setKakaoConn = function(){
          new UserConnection.get({'id':$scope.userInfo.id}, function(res, code){
//console.log(code)
            if(code === 200) {
              window.android.setUserInfo('uid', $scope.userInfo.id);
              window.android.setUserInfo('key', res[0].key);
            } else {
              new UserConnection.save({
                'uid':$scope.userInfo.id,
                'connectionProvider':'kakao',
                'connectionProfile':window.android.getUserInfo()
              }, function(){
                new UserConnection.get({'id':$scope.userInfo.id}, function(res){
                  window.android.setUserInfo('uid', $scope.userInfo.id);
                  window.android.setUserInfo('key', res[0].key);
                });
              });
            }
          });
        };
        
        $scope.moveLogin = function(){
          $scope.move('/login?redirectUrl='+$scope.webInfo.currentPath);
        };
      }
    ])
    .controller('LoginCtrl', ['$scope', function($scope, $window){
      if($scope.userInfo.id) {
        $scope.move( '/list/trends' );
      }
    }])
    .controller('RegistCtrl', ['$scope', 'UserRegist', function($scope, UserRegist){
      if($scope.userInfo.id) {
        $scope.move( '/list/trends' );
      }
      $scope.regist = {

      };

      $scope.userRegist = function(){
        new UserRegist($scope.regist).then(function(res){
          if(res.id) {
            $scope.userInfo.email = $scope.regist.email;
            $scope.userInfo.password = $scope.regist.password;
            $scope.loginAction();
          }
        }, function(res){
          $scope.alerts.push({ type: 'danger', msg: res.data.message });
        });
      };
    }]);

});
