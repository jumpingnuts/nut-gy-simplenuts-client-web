define(['angular', 'services/comment'], function (angular) {
  'use strict';

  angular.module('commentCtrls', ['commentServices'])
    .controller('CommentCtrl', [ '$scope', 'CommentLoader', 'CommentWrite', function($scope, CommentLoader, CommentWrite){
      $scope.content = '';
      $scope.comment = {
        page: 1,
        type: 'new',
        data: []
      };
      $scope.commentLoad = function(){
        CommentLoader($scope.comment.page, $scope.webInfo.currentUrl, $scope.comment.type).then(function(res){
          $scope.comment.data = res;
        });
      }
      $scope.commentLoad();
      
      $scope.commentWrite = function(){
        CommentWrite($scope.webInfo.currentUrl, $scope.content, $scope.userInfo.id).then(function(res){
          $scope.comment.push($scope.content);
          $scope.content = '';
        });
      };
    }])
});
