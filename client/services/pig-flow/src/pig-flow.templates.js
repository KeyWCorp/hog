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
         * Start sorting
         */
        this.start = function (cb)
        {
          var self = this;

          self.sorted_list = self.nodes.filter(function (node)
          {
            return !node.input_nodes || node.inputs.length <= 0;
          });

          /*
           * sort sorted_list by index
           */
          self.sorted_list.sort(function(a, b)
          {
            return a.index - b.index;
          });

          console.log("===================");
          console.log("Start:");
          console.log("-------------------");
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
                    /*
                     * Build output script
                     */
                    var script = child.script.content;
                    //var output_re = new RegExp("<output_" + output.label + ">", "g");
                    //script = script.replace(re, node.output);
                    //var input_re = new RegExp("<input_" + input.label + ">", "g");
                    //script = script.replace(re, input.value);
                    //var re = new RegExp("<"+v+">","g");
                    //script = script.replace(re, node.params[i].value);

                    self.sorted_list.push(child);
                  }

                }
              });

            }
            console.log(node);
          }
          console.log("-------------------");
          console.log("End:");
          console.log("===================");




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
  var headerTemplate = "<md-dialog flex='60'>"
    + "  <form name='editForm'"
    + "    <md-toolbar>"
    + "        <div class='md-toolbar-tools'>"
    + "            <h2>{{ node_info.name }}</h2>"
    + "            <span flex></span>"
    + "            <h3>{{ node_info.type }}</h3>"
    + "        </div>"
    + "    </md-toolbar>"
    + "    <md-dialog-content layout='column' layout-margin>";

  var footerTemplate = "    </md-dialog-content>"
    + "    <div class='md-actions' layout='row'>"
    + "        <span flex></span>"
    + "        <md-button ng-click='cancel()'>Cancel</md-button>"
    + "        <md-button ng-disabled='editForm.$invalid' ng-click='saveAndClose()'>Save</md-button>"
    + "    </div>"
    + "  </form>"
    + "</md-dialog>";

  var basicTemplate = headerTemplate
    + "      <div layout='row'>"
    + "        <md-input-container flex>"
    + "            <label>Name</label>"
    + "            <input ng-model='tmp_node.name'>"
    + "        </md-input-container>"
    + "        <md-input-container flex>"
    + "            <label>Type category</label>"
    + "            <md-select ng-model='category' ng-disabled='!node_info'>"
    + "              <md-option ng-repeat='category in categorys' value='{{ category }}'>"
    + "                {{ category }}"
    + "              </md-option>"
    + "            </md-select>"
    + "        </md-input-container>"
    + "        <md-input-container flex>"
    + "            <label>Type</label>"
    + "            <md-select ng-model='type' ng-disabled='!category' md-on-close='save(type)'>"
    + "              <md-option ng-repeat='type in types[category]' value='{{ type.name }}'>"
    + "                {{ type.name }}"
    + "              </md-option>"
    + "            </md-select>"
    + "        </md-input-container>"
    + "      </div>"
    + "      <div layout='column' ng-show='tmp_node.params[0].name'>"
    + "        <md-input-container flex ng-repeat='param in params track by $index'>"
    + "            <label>{{ param.name }}</label>"
    + "            <input ng-if='param.required' required ng-trim='false' name='{{ param.name }}' ng-model='param.value'>"
    + "            <input ng-if='!param.required' ng-trim='false' name='{{ param.name }}' ng-model='param.value'>"
    + "        </md-input-container>"
    + "      </div>"
    + "      <div layout='column'>"
    + "        <md-content flex layout-padding>"
    + "          <md-subheader>Description</md-subheader>"
    + "          <section>"
    + "            <p>{{ tmp_node.description }}</p>"
    + "          </section>"
    + "        </md-content>"
    + "      </div>";

  var loadTemplate = basicTemplate;


  return {
    basic: basicTemplate + footerTemplate,
    load: loadTemplate + footerTemplate
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
            value: ""
          },
          {
            name: "separator",
            required: false,
            value: ""
          }],
          description: "Load from a source",
          output: "",
          inputs: [],
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
            content: "<output_variable> = LOAD '<source>' USING PigStorage('<separator>') AS <format>;"
          }
        },
        {
          name: "group",
          params: [
          {
            name: "type",
            required: true,
            value: ""
          }],
          description: "Takes in an input and groups by a type",
          output: "",
          inputs: [
          {
            label: "source",
            type: "load",
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
            content: "<output_variable> = GROUP <input_source> BY <type>;"
          }
        }],
        eval_functions: [
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
            type: "group",
            value: ""
          },
          {
            label: "source",
            type: "load",
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
          name: "average",
          params: [
          {
            name: "type",
            required: true,
            value: ""
          }],
          description: "Take in an input and group and returns the average of the type",
          output: "",
          inputs: [
          {
            label: "grouping",
            type: "group",
            value: ""
          },
          {
            label: "source",
            type: "load",
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
            content: "<output_variable> = FOREACH <input_grouping> GENERATE AVE(<input_source>.<type>) AS <type>;"
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
            type: "group",
            value: ""
          },
          {
            label: "source",
            type: "load",
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
        {
          name: "max",
          params: [
          {
            name: "type",
            required: false,
            value: ""
          }],
          description: "Computes the maximum of the numeric values or chararrays in a single-column bag. MAX requires a preceding GROUP ALL statement for global maximums and a GROUP BY statement for group maximums.",
          output: "",
          inputs: [
          {
            label: "grouping",
            type: "group",
            value: ""
          },
          {
            label: "source",
            type: "load",
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
            required: false,
            value: ""
          }],
          description: "Computes the minimum of the numeric values or chararrays in a single-column bag. MIN requires a preceding GROUP… ALL statement for global minimums and a GROUP … BY statement for group minimums.",
          output: "",
          inputs: [
          {
            label: "grouping",
            type: "group",
            value: ""
          },
          {
            label: "source",
            type: "load",
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
            content: "<output_variable> = FOREACH <input_grouping>, MIN(<input_source>.<type>);"
          }
        },
        {
          name: "size",
          params: [
          {
            name: "type",
            required: false,
            value: ""
          }],
          description: "Computes the number of elements based on any Pig data type.",
          output: "",
          inputs: [
          {
            label: "source",
            type: "load",
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
            type: "load",
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
        {
          name: "tokenize",
          params: [
          {
            name: "type",
            required: false,
            value: ""
          }],
          description: "Splits a string and outputs a bag of words.",
          output: "",
          inputs: [
          {
            label: "source",
            type: "load",
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
        output: [
        {
          name: "dump",
          params: [],
          inputs: [
          {
            label: "variable",
            value: ""
          }
          ],
          outputs: [],
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
