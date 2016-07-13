/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


/**
 */

'use strict';

if (PigFlowModule === undefined)
{
  var PigFlowModule = angular.module("pig.pig-flow", [])
}
PigFlowModule
.factory('pigFlowTemplate', function()
    {
      return "services/pig-flow/src/html/pigFlowTemplate.html";
    });
