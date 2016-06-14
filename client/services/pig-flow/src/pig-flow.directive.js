/**
 */

'use strict';

angular.module("pig.pig-flow", [])
  .directive("pigFlow", function ($mdDialog, $mdSidenav, pigFlowTemplate, nodeTemplates, nodeTypes, FlowToScript)
  {
    return {
      restraints: "AE",
      scope:
      {
        inputDataString: "=",
        inputData: "=",
        outputData: "=",
        id: "@"
      },
      template: pigFlowTemplate,
      link: function ($scope, element, attrs)
      {
        var vm = $scope;

        vm.data = {};
        vm.links = [];
        vm.nodes = [];
        vm.source_node;
        vm.target_node;
        vm.types = nodeTypes;
        vm.type_list = Object.keys(vm.types);
        vm.output_script = "";


        var zoom = d3.behavior.zoom()
          .scaleExtent([.5, 10])
          .on("zoom", zoomed);

        d3.selection.prototype.moveToFront = function ()
        {
          return this.each(function ()
          {
            this.parentNode.appendChild(this);
          });
        };

        function moveToBack(d)
        {
          return this.each(function ()
          {
            var thirdChild = this.parentNode.childNodes[2];
            if (thirdChild)
            {
              this.parentNode.insertBefore(this, thirdChild);
            }
          });
        };

        vm.width = element[0].clientWidth;
        vm.height = window.innerHeight - window.innerHeight * 0.15;

        vm.$watch(element[0], function ()
        {
          vm.width = element[0].clientWidth;

          var container_width = vm.width * 5;
          var container_height = vm.height * 5;


          vm.svg = d3.select("#" + vm.id)
            .append("svg")
            .attr("width", vm.width)
            .attr("height", vm.height)
            .attr("class", "pig-flow")
            .append("g")
            .attr("transform", "translate(" + -5 + "," + -5 + ")")
            .call(zoom)
            .on("dblclick.zoom", null)
            .on("dblclick", addNode);

          vm.rect = vm.svg.append("rect")
            .attr("width", vm.width)
            .attr("height", vm.height)
            .style("fill", "none")
            .style("pointer-events", "visibleFill");


          vm.container = vm.svg.append("g");

          // background x axis
          vm.container.append("g")
            .attr("class", "x axis")
            .selectAll("line")
            .data(d3.range(0 - (container_width / 2), container_width, 10))
            .enter().append("line")
            .attr("x1", function (d)
            {
              return d;
            })
            .attr("y1", 0 - (container_height / 2))
            .attr("x2", function (d)
            {
              return d;
            })
            .attr("y2", container_height);

          // background y axis
          vm.container.append("g")
            .attr("class", "y axis")
            .selectAll("line")
            .data(d3.range(0 - (container_height / 2), container_height, 10))
            .enter().append("line")
            .attr("x1", 0 - (container_width / 2))
            .attr("y1", function (d)
            {
              return d;
            })
            .attr("x2", container_width)
            .attr("y2", function (d)
            {
              return d;
            });

          vm.force = d3.layout.force()
            .size([vm.width, vm.height])
            .linkStrength(0.01)
            .friction(0.9)
            .linkDistance(250)
            .charge(-5000)
            .gravity(0.1)
            .theta(0.8)
            .alpha(0.1)
            .on("tick", tick);

          vm.drag = vm.force.drag()
            .on("dragstart", dragstart)
            .on("dragend", dragended);

          vm.link = vm.container.selectAll(".flow_link");
          vm.node = vm.container.selectAll(".node");
          vm.node_close = vm.container.selectAll(".node_close");
          vm.node_edit = vm.container.selectAll(".node_edit");
          vm.node_input = vm.container.selectAll(".node_input");
          vm.node_inputs = vm.container.selectAll(".node_inputs");
          vm.node_output = vm.container.selectAll(".node_output");
          vm.node_outputs = vm.container.selectAll(".node_outputs");
          vm.node_body = vm.container.selectAll(".node_body");
          vm.node_header = vm.container.selectAll(".node_header");
          vm.node_name_label = vm.container.selectAll(".node_name_label");
          vm.node_type_label = vm.container.selectAll(".node_type_label");

          vm.force
            .nodes(vm.nodes)
            .links(vm.links)

        });

        vm.start = function ()
        {

          // add lines
          vm.link = vm.link
            .data(vm.links);
          vm.link.enter()
            .append("line")
            .attr("class", "flow_link")
            .on("dblclick", function (d)
            {
              d3.event.stopPropagation();
              removeLink(d);
              vm.start();
            })
            .call(moveToBack);
          vm.link
            .on("mouseover", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "pointer");
            })
            .on("mouseleave", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "none");
            });
          vm.link.exit()
            .remove();

          // add node
          vm.node = vm.node
            .data(vm.nodes);
          vm.node.enter()
            .append("g");
          vm.node.exit()
            .remove();

          // add node body
          vm.node_body = vm.node_body
            .data(vm.nodes);
          vm.node_body
            .append("rect")
            .attr("class", "node_body")
            .attr("width", function (d)
            {
              return d.width;
            })
            .attr("height", function (d)
            {
              return d.height;
            });
          vm.node_body.enter()
            .append("rect")
            .attr("class", "node_body")
            .attr("width", function (d)
            {
              return d.width;
            })
            .attr("height", function (d)
            {
              return d.height;
            });
          vm.node_body.exit()
            .remove();

          // add node header
          vm.node_header = vm.node_header
            .data(vm.nodes);
          vm.node_header
            .append("rect")
            .attr("class", "node_header")
            .attr("width", function (d)
            {
              return d.width;
            })
            .attr("height", function (d)
            {
              return 40;
            })
          vm.node_header.enter()
            .append("rect")
            .attr("class", "node_header")
            .attr("width", function (d)
            {
              return d.width;
            })
            .attr("height", function (d)
            {
              return 40;
            })
          vm.node_header
            .on("mouseover", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "move");
            })
            .on("mouseleave", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "none");
            });
          vm.node_header
            .call(vm.drag);
          vm.node_header.exit()
            .remove();

          // close button
          vm.node_close = vm.node_close
            .data(vm.nodes);
          vm.node_close
            .append('text')
            .attr('font-family', 'FontAwesome')
            .attr('font-size', 35 )
            .text('\uf00d')
            .attr("class", "node_close")
            .attr("fill", "red")
            .attr("widht", 35)
            .attr("height", 35);
          vm.node_close.enter()
            .append('text')
            .attr('font-family', 'FontAwesome')
            .attr('font-size', 35 )
            .text('\uf00d')
            .attr("class", "node_close")
            .attr("fill", "red")
            .attr("widht", 35)
            .attr("height", 35);
          vm.node_close
            .on("mouseover", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "pointer");
            })
            .on("mouseleave", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "none");
            });
          vm.node_close
            .on("click", function (d)
            {
              d3.event.stopPropagation();
              removeNode(d);
            });
          vm.node_close.exit()
            .remove();


          // edit button
          vm.node_edit = vm.node_edit
            .data(vm.nodes);
          vm.node_edit
            .append('text')
            .attr('font-family', 'FontAwesome')
            .attr('font-size', 35 )
            .text('\uf040')
            .attr("class", "node_edit")
            .attr("widht", 35)
            .attr("height", 35);
          vm.node_edit.enter()
            .append('text')
            .attr('font-family', 'FontAwesome')
            .attr('font-size', 35 )
            .text('\uf040')
            .attr("class", "node_edit")
            .attr("widht", 35)
            .attr("height", 35);
          vm.node_edit
            .on("mouseover", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "pointer");
            })
            .on("mouseleave", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "none");
            });
          vm.node_edit
            .on("click", function (d)
            {
              d3.event.stopPropagation();
              editNode(d, true);
            });
          vm.node_edit.exit()
            .remove();


          // ====================================================
          // input button
          vm.node_inputs = vm.node_inputs
            .data(function (d)
            {
              var input_list = [];
              vm.nodes.map(function (n,j)
              {
                if (n.inputs)
                {
                  n.inputs.map(function (input, i)
                  {
                    var middle = (n.x + n.width * 0.5);
                    var offset = middle - ((n.inputs.length - 1) * 25) * 0.5;
                    var tmp_obj = {
                      data: input,
                      p: n,
                      x: offset + i * 25,
                      y: n.y,
                      index: i,
                      length: n.inputs.length
                    };
                    input_list.push(tmp_obj);
                  });
                }
              });
              return input_list;
            });
          vm.node_inputs
            .attr("r", 10)
            .attr("class", "node_inputs")
            .attr("cx", function (d, i)
            {
              return d.x
            })
            .attr("cy", function (d, i)
            {
              return d.y;
            });
          vm.node_inputs.enter()
            .append("circle")
            .attr("r", 10)
            .attr("class", "node_inputs")
            .attr("cx", function (d, i)
            {
              return d.x
            })
            .attr("cy", function (d, i)
            {
              return d.y;
            });
          vm.node_inputs
            .on("mouseover", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "pointer");
            })
            .on("mouseleave", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "none");
            });
          vm.node_inputs
            .on("click", function (d)
            {
              d3.event.stopPropagation();
              endConnection(d.p, d, this);
            });
          vm.node_inputs.exit()
            .remove();
          vm.node_outputs = vm.node_outputs
            .data(function (d)
            {
              var output_list = [];
              vm.nodes.map(function (n,j)
              {
                if (n.outputs)
                {
                  n.outputs.map(function (output, i)
                  {
                    var middle = (n.x + n.width * 0.5);
                    var offset = middle - ((n.outputs.length - 1) * 25) * 0.5;
                    var tmp_obj = {
                      data: output,
                      p: n,
                      x: offset + i * 25,
                      y: n.y + n.height,
                      index: i,
                      length: n.outputs.length
                    };
                    output_list.push(tmp_obj);
                  });
                }
              });
              return output_list;
            });
          vm.node_outputs
            .attr("r", 10)
            .attr("class", "node_outputs")
            .attr("cx", function (d, i)
            {
              return d.x;
            })
            .attr("cy", function (d, i)
            {
              return d.y;
            });
          vm.node_outputs.enter()
            .append("circle")
            .attr("r", 10)
            .attr("class", "node_outputs")
            .attr("cx", function (d, i)
            {
              return d.x;
            })
            .attr("cy", function (d, i)
            {
              return d.y;
            });
          vm.node_outputs
            .on("mouseover", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "pointer");
            })
            .on("mouseleave", function (d)
            {
              d3.event.stopPropagation();
              d3.select(this)
                .style("cursor", "none");
            });
          vm.node_outputs
            .on("click", function (d)
            {
              d3.event.stopPropagation();
              startConnection(d.p, d, this);
            });
          vm.node_outputs.exit()
            .remove();

          // add type label to node
          vm.node_type_label = vm.node_type_label
            .data(vm.nodes);
          vm.node_type_label
            .text(function (d)
            {
              return d.type;
            })
            .attr("x", function (d)
            {
              return d.width * 1.5
            })
            .attr("y", function (d)
            {
              return d.height * 1.5
            })
            .style("pointer-events", "none");
          vm.node_type_label.enter()
            .append("text")
            .attr("class", "node_type_label")
            .text(function (d)
            {
              return d.type;
            })
            .attr("x", function (d)
            {
              return d.width * 1.5
            })
            .attr("y", function (d)
            {
              return d.height * 1.5
            })
            .style("pointer-events", "none");
          vm.node_type_label.exit()
            .remove();

          // add type label to node
          vm.node_name_label = vm.node_name_label
            .data(vm.nodes);
          vm.node_name_label
            .text(function (d)
            {
              return d.name;
            })
            .attr("x", function (d)
            {
              return d.width * 1.5
            })
            .attr("y", function (d)
            {
              return d.height * 1.5
            })
            .style("pointer-events", "none");
          vm.node_name_label.enter()
            .append("text")
            .attr("class", "node_name_label")
            .text(function (d)
            {
              return d.name;
            })
            .attr("x", function (d)
            {
              return d.width * 1.5
            })
            .attr("y", function (d)
            {
              return d.height * 1.5
            })
            .style("pointer-events", "none");
          vm.node_name_label.exit()
            .remove();

          vm.force.start();
          vm.updateScript();
        };


        vm.$watch("inputDataString", function ()
        {
          vm.tmp_data = JSON.parse(vm.inputDataString);

          angular.copy(vm.tmp_data.nodes, vm.nodes);
          vm.tmp_data.links.map(function (d)
          {
            vm.links.push({
              source: d.source.index,
              target: d.target.index,
              x1: d.x1,
              y1: d.y1,
              x2: d.x2,
              y2: d.y2
            });
          });
          vm.output_script = vm.tmp_data.script || "";

          if (vm.tmp_data)
          {
            vm.has_data = true;
            vm.start();
          }

        });


        function tick()
        {

          // line
          vm.link
            .attr("x1", function (d)
            {
              //return d.source.x + d.source.width * 0.5;
              return d.source.x + d.x1;
            })
            .attr("y1", function (d)
            {
              //return d.source.y + d.source.height;
              return d.source.y + d.y1;
            })
            .attr("x2", function (d)
            {
              //return d.target.x + d.target.width * 0.5;
              return d.target.x + d.x2;
            })
            .attr("y2", function (d)
            {
              //return d.target.y;
              return d.target.y + d.y2;
            });

          vm.node
            .attr("x", function (d)
            {
              return d.x;
            })
            .attr("y", function (d)
            {
              return d.y;
            });

          vm.node_body
            .attr("width", function (d)
            {
              return d.width;
            })
            .attr("height", function (d)
            {
              return d.height;
            })
            .attr("x", function (d)
            {
              return d.x;
            })
            .attr("y", function (d)
            {
              return d.y;
            });

          vm.node_header
            .attr("width", function (d)
            {
              return d.width;
            })
            .attr("height", function (d)
            {
              return 40;
            })
            .attr("x", function (d)
            {
              return d.x;
            })
            .attr("y", function (d)
            {
              return d.y;
            });

          vm.node_close
            .attr("x", function (d)
            {
              var tw = Math.round(this.getBBox().width);
              return d.x;
            })
            .attr("y", function (d)
            {
              var th = Math.round(this.getBBox().height);
              var mh = 40;
              return d.y + (th - 5);
            });

          vm.node_edit
            .attr("x", function (d)
            {
              var tw = Math.round(this.getBBox().width);
              var mw = d.width;
              return d.x + (mw - tw - 5);
            })
            .attr("y", function (d)
            {
              var th = Math.round(this.getBBox().height);
              var mh = 40;
              return d.y + (th - 5);
            });

          vm.node_inputs
            .attr("r", 10)
            .attr("class", "node_inputs")
            .attr("cx", function (d, i)
            {
              var middle = (d.p.x + d.p.width * 0.5);
              var offset = middle - ((d.length - 1) * 25) * 0.5;
              d.x = offset + d.index * 25;
              return d.x;
            })
            .attr("cy", function (d, i)
            {
              d.y = d.p.y;
              return d.y;
            });

          vm.node_outputs
            .attr("r", 10)
            .attr("class", "node_outputs")
            .attr("cx", function (d, i)
            {
              var middle = (d.p.x + d.p.width * 0.5);
              var offset = middle - ((d.length - 1) * 25) * 0.5;
              d.x = offset + d.index * 25;
              return d.x;
            })
            .attr("cy", function (d, i)
            {
              d.y = d.p.y + d.p.height;
              return d.y;
            });

          vm.node_name_label
            .attr("x", function (d)
            {
              var tw = Math.round(this.getBBox().width);
              var mw = d.width * 0.5;
              return d.x + (mw - tw * 0.5);
            })
            .attr("y", function (d)
            {
              var th = Math.round(this.getBBox().height);
              var mh = 20;
              return d.y + (mh + th * 0.5);

            })
          vm.node_type_label
            .attr("x", function (d)
            {
              var tw = Math.round(this.getBBox().width);
              var mw = d.width * 0.5;
              return d.x + (mw - tw * 0.5);
            })
            .attr("y", function (d)
            {
              var th = Math.round(this.getBBox().height);
              var mh = (d.height - 40);
              return d.y + (mh + th * 0.5);
            })

        }

        function zoomed()
        {
          vm.translate = d3.event.translate;
          vm.scale = d3.event.scale;

          vm.container.attr("transform", "translate(" + vm.translate + ")scale(" + vm.scale + ")");
        };

        function startConnection(d, t, n)
        {
          if (d)
          {
            if (vm.source_node)
            {
              d3.select(vm.source_node.node)
                .style("fill", "rgba(50, 255, 50, 1.0)");
            }
            vm.source_node = {
              data: d,
              node: n,
              output_data: t.data,
              x: t.x - d.x,
              y: t.y - d.y
            };
            d3.select(vm.source_node.node)
              .style("fill", "black");

            vm.start();
          }
        };

        function endConnection(d, t, n)
        {
          if (d)
          {
            if (vm.source_node && vm.source_node.data.index != d.index)
            {
              // check that it is the right type
              if (t.data.type == vm.source_node.data.type ||
                  t.data.category == vm.source_node.data.category ||
                  (!t.data.category && !t.data.type))
              {
                t.data.value = vm.source_node.data.output;

                vm.target_node = {
                  data: d,
                  node: n,
                  input_data: t.data,
                  x: t.x - d.x,
                  y: t.y - d.y
                };

                // add output node link
                vm.source_node.data.output_node = vm.target_node.data.index;
                // add input node link
                vm.target_node.data.input_node = vm.source_node.data.index;
                vm.target_node.data.input = vm.source_node.data.output;

                vm.links.push(
                {
                  source: vm.source_node.data.index,
                  target: vm.target_node.data.index,
                  output_data: vm.source_node.output_data,
                  input_data: vm.target_node.input_data,
                  x1: vm.source_node.x,
                  y1: vm.source_node.y,
                  x2: vm.target_node.x,
                  y2: vm.target_node.y
                });

                d3.select(vm.source_node.node)
                  .style("fill", "rgba(50, 255, 50, 1.0)");

                vm.source_node = "";
                vm.target_node = "";
                vm.start();
              }
            }
          }
        };

        function dragstart(d)
        {
          d3.event.sourceEvent.stopPropagation();
          d3.select(this).classed("dragging", true);
        }

        function dragended(d)
        {
          d3.select(this).classed("dragging", false);
          start_update();
        }

        function removeNode(d)
        {
          vm.nodes.splice(d.index, 1);
          removeLinks(d);
          vm.start();
        };

        function editNode(d, info)
        {
          function reloadDialog(reload)
          {
            $mdDialog.show(
              {
                scope: vm,
                preserveScope: true,
                clickOutsideToClose: false,
                template: nodeTemplates[d.type] || nodeTemplates["basic"],
                locals:
                {
                  data: d,
                  old_scope: vm,
                  templates: nodeTemplates,
                  info: info
                },
                controller: function DialogController($scope, $mdDialog, data, old_scope, templates, info)
                {
                  var vm = $scope;
                  vm.node_info = data;

                  vm.loadData = function ()
                  {
                    vm.types = Object.assign(
                    {}, old_scope.types);
                    vm.type = vm.node_info.type;

                    vm.category = vm.node_info.category;
                    vm.categorys = Object.keys(vm.types);

                    vm.tmp_param = [];
                    angular.copy(vm.node_info.params, vm.tmp_param);

                    vm.params = [];
                    vm.types[vm.category].map(function (t)
                    {
                      if (t.name === vm.type)
                      {
                        angular.copy(t.params, vm.params);
                        vm.script = t.script;
                        vm.description = t.description;
                        //vm.params = angular.copy(t.params, vm.params);
                      }
                    });

                    vm.params.map(function (p, i)
                    {
                      if (vm.tmp_param[i])
                      {
                        p.value = vm.tmp_param[i].value || p.value;
                      }
                    });

                    vm.tmp_node = {
                      name: vm.node_info.name,
                      category: vm.node_info.category,
                      description: vm.description,
                      type: vm.node_info.type,
                      params: vm.params,
                      script: vm.script
                    };
                  }
                  vm.loadData();

                  vm.saveAndClose = function ()
                  {
                    vm.save();
                    $mdDialog.hide({reload: false, data: vm.node_info});
                  };

                  vm.save = function (type)
                  {
                    if (type && type !== vm.node_info.type)
                    {
                      vm.node_info.name = vm.tmp_node.name;
                      vm.node_info.category = vm.category;
                      vm.node_info.type = vm.type;
                      vm.node_info.params = vm.params.splice(0);
                      vm.node_info.script = vm.script;

                      var added_width = Math.max(vm.node_info.inputs.length, vm.node_info.outputs.length) * 30;
                      vm.node_info.width += added_width;

                      vm.start();
                      vm.close(true);
                    }
                    else if (!type)
                    {
                      vm.node_info.name = vm.tmp_node.name;
                      vm.node_info.category = vm.category;
                      vm.node_info.type = vm.type;
                      vm.node_info.params = vm.params.splice(0);
                      vm.node_info.script = vm.script;

                      var added_width = Math.max(vm.node_info.inputs.length, vm.node_info.outputs.length) * 30;
                      vm.node_info.width += added_width;

                      vm.start();
                    }
                  };

                  vm.close = function (r)
                  {
                    $mdDialog.hide({reload: true, data: r} || {reload: false, data: vm.node_info});
                  };


                  vm.cancel = function ()
                  {
                    $mdDialog.hide({reload: false, data: data, cancel: true, info: info || false});
                  }
                }
              })
              .then(function (d)
              {
                if (d.reload === true)
                {
                  reloadDialog();
                } else if (d.reload === false && d.cancel)
                {
                  if (!d.info)
                  {
                    removeNode(d.data);
                  }
                }
              });
          }
          reloadDialog();
        };

        function removeLinks(d)
        {
          var newLinks = vm.links.filter(function (obj)
          {
            return obj.source === d || obj.target === d;
          });

          newLinks.map(function (l)
          {
            vm.links.splice(vm.links.indexOf(l), 1);
          });
        };

        function removeLink(d)
        {
          var newLinks = vm.links.filter(function (obj)
          {
            return obj.source === d.source && obj.target === d.target;
          });

          newLinks.map(function (l)
          {
            // remove output node link
            delete l.source.output_node;

            // remove input node link
            delete l.target.input_node;
            vm.links.splice(vm.links.indexOf(l), 1);
          });
        };

        function addNode()
        {
          var pos = d3.mouse(this);

          var trans = d3.transform(vm.container.attr("transform"));
          var tpos = trans.translate;
          var tscale = trans.scale;
          var tx = tpos[0];
          var ty = tpos[1];
          var mx = pos[0];
          var my = pos[1];

          // get position with translation and scaling
          var dx = (mx - tx) / tscale[0] - 150;
          var dy = (my - ty) / tscale[1] - 62;

          var newNode = {
            x: dx,
            y: dy,
            width: 300,
            height: 124,
            name: "new node " + vm.nodes.length,
            category: "input",
            type: "load",
            params: vm.types["input"][0].params.slice(),
            script: vm.types["input"][0].script,
            output: "load" + (vm.nodes.length) || "load0",
            fixed: true
          };
          vm.nodes.push(newNode);

          vm.start();

          editNode(newNode);
        };

        function start_update()
        {
          vm.outputData = {
            nodes: vm.nodes,
            links: vm.links,
            script: vm.output_script
          };
          setTimeout(function()
          {
            $scope.$apply();
          });
        };

        vm.updateScript = function()
        {

          vm.output_script = "";
          var i = 0;

          var fts = new FlowToScript(vm.nodes, vm.links);
          fts.start(function (d)
          {
            vm.output_script = d;
            start_update();
          });
        };

        function doIt(node, i, visitedNodes, cb)
        {
          if (node)
          {
            if (!visitedNodes[node.index])
            {
              var script_obj = node.script || {};
              var script = script_obj.content || "";

              node.outputs.map(function (output, i)
              {
                var re = new RegExp("<output_" + output.label + ">", "g");
                script = script.replace(re, node.output);
              });

              node.inputs.map(function (input, i)
              {
                var re = new RegExp("<input_" + input.label + ">", "g");
                script = script.replace(re, input.value);
              });


              script_obj.variables.map(function (v,i)
              {
                if (v)
                {
                  var re = new RegExp("<"+v+">","g");
                  script = script.replace(re, node.params[i].value);
                }
              });

              node.script.output = script;

              visitedNodes[node.index] = i;
              vm.output_script = script + "\n" + vm.output_script;
              doIt(vm.nodes[node.input_node] || false, i + 1, visitedNodes, cb);
            }
          } else
          {
            cb();
          }
        };


        vm.addNode = function (c, t)
        {
          vm.toggleNodeList();

          //addNode();
          var trans = d3.transform(vm.container.attr("transform"));
          var tpos = trans.translate;
          var tscale = trans.scale;
          var tx = tpos[0];
          var ty = tpos[1];
          var mx = vm.width / 2;
          var my = vm.height / 2;

          // get position with translation and scaling
          var dx = (mx - tx) / tscale[0] - 150;
          var dy = (my - ty) / tscale[1] - 62;

          var params = vm.types[c].filter(function (n)
          {
            return n.name === t;
          })[0].params.slice();

          var script = vm.types[c].filter(function (n)
          {
            return n.name === t;
          })[0].script;

          var inputs = vm.types[c].filter(function (n)
          {
            return n.name === t;
          })[0].inputs.slice();

          var outputs = vm.types[c].filter(function (n)
          {
            return n.name === t;
          })[0].outputs.slice();

          var newNode = {
            x: dx,
            y: dy,
            width: 300,
            height: 124,
            name: "new node " + vm.nodes.length,
            category: c,
            type: t,
            params: params,
            script: script,
            inputs: inputs,
            outputs: outputs,
            output: t + (vm.nodes.length),
            fixed: true
          };
          vm.nodes.push(newNode);

          vm.start();

          editNode(newNode);
        };

        vm.toggleNodeList = function ()
        {
          $mdSidenav('right')
            .toggle();
        };


      }
    }
  });
