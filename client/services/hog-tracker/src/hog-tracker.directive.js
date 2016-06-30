/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


/**
 */

'use strict';

angular.module("hog.hog-tracker", [])
  .directive("hogTracker", function ($mdToast)
  {
    return {
      restraints: "AE",
      scope:
      {
        taskString: "=",
        trackerId: "="
      },
      template: "<div layout='column' ng-show='has_data' flex>"
        + "    <div id='{{ trackerId }}' layout='column' flex='grow'></div>"
        + "    <md-progress-linear ng-if='progress_status <= 100' md-mode='determinate' value='{{ progress_status }}'></md-progress-linear>"
        + "    <md-table-container>"
        + "        <table md-table md-row-select multiple ng-model='selected'>"
        + "            <thead md-head>"
        + "                <tr md-row>"
        + "                    <th md-column><span>Name</span></th>"
        + "                    <th md-column><span>Status</span></th>"
        + "                    <th md-column><span>Description</span></th>"
        + "                </tr>"
        + "            </thead>"
        + "            <tbody md-body>"
        + "                <tr md-row ng-repeat='task in taskList' style='background:{{ color_status[task.status] }}'>"
        + "                    <td md-cell>{{ task.name }}</td>"
        + "                    <td md-cell>{{ task.status }}</td>"
        + "                    <td md-cell>{{ task.description }}</td>"
        + "                </tr>"
        + "            </tbody>"
        + "        </table>"
        + "    </md-table-container>"
        + "</div>",
      link: function ($scope, element, attrs)
      {

        $scope.selected = [];
        $scope.progress_status = 0;
        $scope.has_data = false;
        $scope.finished_running = false;
        $scope.finished_init = false;

        $scope.color_status = {
          "RUNNING": "rgba(76,175,80,1)",
          //"RUNNING": "rgba(0,0,0,1)",
          "FINISHED": "rgba(200,200,200,1)",
          "FAILED": "rgba(211,47,47,1)",
          "pending": "rgba(255,255,255,1)"
        };

        $scope.width = element[0].clientWidth;
        $scope.height = element[0].clientHeight;

        if ($scope.width > 1280)
        {
          $scope.width = 1280;
        }
        else if ($scope.width > 960)
        {
          $scope.width = 960;
        }
        else if ($scope.width > 600)
        {
          $scope.width = 600;
        }
        else
        {
          $scope.width = 500;
        }

        $scope.height = 400;

        function init_tree()
        {

          var ltt = new LTT($scope.taskList,
          {
            key_id: "id",
            key_parent: "parent",
            key_child: "children"
          });

          $scope.my_tree = ltt.GetTree();

          updateProgress();

          $scope.margin = {
            top: 20,
            right: 120,
            bottom: 20,
            left: 120
          };
          $scope.width = $scope.width - $scope.margin.right - $scope.margin.left;
          $scope.height = $scope.height - $scope.margin.top - $scope.margin.bottom;

          $scope.tree = d3.layout.tree()
            .size([$scope.height, $scope.width]);


          $scope.diagonal = d3.svg.diagonal()
            .projection(function (d)
            {
              return [d.y, d.x];
            });

          $scope.svg = d3.select("#" + $scope.trackerId)
            .append("svg")
            .attr("width", $scope.width + $scope.margin.right + $scope.margin.left)
            .attr("height", $scope.height + $scope.margin.top + $scope.margin.bottom)
            .attr("id", $scope.trackerId)
            .append("g")
            .attr("transform", "translate(" + $scope.margin.left + "," + $scope.margin.top + ")");

          var root = $scope.my_tree[0];
          root.x0 = $scope.height / 2;
          root.y0 = 0;


          function collapse(d)
          {
            if (d.children)
            {
              d._children = d.children;
              d._children.forEach(collapse);
              d.children = null;
            }
          }
          $scope.update(root);
          $scope.finished_init = true;
        }

        $scope.$watch("taskString", function ()
        {
          $scope.taskList = JSON.parse($scope.taskString);
        });


        $scope.$watch("trackerId", function ()
        {
          if ($scope.taskList.length > 0)
          {
            init_tree();
          }
        });

        $scope.$watch("taskList", function (newD, oldD)
        {
          if ($scope.taskList.length > 0 && $scope.finished_init) {
            $scope.has_data = true;

            updateProgress();

            var ltt = new LTT($scope.taskList,
            {
              key_id: "id",
              key_parent: "parent",
              key_child: "children"
            });
            $scope.my_tree = ltt.GetTree();
            $scope.update($scope.my_tree[0]);
          } else if ($scope.taskList.length > 0) {
            $scope.has_data = false;
            init_tree();
          }


        });

        function updateProgress()
        {
          if ($scope.taskList)
          {
            var progress = 0;
            $scope.taskList.filter(function (item)
            {
              if (item.status == "FINISHED")
              {
                progress += 100;
              }
              else if (item.status == "RUNNING")
              {
                progress += Number(item.percentage);
              }
            });

            $scope.progress_status = (progress / $scope.taskList.length).toFixed(2);

            if ($scope.progress_status >= 100 && !$scope.finished_running)
            {
              $scope.finished_running = true;
              $mdToast.show(
                $mdToast.simple()
                .parent(element)
                .position("top right")
                .content('Tasks Complete!')
              );
            }
          }

        };


        $scope.update = function (source)
          {

            var i = 0;
            var duration = 1500;

            var root = $scope.my_tree[0];
            root.x0 = $scope.height / 2;
            root.y0 = 0;

            // Compute the new tree layout.
            var nodes = $scope.tree.nodes(root).reverse(),
              links = $scope.tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function (d)
            {
              d.y = d.depth * 180;
            });

            // Update the nodes…
            var node = $scope.svg.selectAll("g.node")
              .data(nodes, function (d)
              {
                return d.id || (d.id = ++i);
              });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", function (d)
              {
                return "translate(" + source.y0 + "," + source.x0 + ")";
              });
              //.on("click", click);

            nodeEnter.append("circle")
              .attr("r", 12)
              .style("fill", function (d)
              {
                return d.status ? $scope.color_status[d.status] : "#fff";
              });
            //.attr("class", function(d) { return d.status ? "md-primary" : "test"; });

            nodeEnter.append("text")
              .attr("x", function (d)
              {
                return d.children || d._children ? -10 : 10;
              })
              .attr("dy", ".35em")
              .attr("text-anchor", function (d)
              {
                return d.children || d._children ? "end" : "start";
              })
              .text(function (d)
              {
                return d.name;
              })
              .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function (d)
              {
                return "translate(" + d.y + "," + d.x + ")";
              });

            nodeUpdate.select("circle")
              .attr("r", 12)
              .style("fill", function (d)
              {
                return d.status ? $scope.color_status[d.status] : "#fff";
              });
            //.attr("class", function(d) { return d.status ? "md-primary" : "test"; });

            nodeUpdate.select("text")
              .attr("x", function (d)
              {
                return d.children || d._children ? -10 : 10;
              })
              .attr("dy", ".35em")
              .attr("text-anchor", function (d)
              {
                return d.children || d._children ? "end" : "start";
              })
              .text(function (d)
              {
                return d.name;
              })
              .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function (d)
              {
                return "translate(" + source.y + "," + source.x + ")";
              })
              .remove();

            nodeExit.select("circle")
              .attr("r", 12);

            nodeExit.select("text")
              .style("fill-opacity", 1e-6);

            // Update the links…
            var link = $scope.svg.selectAll("path.link")
              .data(links, function (d)
              {
                return d.target.id;
              });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", function (d)
              {
                var o = {
                  x: source.x0,
                  y: source.y0
                };
                return $scope.diagonal(
                {
                  source: o,
                  target: o
                });
              });

            // Transition links to their new position.
            link.transition()
              .duration(duration)
              .attr("d", $scope.diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
              .duration(duration)
              .attr("d", function (d)
              {
                var o = {
                  x: source.x,
                  y: source.y
                };
                return $scope.diagonal(
                {
                  source: o,
                  target: o
                });
              })
              .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d)
            {
              d.x0 = d.x;
              d.y0 = d.y;
            });

          } // end update

        // Toggle children on click.
        function click(d)
        {
          if (d.children)
          {
            d._children = d.children;
            d.children = null;
          }
          else
          {
            d.children = d._children;
            d._children = null;
          }
          $scope.update(d);
        }

      }
    }
  });
