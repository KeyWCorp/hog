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
      scope: {
        inputData: "=",
        scriptName: "="
      },
      templateUrl: "services/output-table/html/outputTemplate.html",
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
            locals: {
              inputData: vm.inputData,
              scriptName: vm.scriptName
            },
            controller: pigTableController,
          })
          .then(function(answer) {
            console.log('You said the information was "' + answer + '".');
          }, function() {
            console.log('You cancelled the dialog.');
          });
        };
      }
    }
  });
