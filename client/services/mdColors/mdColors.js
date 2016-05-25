(function () {
  "use strict";

  var _theme;

  angular
    .module('mdColors',['mdColors'])

    .config(['$mdThemingProvider', function($mdThemingProvider){
      _theme = $mdThemingProvider.theme();
    }])

    .directive('mdStyleColor', ['$mdColorPalette',
      function ($mdColorPalette) {
        return {
          restrict: 'A',
          scope: { mdStyleColor: '=' },
          link: function (scope, element, attrs) {
            for (var p in scope.mdStyleColor) {
              if (scope.mdStyleColor.hasOwnProperty(p)) {

                var themeColors = _theme.colors;

                var split = (scope.mdStyleColor[p] || '').split('.');
                if (split.length < 2) split.unshift('primary');

                var hueR   = split[1] || 'hue-1';    // 'hue-1'
                var colorR = split[0] || 'primary';  // 'warn'

                // Absolute color: 'orange'
                var colorA = themeColors[colorR] ?
                  themeColors[colorR].name : colorR;

                // Absolute Hue: '500'
                var hueA =
                  themeColors[colorR] ?
                  themeColors[colorR].hues[hueR] || hueR :
                  hueR;

                var colorValue = $mdColorPalette[colorA][hueA] ?
                  $mdColorPalette[colorA][hueA].value :
                  $mdColorPalette[colorA]['500'].value;

                element.css(p, 'rgb('+colorValue.join(',')+')');

              }
            }
          }
        }
      }]);
}());
