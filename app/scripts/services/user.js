define(['angular'], function (angular) {
  'use strict';
  
  angular.module('userServices', [ 'ngResource' ])
    .factory('User', [ '$resource', function($resource) {
        return $resource('/dummy/login.json');
    }])
    .factory('UserLogin', [ 'User', '$route', '$q', function(User, $route, $q) {
      return function(id, pw) {
        var delay = $q.defer();
        User.get({ 'username': id, 'password': pw }, function(user) {
          delay.resolve(user);
        }, function() {
          delay.reject('로그인 정보가 없습니다.');
        });
        return delay.promise;
      };
    }])
    
    .factory('UserRegist', [ 'User', '$route', '$q', function(User, $route, $q) {
      return function(save) {
        var delay = $q.defer();
        Simnut.save(save, function(simnut) {
          delay.resolve(simnut);
        }, function() {
          delay.reject($route.current.params.simnutId + '의 테스트를 가져올 수 없습니다');
        });
        return delay.promise;
      };
    }]);
});