'use strict';

//requireJS 모듈 선언 - [myApp 앵귤러 모듈]
define([
    'angular', //앵귤러 모듈을 사용하기 위해 임포트
    'controllers/main',
    'controllers/user',
    'directives/directives',
    'filters/filters'
  ],
  
/*
  이 부분도 주의깊게 살펴봐야한다.
  위의 디펜던시들이 모두 로드된 뒤에 아래의 콜백이 실행된다.
  디펜던시들이 리턴하는 객체들을 콜백함수의 파라메터로 받게 되는데,
  자세히보면 route-config와 같이 snake case로 된 파일명이,
  파라메터로 받을 때는 routeConfig와 같이 camel case로 바뀌는 것을 볼 수 있다.
*/
  //디펜던시 로드뒤 콜백함수
  function (angular) {
  
    //위의 디펜던시를 가져와서 콜백을 수행하게 되는데,
    //리턴하는 내용이 실제 사용되는 부분이겠지?
    //여기서는 myApp이라는 앵귤러 모듈을 리턴한다.

    //모듈 선언
    var app = angular.module(
      'simsimNuts', [
        'mainCtrls',
        'userCtrls',
        'mainServices',
        'userServices',
        'nativeServices',
        'directives',
        'filters',
        'ngRoute',
        'ui.bootstrap'
      ],
      function ($routeProvider) {
      //view1 경로 설정
        $routeProvider
          .when('/list/:type', {
            //template: '<div></div>',
            controller : 'ListCtrl',
            templateUrl : './views/list.html'
          })
          .when('/simnut/:simnutId', {
            //template: '<div></div>',
            controller : 'ViewCtrl',
            resolve : {
              simnut :
                function(SimnutLoader) {
                  return new SimnutLoader();
                }
            },
            templateUrl : './views/view.html'
          })
          .when('/write', {
            controller : 'WriteCtrl',
            templateUrl : './views/write.html'
          })
          .when('/login', {
            controller : 'LoginCtrl',
            templateUrl : './views/signin.html'
          })
          .when('/regist', {
            controller : 'RegistCtrl',
            templateUrl : './views/regist.html'
          })
          .otherwise({redirectTo:'/list/trends'});
      });
    
    //공통 컨트롤러 설정 - 모든 컨트롤러에서 공통적으로 사용하는 부분들 선언
    app.controller('CommonController', ['$rootScope', '$scope', '$location', function($rootScope, $scope, $location) {
      var w = window.innerWidth || document.documentElement.clientWidth;
      $scope.webInfo = {
        'title': '심심풀이 테스트',
        'mailto': 'mailto:nuts@jumpingnuts.com',
        'company': 'Jumping Nuts Inc.',
        'establishmentYear': '2013',
      };
      
      $rootScope.apiInfo = {
//        'baseUrl': 'http://api.jumpingnuts.com',
        'baseUrl': 'http://dev.jumpingnuts.com:9000',
        'clientId': '0441c0011f37fec037843fcfe314366f',
        'responseType': 'token',
        'openType': 'iframe'//iframe, opener
      }
      
      $scope.$on('$routeChangeStart', function(){
        $scope.webInfo.currentUrl=$location.absUrl();
        $scope.webInfo.currentPath=$location.path();
        $scope.alerts = [];
        $scope.nav.navCollapsed = true;
      });
      
      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };
      
      $scope.nav = {
        'active': 'trends',
        'items': {
          'trends': {'name':'트렌드', 'order':1},
          'best': {'name': '베스트', 'order':2},
          'new': {'name': '새 앱', 'order':3},
          'mine': {'name': '내가 만든 앱', 'hide':true, 'order':4}
        },
      };

      $scope.marketInfo = {
        'appId': 'com.jumpingnuts.simsimNuts', 
        'url' : 'https://play.google.com/store/apps/details?id=com.jumpingnuts.simsimNuts',
        'urlCustom' : 'market://details?id=com.jumpingnuts.simsimNuts'
      };
      
      $scope.adInfo = {
        'width' : w<468 ? '320' : (w<728 ? '468' : '728'),
        'height' : w<468 ? '100' : (w<728 ? '60' : '90'),
        'slot' : w<468 ? '2879098937' : (w<728 ? '6250720936' : '7386363738')
      };
      
      $scope.adsenseLoad = function(){
//chk : 애드센스 403오류      
//        (adsbygoogle = window.adsbygoogle || []).push({});
      };
      
      $scope.move = function ( url ) {
        $location.url( url );
      };
    }]);
    
    app.controller('NativeCtrl', ['$scope', 'NativeFunc', 'UserConnectionLogin', function($scope, NativeFunc, UserConnectionLogin){
      $scope.loginCallback = function(res){
        if(JSON.parse(res).response == 200) {
          $scope.userInfo.connection.push('kakao');
          $scope.userConnection = {'kakao' : JSON.parse(window.android.getUserInfo())};

          NativeFunc.notiRegist($scope.userConnection.kakao.username);
          if($scope.userConnection.kakao.properties.uid && $scope.userConnection.kakao.properties.key) {
            new UserConnectionLogin(
              $scope.userConnection.kakao.properties.uid,
              'kakao',
              $scope.userConnection.kakao.properties.key
            ).then(function(res, code){
              if(code === 200) {
                $scope.userInfo = res;
              }
            });
          }
        }

      };
      //getUserInfo
      //setUserInfo
      //uploadStoryPost
    }]);
    
    return app;
  }
);
