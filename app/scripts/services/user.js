define(['angular'], function (angular) {
  'use strict';
  
  angular.module('userServices', [ 'ngResource' ])
    .factory('User', [ '$resource', function($resource) {
        return $resource('http://dev.jumpingnuts.com:9000/api/user', null, {'login':{method:'POST'}});
    }])
    .factory('UserLogin', [ 'User', '$route', '$q', function(User, $route, $q) {
      return function(id, pw) {
        var delay = $q.defer();
        User.login({ 'username': id, 'password': pw }, function(res) {
          delay.resolve(res);
        }, function(res) {
          delay.reject(res);
        });
        return delay.promise;
      };
    }])
    
    .factory('UserRegist', [ 'User', '$route', '$q', function(User, $route, $q) {
      return function(save) {
        var delay = $q.defer();
        User.save(save, function(res) {
          delay.resolve(res);
        }, function(res) {
          delay.reject(res);
        });
        return delay.promise;
      };
    }]);
});