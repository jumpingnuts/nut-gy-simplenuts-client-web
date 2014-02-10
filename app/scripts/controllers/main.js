define([
  'angular',
  'services/main',
  'services/native',
  'controllers/comment',
  'kakao'],
  function (angular) {
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
        '$window',
        'MultiSimnutLoader',
        function($scope, $routeParams, $window, MultiSimnutLoader) {
          $scope.simnuts = [];
          $scope.isLoad = false;
          $scope.page = 1;
          $scope.type = $scope.nav.active = $routeParams.type;
    
          if($scope.type==='mine' && !$scope.isLogin()) {
            $scope.moveLogin();
          }
          
          $scope.listLoad = function(){
            if($scope.isLoad) {return false;}
            $scope.isLoad = true;
            new MultiSimnutLoader($scope.page, $scope.type, $scope.userInfo.id).then(function(res){
              if(res.length > 0) {
                $scope.simnuts = $scope.simnuts.concat(res);
                $scope.page++;
                $scope.isLoad = false;
              }
            });
          };
          
          $scope.listLoad();
        }
      ])
      
      .controller('ViewCtrl', 
        ['$scope',
        '$route',
        '$routeParams',
        'md5',
        'simnut',
        'LikeView',
        'LikeOn',
        'LikeOff',
        'ShareFunc',
        'NativeFunc',
        function($scope, $route, $routeParams, md5, simnut, LikeView, LikeOn, LikeOff, ShareFunc, NativeFunc){
        if(!simnut.id) { $scope.move('/list/trends'); }
        
        $scope.inputName = '';
        $scope.result = '';
        $scope.simnut = simnut;
        $scope.like = {
          'light' : false,
          'text' : {false: '꺼짐', true: '켜짐'},
          'id' : null
        }
        
        var variables = angular.fromJson($scope.simnut.variables);
        for(var i in variables) {
          variables[i] = variables[i].split(',');
        }
        $scope.simnut.variables = variables;
        
        $scope.getResult = function(){
          var md5Num = (md5.createHash($scope.inputName)).toString(10);
          var result = $scope.simnut.content.replace(new RegExp('\{이름\}',"gi"), '<b>'+$scope.inputName+'</b>');
          
          for(i in $scope.simnut.variables) {
            var randomString = $scope.simnut.variables[i][parseInt(md5Num.substr(i*2, 2) ,16) % variables[i].length];
            result = result.replace(new RegExp('\{변수'+(parseInt(i)+1)+'\}',"gi"), '<b>'+randomString+'</b>');
          }
          $scope.result = result;
        }
  
        if($scope.isLogin()) {
          LikeView($scope.simnut.id, $scope.userInfo.id).then(function(res){
            if(res) {
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
          } 
  
          if($scope.like.id) {
            LikeOff($scope.simnut.id, $scope.userInfo.id, $scope.like.id).then(function(res){
              if(res) {
                $scope.like.light = false;
                $scope.like.id = null;
              }
            });
          } else {
            LikeOn($scope.simnut.id, $scope.userInfo.id).then(function(res){
              if(res) {
                $scope.like.light = true;
                $scope.like.id = res.insertId;
                var data = {
                  'content': $(($scope.result || $scope.simnut.description).replace(/\<br[\s]?[\/]?\>/gi, '\n').trim()).text(),
                  'title': $scope.simnut.title,
                  'marketUrl': $scope.marketInfo.Url
                };
                var storyPostText = ShareFunc.postText(data);
                NativeFunc.uploadStroryPost(storyPostText, null, '앱으로 가기', $scope.webInfo.currentPath, '');
              }
            });
          }
        };
      }])
      .controller('WriteCtrl', ['$scope', 'SimnutSave', function($scope, SimnutSave){
        $scope.write = {
          'user_id': $scope.userInfo.id,
          'title': '',
          'description': '',
          'content': '',
          'variables': [{'value':''}],
          'is_anonymous':false
        }
        
        $scope.addVariables = function(){
          $scope.write.variables.push({'value':''});
        };
        
        $scope.simnutSave = function(){
          SimnutSave($scope.write).then(function(res){
            if(res.insertId) {
              $scope.move('/simnut/'+res.insertId);
            } else {
              var tmp = []
              for(var i in $scope.write.variables) {
                tmp.push({'value':$scope.write.variables[i]});
              }
              $scope.write.variables = tmp;
            }
          });
        };
      }])
      
      .controller('ShareCtrl', ['$scope', 'ShareFunc', function($scope, ShareFunc){
  //chk: 그린라이트 이미지 임

        $scope.shareLink = function(type){
          var data = {
            'content': $(($scope.result || $scope.simnut.description).replace(/\<br[\s]?[\/]?\>/gi, '\n').trim()).text(),
            'currentImage': 'https://lh5.ggpht.com/o0HQmfQGkCUUiB2iFSYbjIgFpCCnwEKNi-Abpa3Ui_OGrF1WrDfqiYVJDb_5evpwCaIl=w300-rw',
            'currentUrl': $scope.webInfo.currentUrl,
            'title': $scope.simnut.title,
            'marketUrl': $scope.marketInfo.Url,
            'appId': $scope.marketInfo.appId
          };
          ShareFunc[type](data);
        };
      }]);
  }
);
