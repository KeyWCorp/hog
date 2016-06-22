/**
 */

'use strict';

if (OutputTableModule === undefined)
{
  var OutputTableModule = angular.module("pig.output-table", [])
}
OutputTableModule
  .directive("pigTable", function ($mdDialog, pigTableController)
  {
    return {
      restraints: "E",
      templateUrl: "services/output-table/html/outputTemplate.html",
      //template: "<md-button class='md-raised'>YOLO</md-button>",
      link: function ($scope, element, attrs)
      {
        var vm = $scope;

        vm.openTable = function (ev)
        {
          $mdDialog.show({
            templateUrl: "services/output-table/html/modalTemplate.html",
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            controller: pigTableController,
          })
          .then(function(answer) {
            $scope.status = 'You said the information was "' + answer + '".';
          }, function() {
            $scope.status = 'You cancelled the dialog.';
          });
        };
      }
    }
  });
