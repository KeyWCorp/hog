
/**
*/

'use strict';

if (OutputTableModule === undefined)
{
  var OutputTableModule = angular.module("pig.output-table", [])
}
OutputTableModule
.factory("pigTableController", function ($mdDialog, lodash)
    {
      var pigTableController = function ($scope, inputData, scriptName)
      {
        $scope.inputData = inputData;
        $scope.scriptName = scriptName;
        $scope.totalData = [];
        $scope.tableData = [];

        $scope.query = {
          order: "0",
          limit: 5,
          page: 1
        };

        $scope.inputData.map(function(data)
            {
              var tmp_data = lodash.extend({}, data);
              $scope.totalData.push(tmp_data);
            });

        $scope.headers = Object.keys($scope.totalData[0]);

        $scope.updateData = function(data, limit)
        {

          if (typeof limit === "undefined" && typeof data !== "undefined")
          {
            $scope.query.order = data;
            var sign = ($scope.query.order[0] === "-" ? -1 : 1);

            // reorder data
            $scope.totalData.sort(function(a, b)
                {
                  try {
                    var A = Number(a[Number($scope.query.order) * sign]);
                    var B = Number(b[Number($scope.query.order) * sign]);

                    if (isNaN(A) || isNaN(B))
                    {
                      if (typeof a[Number($scope.query.order) * sign] !== "undefined")
                      {
                        A = a[Number($scope.query.order) * sign].toUpperCase();
                      }
                      else
                      {
                        A = "";
                      }

                      if (typeof b[Number($scope.query.order) * sign] !== "undefined")
                      {
                        B = b[Number($scope.query.order) * sign].toUpperCase();
                      }
                      else
                      {
                        B = "";
                      }

                      var ip_re = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
                      if (A.match(ip_re))
                        A = ipAddressPre(A);
                      if (B.match(ip_re))
                        B = ipAddressPre(B);
                    }

                    if (A < B)
                    {
                      return (-1 * sign);
                    }
                    if (A > B)
                    {
                      return (1 * sign);
                    }
                    return 0;
                  }
                  catch(err) {
                    console.log(err);
                  }
                });
          }
          else if (typeof limit !== "undefined" && typeof data !== "undefined")
          {
            $scope.query.page = data;
            $scope.query.limit = limit;
          }

          var start = ($scope.query.page * $scope.query.limit) - $scope.query.limit;
          var end = start + $scope.query.limit;

          if (end > $scope.totalData.length - 1)
          {
            end = $scope.totalData.length;
          }

          $scope.tableData = $scope.totalData.slice(start, end);
        };
        $scope.updateData($scope.query.order);

        $scope.close = function ()
        {
          $mdDialog.cancel();
        };
      };

      var ipAddressPre = function (a)
      {

        var i, item;
        var m = a.split("."),
        n = a.split(":"),
        x = "",
        xa = "";

        if (m.length == 4) {
          // IPV4
          for(i = 0; i < m.length; i++) {
            item = m[i];

            if(item.length == 1) {
              x += "00" + item;
            }
            else if(item.length == 2) {
              x += "0" + item;
            }
            else {
              x += item;
            }
          }
        }
        else if (n.length > 0) {
          // IPV6
          var count = 0;
          for(i = 0; i < n.length; i++) {
            item = n[i];

            if (i > 0) {
              xa += ":";
            }

            if(item.length === 0) {
              count += 0;
            }
            else if(item.length == 1) {
              xa += "000" + item;
              count += 4;
            }
            else if(item.length == 2) {
              xa += "00" + item;
              count += 4;
            }
            else if(item.length == 3) {
              xa += "0" + item;
              count += 4;
            }
            else {
              xa += item;
              count += 4;
            }
          }

          // Padding the ::
          n = xa.split(":");
          var paddDone = 0;

          for (i = 0; i < n.length; i++) {
            item = n[i];

            if (item.length === 0 && paddDone === 0) {
              for (var padding = 0 ; padding < (32-count) ; padding++) {
                x += "0";
                paddDone = 1;
              }
            }
            else {
              x += item;
            }
          }
        }

        return x;
      };


      return pigTableController;

    });
