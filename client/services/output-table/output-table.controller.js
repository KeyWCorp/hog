
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
      var pigTableController = function ($scope, inputData)
      {
        $scope.inputData = inputData;
        $scope.tableData = [];

        $scope.inputData.map(function(data)
            {
              var tmp_data = lodash.extend({}, data);
              $scope.tableData.push(tmp_data);
            });

        $scope.headers = Object.keys($scope.tableData[0]);

        $scope.updateData = function(data)
        {

          if (typeof data === "string")
          {
            var sign = (data[0] === "-" ? -1 : 1);

            // reorder data
            $scope.tableData.sort(function(a, b)
                {
                  try {
                    var A = Number(a[Number(data) * sign]);
                    var B = Number(b[Number(data) * sign]);

                    if (isNaN(A) || isNaN(B))
                    {
                      A = a[Number(data) * sign].toUpperCase();
                      B = b[Number(data) * sign].toUpperCase();

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
        };

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
