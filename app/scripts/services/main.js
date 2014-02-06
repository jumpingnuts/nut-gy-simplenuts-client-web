define(['angular'], function (angular) {
  'use strict';
  
  angular.module('mainServices', [ 'ngResource' ])
    .factory('Simnut', [ '$resource', function($resource) {
        return $resource('/dummy/view.json');
    }])
    .factory('MultiSimnutLoader', [ 'Simnut', '$routeParams', '$q', function(Simnut, $routeParams, $q) {
      return function(page, type) {
        page = page?page:1;
        type = type?type:'trends';
        var limit = 20;
        var order = null;

        switch(type) {
          case 'trends' : order = 'updated desc'; break;
          case 'best' : order = 'count_likes desc, updated desc'; break;
          case 'new' : order = 'created desc'; break;
          case 'mine' : order = 'created desc'; break;
          default: order = 'created desc';
        }
        
        var param = {
          'offset':(page-1)*limit,
          'limit':limit,
          'order':order
        };
        if($routeParams.userId) {
          param.user_id = $routeParams.userId;
        }
        
        var delay = $q.defer();
        Simnut.query(param, function(simnuts) {
          delay.resolve(simnuts);
        }, function() {
          delay.reject('api fail');
        });
        return delay.promise;
      };
    }])
    .factory('SimnutLoader', [ 'Simnut', '$routeParams', '$q', function(Simnut, $routeParams, $q) {
      return function() {
        var delay = $q.defer();
        Simnut.get({ id : $routeParams.simnutId }, function(simnut) {
          delay.resolve(simnut);
        }, function() {
          delay.reject('api fail');
        });
        return delay.promise;
      };
    }])
    
    .factory('SimnutSave', [ 'Simnut', '$q', function(Simnut, $q) {
      return function(data) {
        var tmp = [];
        for(var i in data.variables) {
          tmp.push(data.variables[i].value);
        }
        data.variables = tmp;
        var delay = $q.defer();
        Simnut.save(data, function(simnut) {
          delay.resolve(simnut);
        }, function() {
          delay.reject('api fail');
        });
        return delay.promise;
      };
    }])
    
    .factory('Like', [ '$resource', function($resource) {
        return $resource('/dummy/like.json');
    }])
    .factory('LikeView', [ 'Like', '$q', function(Like, $q) {
      return function(simnutId, userId) {
        var delay = $q.defer();
        Like.get({ 'app_id' : simnutId, 'user_id' : userId}, function(likeView) {
          delay.resolve(likeView);
        }, function() {
          delay.reject('api fail');
        });
        return delay.promise;
      };
    }])
    .factory('LikeOn', [ 'Like', '$q', function(Like, $q) {
      return function(simnutId, userId) {
        var delay = $q.defer();
        Like.save({ 'app_id': simnutId, 'user_id': userId}, function(res) {
          delay.resolve(res);
        }, function() {
          delay.reject('api fail');
        });
        return delay.promise;
      };
    }])
    
    .factory('LikeOff', [ 'Like', '$q', function(Like, $q) {
      return function(simnutId, userId, likeId) {
        var delay = $q.defer();
        Like.delete({ 'app_id': simnutId, 'user_id': userId, 'like_id': likeId}, function(res) {
          delay.resolve(res);
        }, function() {
          delay.reject('api fail');
        });
        return delay.promise;
      };
    }])
    ;
});