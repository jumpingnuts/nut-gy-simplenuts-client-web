'use strict';

define([
    'app', //생성한 앵귤러 모듈에 루트를 등록하기 위해 임포트
    'angularRoute'
  ],

  function (app, routeConfig) {
    //app은 생성한 myApp 앵귤러 모듈
    return app.config(function ($routeProvider) {

      //view1 경로 설정
      $routeProvider.when('/main', {
        templateUrl: 'book.html',
        controller: BookCntl,
        controllerAs: 'book'
      });
        
      //기본 경로 설정
      $routeProvider.otherwise({redirectTo:'/main'});
    });
});
