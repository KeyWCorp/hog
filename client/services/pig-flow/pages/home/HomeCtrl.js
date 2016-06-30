/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


/**
*/

'use strict';

angular.module('myApp').controller('HomeCtrl', ['$rootScope', '$scope', '$mdDialog',
    function($rootScope, $scope, $mdDialog)
    {
      //TODO - put any directive code here

      $scope.data = {
        nodes: [],
        links: [],
        script: ""
      };

      $scope.outputData = {};

      $scope.newScript = function ()
      {
        $scope.data = {
          "nodes": [
          {
            "x": 445,
            "y": 23.899999999999977,
            "width": 330,
            "height": 124,
            "name": "new node 0",
            "category": "input",
            "type": "load",
            "params": [
            {
              "name": "source",
              "value": "/Users/kmcoxe/Documents/IPI/test/test.data"
            },
            {
              "name": "format",
              "value": "(x:int, y:int)"
            },
            {
              "name": "seperator",
              "value": " "
            }
            ],
            "script": {
              "input_var": false,
              "output_var": true,
              "variables": [
                "source",
                "format",
                "seperator"
              ],
              "content": "<output_variable> = LOAD '<source>' USING PigStorage('<seperator>') AS <format>;"
            },
            "inputs": [],
            "outputs": [
            {
              "label": "variable",
              "value": ""
            }
            ],
            "output": "load0",
            "fixed": 1,
            "index": 0,
            "weight": 2,
            "px": 445,
            "py": 23.899999999999977,
            "output_node": 2
          },
          {
            "x": 144,
            "y": 187.89999999999998,
            "width": 330,
            "height": 124,
            "name": "new node 1",
            "category": "input",
            "type": "group",
            "params": [
            {
              "name": "type",
              "value": "x"
            }
            ],
            "script": {
              "input_var": true,
              "output_var": true,
              "variables": [
                "type"
              ],
              "content": "<output_variable> = GROUP <input_source> BY <type>;"
            },
            "inputs": [
            {
              "label": "source",
              "category": "input",
              "value": "load0"
            }
            ],
            "outputs": [
            {
              "label": "variable",
              "value": ""
            }
            ],
            "output": "group1",
            "fixed": 1,
            "index": 1,
            "weight": 2,
            "px": 144,
            "py": 187.89999999999998,
            "input_node": 0,
            "input": "load0",
            "output_node": 2
          },
          {
            "x": 468,
            "y": 336.9,
            "width": 360,
            "height": 124,
            "name": "new node 2",
            "category": "function",
            "type": "sum",
            "params": [
            {
              "name": "type",
              "value": "x"
            }
            ],
            "script": {
              "input_var": true,
              "output_var": true,
              "variables": [
                "type"
              ],
              "content": "<output_variable> = FOREACH <input_grouping> GENERATE SUM(<input_source>.<type>) AS <type>;"
            },
            "inputs": [
            {
              "label": "grouping",
              "type": "group",
              "value": "group1"
            },
            {
              "label": "source",
              "category": "input",
              "value": "load0"
            }
            ],
            "outputs": [
            {
              "label": "variable",
              "value": ""
            }
            ],
            "output": "sum2",
            "fixed": 1,
            "index": 2,
            "weight": 3,
            "px": 468,
            "py": 336.9,
            "input_node": 0,
            "input": "load0",
            "output_node": 3
          },
          {
            "x": 357,
            "y": 497.9,
            "width": 330,
            "height": 124,
            "name": "new node 3",
            "category": "output",
            "type": "dump",
            "params": [],
            "script": {
              "input_var": true,
              "output_var": false,
              "variables": [],
              "content": "DUMP <input_variable>;"
            },
            "inputs": [
            {
              "label": "variable",
              "value": "sum2"
            }
            ],
            "outputs": [],
            "output": "dump3",
            "fixed": 1,
            "index": 3,
            "weight": 1,
            "px": 357,
            "py": 497.9,
            "input_node": 2,
            "input": "sum2"
          }
          ],
          "links": [
          {
            "source": {
              "x": 445,
              "y": 23.899999999999977,
              "width": 330,
              "height": 124,
              "name": "new node 0",
              "category": "input",
              "type": "load",
              "params": [
              {
                "name": "source",
                "value": "/Users/kmcoxe/Documents/IPI/test/test.data"
              },
              {
                "name": "format",
                "value": "(x:int, y:int)"
              },
              {
                "name": "seperator",
                "value": " "
              }
              ],
              "script": {
                "input_var": false,
                "output_var": true,
                "variables": [
                  "source",
                  "format",
                  "seperator"
                ],
                "content": "<output_variable> = LOAD '<source>' USING PigStorage('<seperator>') AS <format>;"
              },
              "inputs": [],
              "outputs": [
              {
                "label": "variable",
                "value": ""
              }
              ],
              "output": "load0",
              "fixed": 1,
              "index": 0,
              "weight": 2,
              "px": 445,
              "py": 23.899999999999977,
              "output_node": 2
            },
            "target": {
              "x": 144,
              "y": 187.89999999999998,
              "width": 330,
              "height": 124,
              "name": "new node 1",
              "category": "input",
              "type": "group",
              "params": [
              {
                "name": "type",
                "value": "x"
              }
              ],
              "script": {
                "input_var": true,
                "output_var": true,
                "variables": [
                  "type"
                ],
                "content": "<output_variable> = GROUP <input_source> BY <type>;"
              },
              "inputs": [
              {
                "label": "source",
                "category": "input",
                "value": "load0"
              }
              ],
              "outputs": [
              {
                "label": "variable",
                "value": ""
              }
              ],
              "output": "group1",
              "fixed": 1,
              "index": 1,
              "weight": 2,
              "px": 144,
              "py": 187.89999999999998,
              "input_node": 0,
              "input": "load0",
              "output_node": 2
            },
            "output_data": {
              "label": "variable",
              "value": ""
            },
            "input_data": {
              "label": "source",
              "category": "input",
              "value": "load0"
            },
            "x1": 165,
            "y1": 124,
            "x2": 165,
            "y2": 0
          },
          {
            "source": {
              "x": 144,
              "y": 187.89999999999998,
              "width": 330,
              "height": 124,
              "name": "new node 1",
              "category": "input",
              "type": "group",
              "params": [
              {
                "name": "type",
                "value": "x"
              }
              ],
              "script": {
                "input_var": true,
                "output_var": true,
                "variables": [
                  "type"
                ],
                "content": "<output_variable> = GROUP <input_source> BY <type>;"
              },
              "inputs": [
              {
                "label": "source",
                "category": "input",
                "value": "load0"
              }
              ],
              "outputs": [
              {
                "label": "variable",
                "value": ""
              }
              ],
              "output": "group1",
              "fixed": 1,
              "index": 1,
              "weight": 2,
              "px": 144,
              "py": 187.89999999999998,
              "input_node": 0,
              "input": "load0",
              "output_node": 2
            },
            "target": {
              "x": 468,
              "y": 336.9,
              "width": 360,
              "height": 124,
              "name": "new node 2",
              "category": "function",
              "type": "sum",
              "params": [
              {
                "name": "type",
                "value": "x"
              }
              ],
              "script": {
                "input_var": true,
                "output_var": true,
                "variables": [
                  "type"
                ],
                "content": "<output_variable> = FOREACH <input_grouping> GENERATE SUM(<input_source>.<type>) AS <type>;"
              },
              "inputs": [
              {
                "label": "grouping",
                "type": "group",
                "value": "group1"
              },
              {
                "label": "source",
                "category": "input",
                "value": "load0"
              }
              ],
              "outputs": [
              {
                "label": "variable",
                "value": ""
              }
              ],
              "output": "sum2",
              "fixed": 1,
              "index": 2,
              "weight": 3,
              "px": 468,
              "py": 336.9,
              "input_node": 0,
              "input": "load0",
              "output_node": 3
            },
            "output_data": {
              "label": "variable",
              "value": ""
            },
            "input_data": {
              "label": "grouping",
              "type": "group",
              "value": "group1"
            },
            "x1": 165,
            "y1": 124,
            "x2": 167.5,
            "y2": 0
          },
          {
            "source": {
              "x": 468,
              "y": 336.9,
              "width": 360,
              "height": 124,
              "name": "new node 2",
              "category": "function",
              "type": "sum",
              "params": [
              {
                "name": "type",
                "value": "x"
              }
              ],
              "script": {
                "input_var": true,
                "output_var": true,
                "variables": [
                  "type"
                ],
                "content": "<output_variable> = FOREACH <input_grouping> GENERATE SUM(<input_source>.<type>) AS <type>;"
              },
              "inputs": [
              {
                "label": "grouping",
                "type": "group",
                "value": "group1"
              },
              {
                "label": "source",
                "category": "input",
                "value": "load0"
              }
              ],
              "outputs": [
              {
                "label": "variable",
                "value": ""
              }
              ],
              "output": "sum2",
              "fixed": 1,
              "index": 2,
              "weight": 3,
              "px": 468,
              "py": 336.9,
              "input_node": 0,
              "input": "load0",
              "output_node": 3
            },
            "target": {
              "x": 357,
              "y": 497.9,
              "width": 330,
              "height": 124,
              "name": "new node 3",
              "category": "output",
              "type": "dump",
              "params": [],
              "script": {
                "input_var": true,
                "output_var": false,
                "variables": [],
                "content": "DUMP <input_variable>;"
              },
              "inputs": [
              {
                "label": "variable",
                "value": "sum2"
              }
              ],
              "outputs": [],
              "output": "dump3",
              "fixed": 1,
              "index": 3,
              "weight": 1,
              "px": 357,
              "py": 497.9,
              "input_node": 2,
              "input": "sum2"
            },
            "output_data": {
              "label": "variable",
              "value": ""
            },
            "input_data": {
              "label": "variable",
              "value": "sum2"
            },
            "x1": 180,
            "y1": 124,
            "x2": 165,
            "y2": 0
          },
          {
            "source": {
              "x": 445,
              "y": 23.899999999999977,
              "width": 330,
              "height": 124,
              "name": "new node 0",
              "category": "input",
              "type": "load",
              "params": [
              {
                "name": "source",
                "value": "/Users/kmcoxe/Documents/IPI/test/test.data"
              },
              {
                "name": "format",
                "value": "(x:int, y:int)"
              },
              {
                "name": "seperator",
                "value": " "
              }
              ],
              "script": {
                "input_var": false,
                "output_var": true,
                "variables": [
                  "source",
                  "format",
                  "seperator"
                ],
                "content": "<output_variable> = LOAD '<source>' USING PigStorage('<seperator>') AS <format>;"
              },
              "inputs": [],
              "outputs": [
              {
                "label": "variable",
                "value": ""
              }
              ],
              "output": "load0",
              "fixed": 1,
              "index": 0,
              "weight": 2,
              "px": 445,
              "py": 23.899999999999977,
              "output_node": 2
            },
            "target": {
              "x": 468,
              "y": 336.9,
              "width": 360,
              "height": 124,
              "name": "new node 2",
              "category": "function",
              "type": "sum",
              "params": [
              {
                "name": "type",
                "value": "x"
              }
              ],
              "script": {
                "input_var": true,
                "output_var": true,
                "variables": [
                  "type"
                ],
                "content": "<output_variable> = FOREACH <input_grouping> GENERATE SUM(<input_source>.<type>) AS <type>;"
              },
              "inputs": [
              {
                "label": "grouping",
                "type": "group",
                "value": "group1"
              },
              {
                "label": "source",
                "category": "input",
                "value": "load0"
              }
              ],
              "outputs": [
              {
                "label": "variable",
                "value": ""
              }
              ],
              "output": "sum2",
              "fixed": 1,
              "index": 2,
              "weight": 3,
              "px": 468,
              "py": 336.9,
              "input_node": 0,
              "input": "load0",
              "output_node": 3
            },
            "output_data": {
              "label": "variable",
              "value": ""
            },
            "input_data": {
              "label": "source",
              "category": "input",
              "value": "load0"
            },
            "x1": 165,
            "y1": 124,
            "x2": 192.5,
            "y2": 0
          }
          ]
        };
      };

      $scope.ots = function(d)
      {
        return JSON.stringify(d);
      };
    }
]);
