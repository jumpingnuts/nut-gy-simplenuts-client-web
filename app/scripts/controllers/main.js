define(['angular', 'services/main', 'kakao'], function (angular) {
  'use strict';

  angular.module('mainCtrls', ['ngSanitize', 'ngMd5', 'mainServices'])
    .controller('MainCtrl', ['$scope', function ($scope) {
      
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    }])
    .controller('ListCtrl', 
      ['$scope',
       '$routeParams',
       'MultiSimnutLoader',
       function($scope, $routeParams, MultiSimnutLoader){

      $scope.simnuts = [];
      $scope.isLoad = false;
      $scope.page = 1;
      $scope.type = $scope.nav.active = $routeParams.type;

      $scope.listLoad = function(){
        if($scope.isLoad) {return false;}
        $scope.isLoad = true;
        MultiSimnutLoader($scope.page, $scope.type).then(function(res){
          $scope.simnuts = $scope.simnuts.concat(res);
          $scope.isLoad = false;
        });
        $scope.page++;
      };
      
      $scope.listLoad();
    }])
    
    .controller('ViewCtrl', 
      ['$scope',
      '$route',
      '$routeParams',
      'md5',
      'simnut',
      'LikeView',
      'LikeOn',
      'LikeOff',
      function($scope, $route, $routeParams, md5, simnut, LikeView, LikeOn, LikeOff){
      
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
          $scope.move('/login?redirectUrl='+$scope.webInfo.currentPath); 
        }else {
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
              }
            });
          }
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
          if(res) {
            console.log(res);
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
    
    .controller('ShareCtrl', ['$scope', function($scope){
//chk: 그린라이트 이미지 임
      var currentImage = 'https://lh5.ggpht.com/o0HQmfQGkCUUiB2iFSYbjIgFpCCnwEKNi-Abpa3Ui_OGrF1WrDfqiYVJDb_5evpwCaIl=w300-rw';
    
      $scope.kakaoTalk = function(){
        var content = $(($scope.result || $scope.simnut.description).replace(/\<br[\s]?[\/]?\>/gi, '\n').trim()).text();
        kakao.link("talk").send({
            msg : $scope.simnut.title+'\n\n'+content+'\n\n'+$scope.webInfo.currentUrl,
            url : $scope.marketInfo.Url,
            appid : "com.jumpingnuts.simsimNuts",
            appver : "1.0",
            appname : "심심풀이 너츠",
            type : "link"
        });
      };

      $scope.kakaoStory = function(){
        var content = $(($scope.result || $scope.simnut.description).replace(/\<br[\s]?[\/]?\>/gi, '\n').trim()).text();
        kakao.link("story").send({   
          post : '[심심풀이 너츠] '+$scope.simnut.title+'\n\n'+content+'\n\n'+$scope.webInfo.currentUrl+'\n\n안드로이드 : '+$scope.marketInfo.Url,
          appid : "com.jumpingnuts.simsimNuts",
          appver : "1.0",
          appname : "심심풀이 너츠",
          urlinfo : JSON.stringify({
            title: $scope.simnut.title, 
            desc: content.substring(0,80)+'...', 
            imageurl:[currentImage], 
            type:"app"
          })
        });
      };

      $scope.twitter = function(){
        var content = $(($scope.result || $scope.simnut.description).replace(/\<br[\s]?[\/]?\>/gi, '\n').trim()).text();
        window.location.href = 'https://twitter.com/intent/tweet?'+
          'original_referer='+encodeURIComponent($scope.webInfo.currentUrl)+
          '&text='+encodeURIComponent('[심심풀이 너츠] '+$scope.simnut.title+'\n'+content.replace(/\n/gi, " ").substring(0,60))+'\n\n'+
          '&url='+encodeURIComponent($scope.marketInfo.Url);
      };

      $scope.facebook = function(){
        var content = $(($scope.result || $scope.simnut.description).replace(/\<br[\s]?[\/]?\>/gi, '\n').trim()).text();
        window.location.href = 'http://www.facebook.com/sharer.php?m2w&s=100'+
          '&p[url]='+encodeURIComponent($scope.marketInfo.Url)+
          '&p[images][0]='+encodeURIComponent(currentImage)+
          '&p[title]='+$scope.simnut.title+
          '&p[summary]='+content;
      };
      
      $scope.postText = function(){
        var content = $(($scope.result || $scope.simnut.description).replace(/\<br[\s]?[\/]?\>/gi, '\n').trim()).text();
        return '[심심풀이 너츠] '+$scope.simnut.title+'\n\n'+content+'\n\n안드로이드 : '+$scope.marketInfo.Url;
      };
      
    }]);
});
