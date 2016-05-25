
// Controller for Graph Info Modal
function GraphInfoController($mdDialog, $scope, $timeout, graph_data, script)
{
  $scope.script_name = script.name;
  $scope.graph_data = graph_data;
  $scope.graph_layout = [];
  $scope.indexs = [];

  $scope.show_graph = false;
  $scope.selectedIndex = 1;

  $scope.x_location = -1;
  $scope.x_axis = -1;
  $scope.y_location = -1;
  $scope.y_axis = 0;

  $scope.sliderNum;
  $scope.graph_type;
  $scope.total_data = {};

  $scope.graph_structure = {};
  $scope.output_selection = $scope.graph_data[0].length;
  $scope.refreshed_data = true;

  function reloadData (cb)
  {

  $scope.graph_structure = {};

    $scope.graph_data.map(function (item)
    {
      if ($scope.graph_structure[item.length])
      {
        $scope.graph_structure[item.length].push(item);
      }
      else
      {
        $scope.graph_structure[item.length] = [item];
      }
    });

    /*
    * Set number of outputs to saved setting
    * if it is greater than 0 and less than
    * the number of outputs, else set to
    * number of outputs
    */
    $scope.slider_max = $scope.graph_structure[$scope.output_selection].length;
    $scope.sliderNum = (Number($scope.slider_max) >= Number(script.numOutput) && Number(script.numOutput) > 0) ? script.numOutput : $scope.slider_max;
    $scope.graph_type = (script.bar ? "Bar" : script.line ? "Line" : script.radar ? "Radar" : "Bar");


    if ($scope.refreshed_data)
    {
      $scope.graph_layout = [];
      $scope.indexs = [];

      $scope.graph_structure[$scope.output_selection][0].forEach(function (item, i)
      {
        $scope.graph_layout.push(i);
        $scope.indexs.push({value: i, disabled: false});

        if (i + 1 >= $scope.graph_structure[$scope.output_selection][0].length)
        {
          if (cb)
          {
            cb();
          }
        }
      });

      $scope.refreshed_data = false;
    }


  };

  var myNewChart;
  var ctx;

  $scope.setX = function (x_axis)
  {
    if (x_axis === -1)
    {
      $scope.graph_layout[$scope.x_axis] = $scope.x_axis;
      $scope.x_axis = x_axis;
      $scope.x_location = x_axis;
    }
    else
    {
      $scope.graph_layout[$scope.x_axis] = $scope.x_axis;
      $scope.x_axis = x_axis;
      $scope.indexs.map(function (item, i)
      {
        if (Number(item.value) === Number($scope.x_axis))
        {
          //item.disabled = true;
          $scope.graph_layout[i] = "X";
          $scope.x_location = i;

          if ($scope.y_location >= 0)
          {
            $scope.show_graph = true;
          }
        }
      });

      if (x_axis === $scope.y_axis)
      {
        $scope.y_axis = -1;
        $scope.y_location = -1;
        $scope.show_graph = false;
      }
    }
  };

  $scope.graphToString = function ()
  {
    return $scope.graph_layout.toString();
  };

  $scope.setY = function (y_axis)
  {
    $scope.graph_layout[$scope.y_axis] = $scope.y_axis;
    $scope.y_axis = y_axis;
    $scope.indexs.map(function (item, i)
    {
      if (Number(item.value) === Number($scope.y_axis))
      {
        $scope.graph_layout[i] = "Y";
        $scope.y_location = i;

        if ($scope.y_location >= 0)
        {
          $scope.show_graph = true;
        }
      }
    });

    if (y_axis === $scope.x_axis)
    {
      $scope.x_axis = -1;
      $scope.x_location = -1;
    }
  };


  $scope.showGraph = function(graph_type)
  {
    if ($scope.y_location != -1)
    {
      if (graph_type)
      {
        $scope.graph_type = graph_type;
      }

      if (myNewChart) {
        myNewChart.destroy();
      }

      var x_data = [];
      var y_data = [];

      $scope.graph_structure[$scope.output_selection].forEach(function (item, i)
      {
        if ($scope.x_location >= 0)
        {
          x_data.push(item[$scope.x_location]);
        } else {
          x_data.push(i);
        }

        y_data.push(item[$scope.y_location]);

      });


      $scope.total_data = {
        labels: x_data.slice(0, $scope.sliderNum),
        datasets: [{
          labels: x_data.slice(0, $scope.sliderNum),

          // Blue
          fillColor: "rgba(33,150,243,0.3)",
          strokeColor: "rgba(33,150,243,1)",
          pointColor: "rgba(33,150,243,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(33,150,243,1)",

          // Grey
          /*fillColor: "rgba(182,182,182,0.4)",
          strokeColor: "rgba(182,182,182,1)",
          pointColor: "rgba(182,182,182,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(182,182,182,1)",*/

          // Orange
          /*fillColor: "rgba(255,87,34,0.3)",
          strokeColor: "rgba(255,87,34,1)",
          pointColor: "rgba(255,87,34,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(255,87,34,1)",*/

          data: y_data.slice(0, $scope.sliderNum)
        }]
      };

      var container = document.getElementById("myChart");
      if (container)
      {
        ctx = container.getContext("2d");
        myNewChart = new Chart(ctx)[$scope.graph_type]($scope.total_data);
        myNewChart.resize();
      }
    }

  };

  // wait for data before calling graph
  $timeout(function ()
  {
    $scope.showGraph();
  }, 200);

  $scope.$watch("sliderNum", function ()
  {
    $scope.showGraph();
  });

  $scope.$watch("graph_data", function ()
  {
    reloadData();
  }, true);

  $scope.$watch("output_selection", function ()
  {
    $scope.refreshed_data = true;
    reloadData(function ()
    {
      $scope.setY($scope.indexs[0].value);
      $scope.showGraph();
    });
  });


  $scope.cancel = function()
  {
    $mdDialog.cancel();
  };

  reloadData(function ()
  {
    $scope.setY($scope.indexs[0].value);
  });
};



// Controller for Info Modal
function InfoController(
    $mdDialog,
    $scope,
    script_name,
    info_outputs,
    outputs,
    logs,
    warnings,
    errors,
    filter_type,
    graph_data,
    openGraphInfo,
    script_index)
{
  $scope.script_name = script_name;
  $scope.info_outputs = info_outputs;
  $scope.outputs = outputs;
  $scope.logs = logs;
  $scope.warnings = warnings;
  $scope.errors = errors;
  $scope.filter_type = filter_type || "all";

  $scope.graph_data = graph_data;
  $scope.openGraphInfo = openGraphInfo;
  $scope.script_index = script_index;

  $scope.filteredInfo = function ()
  {
    return $scope.info_outputs.filter(function (info)
    {
      if ($scope.filter_type === "all")
      {
        return true;
      } else
      {
        return info.type === $scope.filter_type;
      }
    });
  };

  $scope.filterByAll = function ()
  {
    $scope.filter_type = "all";
  };

  $scope.filterByOutput = function ()
  {
    $scope.filter_type = "output";
  };

  $scope.filterByLog = function ()
  {
    $scope.filter_type = "log";
  };

  $scope.filterByWarning = function ()
  {
    $scope.filter_type = "warning";
  };

  $scope.filterByError = function ()
  {
    $scope.filter_type = "error";
  };

  $scope.cancel = function()
  {
    $mdDialog.cancel();
  };
};
