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
        inputData: "="
      },
      templateUrl: "services/output-table/html/outputTemplate.html",
      //template: "<md-button class='md-raised'>YOLO</md-button>",
      link: function ($scope, element, attrs)
      {
        var vm = $scope;

        console.log(vm.inputData);

        vm.openTable = function (ev)
        {
          $mdDialog.show({
            templateUrl: "services/output-table/html/modalTemplate.html",
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            locals: {
              inputData: vm.inputData
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
