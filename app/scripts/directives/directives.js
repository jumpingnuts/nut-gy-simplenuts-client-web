'use strict';

define(['angular'], function (angular) {
  angular.module('directives', []).directive('ngScrolled', ['$window', '$document', function($window, $document) {
      return function(scope, elm, attr) {
          var $win = $($window);
          var $doc = $($document);

          $win.bind('scroll', function() {
              if ($doc.scrollTop() > ($doc.height()*0.9) - $win.height()) {
                  scope.$apply(attr.ngScrolled);
              }
          });
      };
  }]);
})


