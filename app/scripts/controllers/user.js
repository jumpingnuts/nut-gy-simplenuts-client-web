define(['angular', 'services/user', 'services/native'], function (angular) {
  'use strict';

  angular.module('userCtrls', ['userServices', 'nativeServices'])
    .controller('UserCtrl', [
      '$scope',
      '$routeParams',
      'User',
      'UserLogin',
      'UserConnection',
      function ($scope, $routeParams, Auth, UserLogin, UserConnection) {
        $scope.userInfo = {
          isLogin:false,
          connection: []
        };
        
        $scope.sessLogin = function(){
          if(window.android) {
            window.android.login("$('#nativeCallback').scope().loginCallback");
          } else {
            new Auth.get({}, function(res, httpResponse) {
              if(res) {
                $scope.userInfo = res;
              }
            });
          }
        };
        $scope.sessLogin();
        
        $scope.isLogin = function(){
          return $scope.userInfo.isLogin?true:false;
        };
        
        $scope.logout = function(){
          new User.delete();
          $scope.userInfo = {};
          $scope.userInfo.isLogin = false;
          $scope.move( '/list/trends' );
        };
        
        $scope.loginAction = function(){
          new UserLogin($scope.userInfo.username, $scope.userInfo.password).then(function(res){
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
            } else {
              $scope.alerts.push({ type: 'danger', msg: '아이디 또는 비밀번호가 틀립니다.' });
            }
            
          });
        };
        
        $scope.setKakaoConn = function(){
          new UserConnection.get({'id':$scope.userInfo.id}, function(res, code){
            if(code === 200) {
              window.android.setUserInfo('uid', $scope.userInfo.id);
              window.android.setUserInfo('key', res[0].key);
            } else {
              new UserConnection.save({
                'uid':$scope.userInfo.id,
                'connectionProvider':'kakao',
                'connectionProfile':window.android.getUserInfo()
                }, function(res){
                  new UserConnection.get({'id':$scope.userInfo.id}, function(res, code){
                    window.android.setUserInfo('uid', $scope.userInfo.id);
                    window.android.setUserInfo('key', res[0].key);
                  });
                }
              );
            }
          });
        };
        
        $scope.moveLogin = function(){
          $scope.move('/login?redirectUrl='+$scope.webInfo.currentPath);
        };
      }
    ])
    .controller('LoginCtrl', ['$scope', '$window', function($scope, $window){
      if($scope.userInfo.id) {
        $window.history.back();
      }
    }])
    .controller('RegistCtrl', ['$scope', 'UserRegist', function($scope, UserRegist){
      $scope.regist = {

      }

      $scope.userRegist = function(){
        new UserRegist($scope.regist).then(function(res){
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
