define(['angular', 'services/comment'], function (angular) {
  'use strict';

  angular.module('commentCtrls', ['commentServices'])
    .controller('CommentCtrl', [ '$scope', 'CommentLoader', function($scope, CommentLoader){
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
    }])
});
