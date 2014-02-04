define(['angular'], function (angular) {
  'use strict';
  
  angular.module('commentServices', [ 'ngResource' ])
    .factory('Comment', [ '$resource', function($resource) {
        return $resource('/dummy/comment.json');
    }])
    .factory('CommentLoader', [ 'Comment', '$q', function(Comment, $q) {
      return function(page, key, type) {
        if(!key) { return false; }
        page = page || 1;
        var limit = 20;
        var order = null;
        var type = type || 'new';
        switch(type) {
          case 'new' : order = 'created desc'; break;
          case 'best' : order = 'created desc'; break;
          default: order = 'created desc';
        }
        
        var param = {
          'key': key,
          'offset': (page-1)*limit,
          'limit': limit,
          'order': order
        };
        
        var delay = $q.defer();
        Comment.query(param, function(simnuts) {
            delay.resolve(simnuts);
        }, function() {
            delay.reject('댓글을 가져올 수 없습니다');
        });
        return delay.promise;
      };
    }])
});