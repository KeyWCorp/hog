/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

if (PigFlowModule === undefined)
{
  var PigFlowModule = angular.module("pig.pig-flow", [])
}
PigFlowModule
.factory('FlowToScript', function()
    {

      /**
       * Description
       * @method FlowToScript
       * @param {} nodes
       * @param {} links
       */
      function FlowToScript (nodes, links)
      {
        this.nodes = nodes || [];
        this.links = links || [];

        this.sorted_list = [];
        this.output_script = "";


        /**
         * Replace script contents
         * @method fillScript
         * @param {} node
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
                      script = script.replace(input_re, input.snippit);

                      var re = new RegExp("<input_" + input.label + ">", "g");
                      script = script.replace(re, input_variable);
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
                    else if (param.multiple)
                    {
                      var re = new RegExp("<"+ param.name +">","g");
                      script = script.replace(re, param.default);
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



        /**
         * Start sorting
         * @method start
         * @param {} cb
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

    });
