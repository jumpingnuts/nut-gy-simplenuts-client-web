define(['angular'], function (angular) {
  'use strict';
  
  angular.module('nativeServices', [ 'ngResource' ])
    .factory('Noti', [ '$resource', function($resource) {
      return $resource('http://dev.jumpingnuts.com:9000/api/notification/regist');
    }])
    .factory('NativeFunc', ['Noti', function(Noti){
      return {
        'notiRegist': function(username, marketUrl){
          var param = JSON.parse(window.android.getRegId());
          param.type = 'simnut';
          new Noti.save(param, function(res) {
            if(res.insertId > 0) {
              var storyPostText = username+'님이 \'심심풀이너츠\'앱을 시작하셨습니다.\n\n안드로이드 다운로드\n'+marketUrl;
              this.uploadStroryPost(storyPostText, null, '앱으로 가기', '#/list/trends', '');
            }
          });
        },
        'getUserInfo': function(){
          
        },
        'setUserInfo': function(){
          
        },
        'uploadStroryPost': function(storyPostText, img, title, href, callback){
          window.android.kakaoStoryUpload(
            storyPostText,
            img, //img url
            title,
            href,
            callback //callback $scope 테스트 필요
          );
        }
      };
    }]);
});