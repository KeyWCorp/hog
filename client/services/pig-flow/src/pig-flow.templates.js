angular.module('pig.pig-flow-templates', [])
.factory('FlowToScript', function()
    {

      function FlowToScript (nodes, links)
      {
        this.nodes = nodes || [];
        this.links = links || [];

        this.sorted_list = [];
        this.output_script = "";


        /*
         * Replace script contents
         */
        this.fillScript = function (node)
        {
          var self = this;

          /*
           * check if node is a variable
           */
          var is_variable = node.outputs.filter(function(o)
          {
            return o.label === "content";
          }).length > 0;

          /*
          * Build output script
          */
          var script = node.script.content;

          if (is_variable)
          {

            /*
            * replace parameter variables
            */
            node.params.map(function(param)
                {
                  if (!param.required)
                  {
                    if (param.value)
                    {
                      var snippit_re = new RegExp("<"+ param.name +">","g");
                      script = script.replace(snippit_re, param.snippit);

                      var re = new RegExp("<"+ param.name +">","g");
                      script = script.replace(re, param.value);
                    }
                    else
                    {
                      var default_re = new RegExp("<"+ param.name +">","g");
                      script = script.replace(default_re, param.default);
                    }
                  }
                  else if (param.value)
                  {
                    var re = new RegExp("<"+ param.name +">","g");
                    script = script.replace(re, param.value);
                  }
                });

            node.output = script;
          }
          else
          {

            /*
            * replace input variables
            */
            node.inputs.map(function(input)
                {
                  if (input.required)
                  {
                    if (input.value !== "")
                    {
                      var input_obj = self.nodes.filter(function(n_node)
                      {
                        return n_node.index === input.value;
                      });

                      var input_variable = input_obj[0].output;

                      var input_re = new RegExp("<input_" + input.label + ">", "g");
                      script = script.replace(input_re, input_variable);
                    }
                    else
                    {
                      var input_re = new RegExp("<input_" + input.label + ">", "g");
                      script = script.replace(input_re, input.default);
                    }
                  }
                  else
                  {
                    if (input.value !== "")
                    {
                      var input_obj = self.nodes.filter(function(n_node)
                      {
                        return n_node.index === input.value;
                      });

                      var input_variable = input_obj[0].output;

                      var input_re = new RegExp("<input_" + input.label + ">", "g");
                      script = script.replace(input_re, input_variable);
                    }
                    else
                    {
                      var input_re = new RegExp("<input_" + input.label + ">", "g");
                      script = script.replace(input_re, input.default);
                    }
                  }
                });

            /*
            * replace parameter variables
            */
            node.params.map(function(param)
                {
                  if (!param.required)
                  {
                    if (param.value !== "")
                    {
                      var snippit_re = new RegExp("<"+ param.name +">","g");
                      script = script.replace(snippit_re, param.snippit);

                      var re = new RegExp("<"+ param.name +">","g");
                      script = script.replace(re, param.value);
                    }
                    else
                    {
                      var default_re = new RegExp("<"+ param.name +">","g");
                      script = script.replace(default_re, param.default);
                    }
                  }
                  else if (param.value)
                  {
                    var re = new RegExp("<"+ param.name +">","g");
                    script = script.replace(re, param.value);
                  }
                });

            /*
            * replace output variable
            */
            if (node.output)
            {
              var output_re = new RegExp("<output_variable>", "g");
              script = script.replace(output_re, node.output);
            }


            self.output_script = self.output_script + "\n" + script;
          }

        };


        /*
         * Start sorting
         */
        this.start = function (cb)
        {
          var self = this;

          self.sorted_list = self.nodes.filter(function (node)
              {
                return !node.input_nodes || node.input_nodes.length <= 0 || node.inputs.length <= 0;
              });


          /*
           * sort sorted_list by index
           */
          self.sorted_list.sort(function(a, b)
              {
                return a.index - b.index;
              });

          for(var i = 0; i < self.sorted_list.length; i++)
          {
            var node = self.sorted_list[i];
            /*
             * Get outputs for each node
             */
            if (node.output_nodes)
            {
              var tmp_child_list = node.output_nodes.map(function(output_index)
                  {
                    var tmp_o = self.nodes.filter(function(n)
                        {
                          return n.index === output_index;
                        });
                    return tmp_o[0];
                  });

              var child_queue = tmp_child_list.filter(function(child)
                  {
                    return self.sorted_list.filter(function(s_node)
                        {
                          return s_node.index !== child.index;
                        }).length > 0;
                  });

              child_queue.map(function(child)
                  {
                    if (child.input_nodes)
                    {
                      var sorted_inputs = child.input_nodes.filter(function(c_input_index)
                          {
                            return self.sorted_list.filter(function(s_node)
                                {
                                  return s_node.index === c_input_index;
                                }).length > 0;
                          });


                      /*
                       * check to see if all inputs are sorted
                       */
                      if (sorted_inputs.length === child.input_nodes.length)
                      {
                        var sorted_already = self.sorted_list.filter(function(node)
                        {
                          return node === child;
                        }).length > 0;
                        if (!sorted_already)
                        {
                          self.sorted_list.push(child);
                        }
                      }

                    }
                  });

            }

            if (i >= self.sorted_list.length -1)
            {
              /*
              * call fill script
              */
              self.sorted_list.map(function(node)
                  {
                    self.fillScript(node);
                  });
            }
          }


          cb(self.output_script);

        };


      };


      return FlowToScript;

    })
.factory('pigFlowTemplate', function()
    {

      var sidebar =
        "<md-sidenav style='height: {{ window.innerHeight }}' class='md-sidenav-right md-whiteframe-z2' md-component-id='right'>"
        + "  <md-toolbar class='md-theme-light'>"
        + "    <h1 class='md-toolbar-tools'>Node Types</h1>"
        + "  </md-toolbar>"
        + "  <md-content layout-padding>"
        + "    <md-list>"
        + "      <div ng-repeat='type in type_list'>"
        + "        <md-subheader layout='row' layout-align='center center' class='md-no-sticky'>{{ type | uppercase }} NODES</md-subheader>"
        + "        <md-list-item class='md-3-line' ng-repeat='node in types[type]' layout='row' layout-align='start center'>"
        + "          <div class='md-list-item-text' layout='column' >"
        + "            <md-button style='border-radius: 6px; border:1px solid black' class='md-raised' ng-click='addNode(type, node.name)'>"
        + "              <h3> {{node.name | uppercase}}</h3>"
        + "            </md-button>"
        + "            <div layout='row' layout-align='center center' layout-padding layout-margin layout-fill>"
        + "              <p style='text-align: center;'>{{ node.description }}</p>"
        + "            </div>"
        + "          </div>"
        + "        </md-list-item>"
        + "        <md-divider ></md-divider>"
        + "      </div>"
        + ""
        + "    </md-list>"
        + "</md-sidenav>";

      var main_template =
        "<md-content class='md-padding' flex layout='row'>"
        + "  <span flex></span>"
        + ""
        + "  <md-button class='md-fab' aria-label='Add' ng-click='toggleNodeList()'>"
        + "    <md-icon md-font-set='material-icons'> add </md-icon>"
        + "    <md-tooltip>Toggle Node list</md-tooltip>"
        + "  </md-button>"
        + ""
        + "</md-content>"
        + sidebar;


      return main_template;
    })
.factory('nodeTemplates', function() {

  /*
   * Edit node controller
   */
  function EditNodeController($scope, $mdDialog, data, old_scope, templates, info)
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
        vm.node_info.width = vm.node_info.default_width + added_width;

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
  };


  return {
    // views
    basicEditTemplate: "services/pig-flow/src/html/basic.html",

    // controllers
    EditNodeController: EditNodeController
  };

})
.factory('nodeTypes', function()
    {
      var nodeTypes = {
        relational_operators: [
        {
          name: "load",
          params: [
          {
            name: "source",
            required: true,
            value: ""
          },
          {
            name: "format",
            required: false,
            snippit: " AS <format>",
            default: "",
            value: ""
          }
          ],
          description: "Load from a source",
          output: "",
          inputs: [
          {
            label: "storage_type",
            type: ["storage_types"],
            required: false,
            snippit: "<input_storage_type>",
            default: "",
            value: ""
          }
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: false,
            output_var: true,
            variables: [
              "source",
              "format",
              "separator"
            ],
            content: "<output_variable> = LOAD '<source>'<input_storage_type><format>;"
          }
        },
        {
          name: "group",
          params: [
          {
            name: "type",
            required: false,
            snippit: " BY <type>",
            default: " ALL",
            value: ""
          }],
          description: "Takes in an input and groups by a type",
          output: "",
          inputs: [
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          }
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "type"
            ],
            content: "<output_variable> = GROUP <input_source><type>;"
          }
        },
        {
          name: "join",
          params: [
          {
            name: "type1",
            required: true,
            value: ""
          },
          {
            name: "type2",
            required: true,
            value: ""
          }],
          description: "Performs an inner join of two or more relations based on common field values",
          output: "",
          inputs: [
          {
            label: "source1",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          {
            label: "source2",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          }
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "type1",
              "type2"
            ],
            content: "<output_variable> = JOIN <input_source1> BY <type1>, <input_source2> BY <type2>;"
          }
        }],
        eval_functions: [
        {
          name: "average",
          params: [
          {
            name: "type",
            required: false,
            snippit: ".<type>) AS <type>",
            default: ")",
            value: ""
          }],
          description: "Take in an input and group and returns the average of the type",
          output: "",
          inputs: [
          {
            label: "grouping",
            type: ["group"],
            required: true,
            default: "",
            value: ""
          },
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "type"
            ],
            content: "<output_variable> = FOREACH <input_grouping> GENERATE AVG(<input_source><type>;"
          }
        },
        {
          name: "bagtostring",
          params: [
          {
            name: "type",
            required: false,
            snippit: ".<type>",
            default: "",
            value: ""
          },
          {
            name: "delimiter",
            required: false,
            snippit: ", '<delimiter>'",
            default: "",
            value: ""
          }],
          description: "Concatenate the elements of a Bag into a chararray string, placing an optional delimiter between each value",
          output: "",
          inputs: [
          {
            label: "grouping",
            type: ["group"],
            required: true,
            default: "",
            value: ""
          },
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "type",
              "delimiter"
            ],
            content: "<output_variable> = FOREACH <input_grouping> GENERATE BagToString(<input_source><type><delimiter>);"
          }
        },
        {
          name: "concat",
          params: [
          {
            name: "expression",
            required: true,
            value: ""
          }],
          description: "Concatenates two or more expressions of identical type",
          output: "",
          inputs: [
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "expression"
            ],
            content: "<output_variable> = FOREACH <input_source> GENERATE CONCAT(<expression>);"
          }
        },
        {
          name: "count",
          params: [],
          description: "Take in an input and group and returns the count of the type",
          output: "",
          inputs: [
          {
            label: "grouping",
            type: ["group"],
            required: true,
            default: "",
            value: ""
          },
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
            ],
            content: "<output_variable> = FOREACH <input_grouping> GENERATE COUNT(<input_source>);"
          }
        },
        {
          name: "count_star",
          params: [],
          description: "Computes the number of elements in a bag",
          output: "",
          inputs: [
          {
            label: "grouping",
            type: ["group"],
            required: true,
            default: "",
            value: ""
          },
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
            ],
            content: "<output_variable> = FOREACH <input_grouping> GENERATE COUNT_STAR(<input_source>);"
          }
        },
        {
          name: "diff",
          params: [
          {
            name: "type1",
            required: true,
            value: ""
          },
          {
            name: "type2",
            required: true,
            value: ""
          }],
          description: "Compares two fields in a tuple.",
          output: "",
          inputs: [
          {
            label: "source",
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "type1",
              "type2"
            ],
            content: "<output_variable> = FOREACH <input_source> GENERATE DIFF(<type1>,<type2>);"
          }
        },
        /*
         * Remove subtract until further instructions
         *
        {
          name: "isempty",
          params: [],
          description: "Checks if a bag or map is empty",
          output: "",
          inputs: [
          {
            label: "join",
            type: ["join"],
            required: true,
            default: "",
            value: ""
          },
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [],
            content: "<output_variable> = FILTER <input_join> BY IsEmpty(<input_source>);"
          }
        },
        */
        {
          name: "max",
          params: [
          {
            name: "type",
            required: true,
            value: ""
          }],
          description: "Computes the maximum of the numeric values or chararrays in a single-column bag. MAX requires a preceding GROUP ALL statement for global maximums and a GROUP BY statement for group maximums.",
          output: "",
          inputs: [
          {
            label: "grouping",
            type: ["group"],
            required: true,
            default: "",
            value: ""
          },
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "type"
            ],
            content: "<output_variable> = FOREACH <input_grouping> GENERATE MAX(<input_source>.<type>);"
          }
        },
        {
          name: "min",
          params: [
          {
            name: "type",
            required: true,
            value: ""
          }],
          description: "Computes the minimum of the numeric values or chararrays in a single-column bag. MIN requires a preceding GROUP… ALL statement for global minimums and a GROUP … BY statement for group minimums.",
          output: "",
          inputs: [
          {
            label: "grouping",
            type: ["group"],
            required: true,
            default: "",
            value: ""
          },
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "type"
            ],
            content: "<output_variable> = FOREACH <input_grouping> GENERATE MIN(<input_source>.<type>);"
          }
        },
        {
          name: "size",
          params: [
          {
            name: "type",
            required: true,
            value: ""
          }],
          description: "Computes the number of elements based on any Pig data type.",
          output: "",
          inputs: [
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "type"
            ],
            content: "<output_variable> = FOREACH <input_source> GENERATE SIZE(<type>);"
          }
        },
        /*
         * Remove subtract until further instructions
         *
        {
          name: "subtract",
          params: [
          {
            name: "type1",
            required: true,
            value: ""
          },
          {
            name: "type2",
            required: true,
            value: ""
          }],
          description: "Bags subtraction, SUBTRACT(bag1, bag2) = bags composed of bag1 elements not in bag2",
          output: "",
          inputs: [
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "type1",
              "type2"
            ],
            content: "<output_variable> = FOREACH <input_source> GENERATE SUBTRACT(<type1>,<type2>);"
          }
        },
        */
        {
          name: "sum",
          params: [
          {
            name: "type",
            required: true,
            value: ""
          }],
          description: "Take in an input and group and returns the sum of the type",
          output: "",
          inputs: [
          {
            label: "grouping",
            type: ["group"],
            required: true,
            default: "",
            value: ""
          },
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "type"
            ],
            content: "<output_variable> = FOREACH <input_grouping> GENERATE SUM(<input_source>.<type>) AS <type>;"
          }
        },
        {
          name: "tokenize",
          params: [
          {
            name: "type",
            required: true,
            value: ""
          }],
          description: "Splits a string and outputs a bag of words.",
          output: "",
          inputs: [
          {
            label: "source",
            type: ["load"],
            required: true,
            default: "",
            value: ""
          },
          ],
          outputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          script: {
            input_var: true,
            output_var: true,
            variables: [
              "type"
            ],
            content: "<output_variable> = FOREACH <input_source> GENERATE TOKENIZE(<type>);"
          }
        }],
        load_store_functions: [
        {
          name: "storage",
          params: [
          {
            name: "location",
            required: true,
            value: ""
          }],
          description: "Store variable into location, requires a storage type",
          inputs: [
          {
            label: "variable",
            required: true,
            default: "",
            value: ""
          },
          {
            label: "storage_type",
            required: true,
            default: "",
            value: ""
          }
          ],
          outputs: [],
          script: {
            input_var: true,
            output_var: false,
            variables: [],
            content: "STORE <input_variable> INTO '<location>'<input_storage_type>;"
          }
        }
        ],
        load_types: [
        {
          name: "jsonloader",
          params: [
          {
            name: "schema",
            required: false,
            snippit: "'<schema>'",
            default: "",
            value: ""
          }],
          description: "Load JSON data",
          inputs: [],
          outputs: [
          {
            label: "content",
            value: ""
          }
          ],
          script: {
            input_var: false,
            output_var: true,
            variables: [],
            content: " USING JsonLoader(<schema>)"
          }
        }
        ],
        storage_types: [
        {
          name: "binstorage",
          params: [],
          description: "Loads and stores data in machine-readable format",
          inputs: [],
          outputs: [
          {
            label: "content",
            value: ""
          }
          ],
          script: {
            input_var: false,
            output_var: true,
            variables: [],
            content: " USING BinStorage()"
          }
        },
        {
          name: "jsonstorage",
          params: [],
          description: "Store JSON data",
          inputs: [],
          outputs: [
          {
            label: "content",
            value: ""
          }
          ],
          script: {
            input_var: false,
            output_var: true,
            variables: [],
            content: " USING JsonLoader()"
          }
        },
        {
          name: "pigdump",
          params: [],
          description: "Stores data in UTF-8 format",
          inputs: [],
          outputs: [
          {
            label: "content",
            value: ""
          }
          ],
          script: {
            input_var: false,
            output_var: true,
            variables: [],
            content: " USING PigDump()"
          }
        },
        {
          name: "pigstorage",
          params: [
          {
            name: "field_delimiter",
            required: false,
            snippit: "'<field_delimiter>'",
            default: "",
            value: ""
          }],
          description: "Loads and stores data as structured text files",
          inputs: [],
          outputs: [
          {
            label: "content",
            value: ""
          }
          ],
          script: {
            input_var: false,
            output_var: true,
            variables: [],
            content: " USING PigStorage(<field_delimiter>)"
          }
        }
        ],
        output: [
        {
          name: "dump",
          params: [],
          inputs: [
          {
            label: "variable",
            required: true,
            default: "",
            value: ""
          }
          ],
          outputs: [
          ],
          script: {
            input_var: true,
            output_var: false,
            variables: [],
            content: "DUMP <input_variable>;"
          },
          description: "Takes in an input and outputs to standard out",
        }]
      };

      return nodeTypes;

    });
