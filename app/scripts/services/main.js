define(['angular'], function (angular) {
  'use strict';
  
  angular.module('mainServices', [ 'ngResource' ])
    .factory('Simnut', [ '$resource', function($resource) {
        return $resource('http://dev.jumpingnuts.com:9000/api/kakaoapp/app');
    }])
    .factory('MultiSimnutLoader', [ 'Simnut', '$route', '$q', function(Simnut, $route, $q) {
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
        if($route.current.params.userId) {
          param.user_id = $route.current.params.userId;
        }
        
        var delay = $q.defer();
        Simnut.query(param, function(simnuts) {
            delay.resolve(simnuts);
        }, function() {
            delay.reject('테스트를 가져올 수 없습니다');
        });
        return delay.promise;
      };
    }])
    .factory('SimnutLoader', [ 'Simnut', '$route', '$q', function(Simnut, $route, $q) {
      return function() {
        var delay = $q.defer();
        Simnut.get({ id : $route.current.params.simnutId }, function(simnut) {
          delay.resolve(simnut);
        }, function() {
          delay.reject($route.current.params.simnutId + '의 테스트를 가져올 수 없습니다');
        });
        return delay.promise;
      };
    }])
    
    .factory('Like', [ '$resource', function($resource) {
        return $resource('/dummy/like.json');
    }])
    .factory('LikeView', [ 'Like', '$route', '$q', function(Like, $route, $q) {
      return function(userId, simnutId) {
        var delay = $q.defer();
        Like.get({ 'simnut_id' : simnutId, 'user_id' : userId}, function(likeView) {
          delay.resolve(likeView);
        }, function() {
          delay.reject(simnutId + '의 좋아요를 가져올 수 없습니다');
        });
        return delay.promise;
      };
    }])
    ;
});