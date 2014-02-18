define([
  'angular',
  'jquery',
  'angularMD5',
  'services/main',
  'services/native',
  'controllers/comment',
  'kakao'
],
function (angular, $) {
  'use strict';

  angular.module('mainCtrls', ['ngSanitize', 'ngMd5', 'mainServices', 'nativeServices', 'commentCtrls'])
    .controller('MainCtrl', ['$scope', function ($scope) {
      
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    }])
    .controller('ListCtrl', [
      '$scope',
      '$routeParams',
      '$timeout',
      'MultiContentLoader',
      'Content',
      function($scope, $routeParams, $timeout, MultiContentLoader, Content) {
        $scope.isLoad = false;
        
        if($scope.contents.type !== $routeParams.type) {
          $scope.contents.data = [];
          $scope.contents.page = 1;
        } else {
          $timeout(function(){
            $scope.loadScroll();
          }, 0);
        }
        
        $scope.contents.type = $scope.nav.active = $routeParams.type;
        
        if($scope.contents.type==='mine' && !$scope.isLogin()) {
          $scope.moveLogin();
          return false;
        }
        
        $scope.listLoad = function(){
          if($scope.isLoad) {return false;}
          $scope.isLoad = true;
          new MultiContentLoader($scope.contents.page, $scope.contents.type, $scope.userInfo.id).then(function(res){
            if(res.length > 0) {
              $scope.contents.data = $scope.contents.data.concat(res);
              $scope.contents.page++;
              $scope.isLoad = false;
            }
          });
        };
        $scope.listLoad();
        
        $scope.deleteContent = function($event){
          $scope.eventStop($event);
          if(confirm('삭제 하시겠습니까?')) {
            var contentId = $($event.currentTarget).attr('data-id');
            new Content.remove({ id:contentId }, function(res){
              if(res.affectedRows > 0) {
                for(var i in $scope.contents.data) {
                  if($scope.contents.data[i].id === parseInt(contentId)) {
                    $scope.contents.data.pop(i);
                    break;
                  }
                }
              }
            });
          }
        };
      }
    ])
    
    .controller('ViewCtrl', [
      '$scope',
      '$route',
      '$routeParams',
      'md5',
      'content',
      'LikeView',
      'LikeOn',
      'LikeOff',
      'ShareFunc',
      'NativeFunc',
      function($scope, $route, $routeParams, md5, content, LikeView, LikeOn, LikeOff, ShareFunc, NativeFunc){
        if(!content.id) { $scope.move('/list/trends'); }
        $scope.inputName = $scope.userConnection.kakao ? $scope.userConnection.kakao.username : $scope.userInfo.name;
        $scope.result = '';
        $scope.content = content;
        $scope.like = {
          'light' : false,
          'text' : {false: '꺼짐', true: '켜짐'},
          'id' : null
        };
        
        var variables = angular.fromJson($scope.content.variables);
        for(var i in variables) {
          variables[i] = variables[i].split(',');
        }
        $scope.content.variables = variables;
        
        $scope.getResult = function(){
          var md5Num = (md5.createHash($scope.inputName)).toString(10);
          var result = $scope.content.content.replace(new RegExp('{이름}','gi'), '<b>'+$scope.inputName+'</b>');
          
          for(var i in $scope.content.variables) {
            var randomString = $scope.content.variables[i][parseInt(md5Num.substr(i*2, 2) ,16) % variables[i].length];
            result = result.replace(new RegExp('{변수'+(parseInt(i)+1)+'}','gi'), '<b>'+randomString+'</b>');
          }
          $scope.result = result;
          
          if(window.android){
            var data = {
              'appName': $scope.appInfo.title,
              'title': $scope.content.title,
              'marketUrl': $scope.appInfo.android.url,
              'type': 'image',
              'content': $(('<b>'+$scope.result+'</b>' || '<b>'+$scope.content.description+'</b>').replace(/<br[\s]?[\/]?\>/gi, '\n').trim()).text(),
              'contnetPostfix': $scope.result ? ' 실행 결과입니다.' : ' 앱을 좋아합니다.',
              'name': $scope.inputName
            };

            var image = $scope.userConnection.kakao ? $scope.userConnection.kakao.thumbnail : null;

            data.storyPostText = ShareFunc.postText(data);
            NativeFunc.uploadStroryPost(data, image, '앱으로 가기', $scope.appInfo.currentPath, '');
          }
        };
  
        if($scope.isLogin()) {
          new LikeView($scope.content.id, $scope.userInfo.id).then(function(res){
            if(res.id) {
              $scope.like.light = true;
              $scope.like.id = res.id;
            }
          });
        } else {
          $scope.like.light = false;
        }
        
        $scope.likeToggle = function(){
          if(!$scope.isLogin()) {
            $scope.moveLogin();
            return false;
          }
  
          if($scope.like.id) {
            new LikeOff($scope.content.id, $scope.userInfo.id, $scope.like.id).then(function(res){
              if(res) {
                $scope.like.light = false;
                $scope.like.id = null;
              }
            });
          } else {
            new LikeOn($scope.content.id, $scope.userInfo.id).then(function(res){
              if(res) {
                $scope.like.light = true;
                $scope.like.id = res.insertId;
                if(window.android){
                  var data = {
                    'type': 'text',
                    'storyPostText': ($scope.userConnection.kakao ? $scope.userConnection.kakao.username : $scope.userInfo.name)+'님이 ['+$scope.content.title+'] 앱을 좋아 합니다.\n\n안드로이드 다운로드\n'+$scope.appInfo.android.url
                  };
                  NativeFunc.uploadStroryPost(data, null, '앱으로 가기', $scope.appInfo.currentPath, '');
                }
              }
            });
          }
        };
      }
    ])
    .controller('WriteCtrl', ['$scope', 'ContentSave', function($scope, ContentSave){
      $scope.write = {
        'user_id': $scope.userInfo.id,
        'title': '',
        'description': '',
        'content': '',
        'variables': [{'value':''}],
        'is_anonymous':false
      };
      
      $scope.addVariables = function(){
        $scope.write.variables.push({'value':''});
      };
      
      $scope.contentSave = function(){
        new ContentSave($scope.write).then(function(res){
          if(res.insertId) {
            $scope.move('/content/'+res.insertId);
          } else {
            var tmp = [];
            for(var i in $scope.write.variables) {
              tmp.push({'value':$scope.write.variables[i]});
            }
            $scope.write.variables = tmp;
          }
        });
      };
    }])
    
    .controller('ShareCtrl', ['$scope', 'ShareFunc', function($scope, ShareFunc){
      $scope.shareLink = function(type){
        var data = {
          'appName': $scope.appInfo.title,
          'content': $(('<b>'+$scope.result+'</b>' || '<b>'+$scope.content.description+'</b>').replace(/<br[\s]?[\/]?\>/gi, '\n').trim()).text(),
          'currentImage': '',
          'currentUrl': $scope.appInfo.currentUrl,
          'title': $scope.content.title,
          'marketUrl': $scope.appInfo.android.url,
          'appId': $scope.appInfo.android.appId
        };
        ShareFunc[type](data);
      };
    }]);
});
