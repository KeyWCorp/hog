/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


/**
*/

'use strict';

angular.module("pig.uploader", [])
  .directive('onReadFile', function ($parse) {
    return {
      restrict: 'A',
      scope: false,
      /**
       * Description
       * @method link
       * @param {} $scope
       * @param {} element
       * @param {} attrs
       */
      link: function($scope, element, attrs) {
        var fn = $parse(attrs.onReadFile);

        element.on('change', function(onChangeEvent) {
          var reader = new FileReader();

          /**
           * Description
           * @method onload
           * @param {} onLoadEvent
           */
          reader.onload = function(onLoadEvent) {
            $scope.$apply(function() {
              fn($scope, {$fileContent:onLoadEvent.target.result});
            });
          };

          reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
        });
      }
    };
  });
