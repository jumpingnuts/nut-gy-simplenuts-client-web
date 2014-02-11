define(['angular', 'angularResource', 'angularCookies'], function (angular) {
  'use strict';
  
  angular.module('userServices', [ 'ngResource', 'ngCookies'])
    .factory('Auth', [ '$rootScope', '$resource', function($rootScope, $resource) {
        return $resource($rootScope.apiInfo.baseUrl+'/auth/user', null, {'login':{method:'POST'}});
    }])
    .factory('UserLogin', [ 'Auth', '$route', '$q', function(Auth, $route, $q) {
      return function(id, pw) {
        var delay = $q.defer();
        new Auth.login({ 'email': id, 'password': pw }, function(res) {
          delay.resolve(res);
        }, function(res) {
          delay.reject(res);
        });
        return delay.promise;
      };
    }])
    
    .factory('UserReg', [ '$rootScope', '$resource', function($rootScope, $resource) {
        return $resource($rootScope.apiInfo.baseUrl+'/user');
    }])
    .factory('UserRegist', [ 'UserReg', '$route', '$q', function(UserReg, $route, $q) {
      return function(save) {
        var delay = $q.defer();
        new UserReg.save(save, function(res) {
          delay.resolve(res);
        }, function(res) {
          delay.reject(res);
        });
        return delay.promise;
      };
    }])
    
    .factory('User', [ '$rootScope', '$resource', function($rootScope, $resource) {
        return $resource($rootScope.apiInfo.baseUrl+'/api/user');
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
    
    .factory('UserConnection', [ '$rootScope', '$resource', function($rootScope, $resource) {
        return $resource($rootScope.apiInfo.baseUrl+'/api/userConnection/:id');
    }])
});