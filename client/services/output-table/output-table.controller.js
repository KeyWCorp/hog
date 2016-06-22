
/**
 */

'use strict';

if (OutputTableModule === undefined)
{
  var OutputTableModule = angular.module("pig.output-table", [])
}
OutputTableModule
  .factory("pigTableController", function ($mdDialog)
  {
    var pigTableController = function ()
    {
    };

    return pigTableController;

  });
