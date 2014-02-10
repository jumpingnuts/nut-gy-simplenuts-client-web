define(['angular'], function (angular) {
  'use strict';
  
  angular.module('userServices', [ 'ngResource' ])
    .factory('User', [ '$resource', function($resource) {
        return $resource('http://dev.jumpingnuts.com:9000/api/user', null, {'login':{method:'POST'}});
    }])
    .factory('UserLogin', [ 'User', '$route', '$q', function(User, $route, $q) {
      return function(id, pw) {
        var delay = $q.defer();
        new User.login({ 'username': id, 'password': pw }, function(res) {
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
        new User.save(save, function(res) {
          delay.resolve(res);
        }, function(res) {
          delay.reject(res);
        });
        return delay.promise;
      };
    }])
    .factory('UserConnectionLogin', [ 'User', '$route', '$q', function(User, $route, $q) {
      return function(uid, type, key) {
        var delay = $q.defer();
        var param = {
          'uid':uid,
          'connectionProvider':type,
          'connectionKey':key
        };
        
        new User.login(param, function(res) {
          delay.resolve(res);
        }, function(res) {
          delay.reject(res);
        });
        return delay.promise;
      };
    }])
    
    .factory('UserConnection', [ '$resource', function($resource) {
        return $resource('http://dev.jumpingnuts.com:9000/api/userConnection/:id');
    }])
});