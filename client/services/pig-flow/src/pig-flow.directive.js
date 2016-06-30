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
  .directive("pigFlow", function ($mdDialog, $mdSidenav, pigFlowTemplate, editNodeTemplates, nodeTypes, FlowToScript)
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
      templateUrl: pigFlowTemplate,
      link: function ($scope, element, attrs)
      {
        var vm = $scope;

        vm.data = {};
        vm.links = [];
        vm.nodes = [];
        vm.source_node;
        vm.target_node;
        vm.types = angular.copy(nodeTypes);
        vm.type_list = Object.keys(vm.types);
        vm.output_script = "";
        vm.initial_load = true;


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
            .on("dblclick.zoom", null);

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
          vm.node_input_label = vm.container.selectAll(".node_input_label");
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

          /*
           * link data
           */
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


          /*
           * node data
           */
          vm.node = vm.node
            .data(vm.nodes);
          vm.node.enter()
            .append("g");
          vm.node.exit()
            .remove();


          /*
           * body node data
           */
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


          /*
           * type label data
           */
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


          /*
           * header node data
           */
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


          /*
           * node name data
           */
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


          /*
           * close node data
           */
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


          /*
           * edit node data
           */
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
              editNode(d, true, d.index);
            });
          vm.node_edit.exit()
            .remove();


          /*
           * input node data
           */
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


          /*
           * output node data
           */
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


          /*
           * input label node data
           */
          vm.node_input_label = vm.node_input_label
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
          vm.node_input_label
            .attr("class", "node_input_label")
            .text(function (d)
            {
              return d.data.label;
            })
            .attr("x", function (d, i)
            {
              return d.x;
            })
            .attr("y", function (d, i)
            {
              return d.y;
            })
            .attr("transform", function(d, i)
            {
              return "rotate(45," + (d.x + 10) + "," + (d.y - 10) + ")";
            });
          vm.node_input_label.enter()
            .append("text")
            .attr("class", "node_input_label")
            .attr("text-anchor", "end")
            .text(function (d)
            {
              return d.data.label;
            })
            .attr("x", function (d, i)
            {
              return d.x;
            })
            .attr("y", function (d, i)
            {
              return d.y;
            })
            .attr("transform", function(d, i)
            {
              return "rotate(45," + (d.x + 10) + "," + (d.y - 10) + ")";
            })
            .style("pointer-events", "none");
          vm.node_input_label.exit()
            .remove();


          /*
           * update
           */
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

          /*
           * Move Links
           */
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


          /*
           * move Nodes
           */
          vm.node
            .attr("x", function (d)
            {
              return d.x;
            })
            .attr("y", function (d)
            {
              return d.y;
            });


          /*
           * move node body
           */
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
            })
            // rounded corners
            .attr("rx", 10)
            .attr("ry", 10);


          /*
           * move node type label
           */
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


          /*
           * move node header
           */
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
            })
            // rounded corners
            .attr("rx", 10)
            .attr("ry", 10);


          /*
           * move node name label
           */
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
            });


          /*
           * move node close button
           */
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


          /*
           * move node edit button
           */
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


          /*
           * move node inputs
           */
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


          /*
           * move node outputs
           */
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


          /*
           * move node input labels
           */
          vm.node_input_label
            .attr("class", "node_input_label")
            .attr("transform", "rotate(-45)")
            .attr("x", function (d, i)
            {
              var middle = (d.p.x + d.p.width * 0.5);
              var offset = middle - ((d.length - 1) * 25) * 0.5;
              d.x = offset + d.index * 25;
              return d.x;
            })
            .attr("y", function (d, i)
            {
              d.y = d.p.y;
              return d.y;
            })
            .attr("transform", function(d, i)
            {
              return "rotate(45," + (d.x + 10) + "," + (d.y - 10) + ")";
            });

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

            t.data.value = d.output;

            vm.source_node = {
              data: d,
              node: n,
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

              var same_category = true;
              var same_type = true;

              // check category is the same
              if (t.data.category)
              {
                same_category = t.data.category.filter(function(category)
                {
                  return category === vm.source_node.data.category;
                }).length > 0;
              }

              // check type is the same
              if (t.data.type)
              {
                same_type = t.data.type.filter(function(type)
                {
                  return type === vm.source_node.data.type;
                }).length > 0;
              }


              // check that it is the right type
              if ((same_type && same_category) ||
                  (!t.data.category && !t.data.type))
              {
                t.data.value = vm.source_node.data.index;

                vm.target_node = {
                  data: d,
                  node: n,
                  x: t.x - d.x,
                  y: t.y - d.y
                };

                /*
                 * add output node link
                 */
                if (!vm.source_node.data.output_nodes || vm.source_node.data.output_nodes.length <= 0)
                {
                  vm.source_node.data.output_nodes = [];
                }
                vm.source_node.data.output_nodes.push(vm.target_node.data.index);

                /*
                 * add input node link
                 */
                if (!vm.target_node.data.input_nodes || vm.target_node.data.input_nodes.length <= 0)
                {
                  vm.target_node.data.input_nodes = [];
                }
                vm.target_node.data.input_nodes.push(vm.source_node.data.index);

                var tmp_obj = {
                  source: vm.source_node.data.index,
                  target: vm.target_node.data.index,
                  x1: vm.source_node.x,
                  y1: vm.source_node.y,
                  x2: vm.target_node.x,
                  y2: vm.target_node.y
                };

                vm.links.push(tmp_obj);

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
          removeLinks(d);
          updateNodeIndexs(d.index);
          vm.nodes.splice(d.index, 1);
          vm.start();
        };

        function editNode(l, info, index)
        {

          var d = vm.nodes[index];

          function reloadDialog(reload)
          {
            $mdDialog.show(
              {
                scope: vm,
                preserveScope: true,
                clickOutsideToClose: false,
                templateUrl: editNodeTemplates.editNodeViewTemplate,
                locals:
                {
                  data: d,
                  old_scope: vm,
                  templates: editNodeTemplates,
                  info: info
                },
                controller: editNodeTemplates.EditNodeControllerTemplate
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

          /*
           * remove from source output_nodes
           */
          d.source.output_nodes = d.source.output_nodes.filter(function(output_index)
          {
            return output_index !== d.target.index;
          });


          /*
           * remove from target input_nodes
           */
          d.target.input_nodes = d.target.input_nodes.filter(function(input_index)
          {
            return input_index !== d.source.index;
          });


          /*
           * remove from target inputs
           */
          d.target.inputs.map(function(input)
          {
            if (input.value === d.source.index)
            {
              input.value = "";
            }
          });

          var newLinks = vm.links.filter(function (obj)
          {
            return obj.source === d.source && obj.target === d.target;
          });

          newLinks.map(function (l)
          {
            vm.links.splice(vm.links.indexOf(l), 1);
          });
        };


        function updateNodeIndexs (deleted_index)
        {

          vm.nodes.map(function(node)
          {
            /*
             * shift indexs in inputs
             */
            if (node.inputs)
            {
              node.inputs.map(function(input)
              {
                if (input.value > deleted_index)
                {
                  input.value = input.value - 1;
                }
                else if (input.value === deleted_index)
                {
                  input.value = "";
                }
              });
            }

            /*
             * shift indexs in output_nodes
             */
            if (node.output_nodes)
            {
              node.output_nodes.map(function(output_index, idx)
              {
                if (output_index > deleted_index)
                {
                  node.output_nodes[idx] = output_index - 1;
                }
                else if (output_index === deleted_index)
                {
                  delete node.output_nodes.splice(idx, 1);
                }
              });
            }

            /*
             * shift indexs in input_nodes
             */
            if (node.input_nodes)
            {
              node.input_nodes.map(function(input_index, idx)
              {
                if (input_index > deleted_index)
                {
                  node.input_nodes[idx] = input_index - 1;
                }
                else if (input_index === deleted_index)
                {
                  delete node.input_nodes.splice(idx, 1);
                }
              });
            }
          });

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

          var params = angular.copy(vm.types[c].filter(function (n)
          {
            return n.name === t;
          })[0].params.slice());

          var script = angular.copy(vm.types[c].filter(function (n)
          {
            return n.name === t;
          })[0].script);

          var inputs = angular.copy(vm.types[c].filter(function (n)
          {
            return n.name === t;
          })[0].inputs.slice());

          var outputs = angular.copy(vm.types[c].filter(function (n)
          {
            return n.name === t;
          })[0].outputs.slice());

          var output = t + (vm.nodes.length);
          var is_variable = outputs.filter(function(o)
          {
            return o.label === "content";
          }).length > 0;
          if (is_variable)
          {
            output = "" + script.content;
          }

          var newNode = {
            x: dx,
            y: dy,
            default_width: 300,
            default_height: 124,
            width: 300,
            height: 124,
            name: "new node " + vm.nodes.length,
            category: c,
            type: t,
            params: params,
            script: script,
            inputs: inputs,
            outputs: outputs,
            output: output,
            fixed: true
          };
          vm.nodes.push(newNode);

          vm.start();

          editNode(newNode, null, newNode.index);
        };

        vm.toggleNodeList = function ()
        {
          $mdSidenav('right')
            .toggle();
        };


      }
    }
  });
