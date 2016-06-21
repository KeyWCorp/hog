
/**
 */

'use strict';

if (PigFlowModule === undefined)
{
  var PigFlowModule = angular.module("pig.pig-flow", [])
}
PigFlowModule
.factory('editNodeTemplates', function() {

  /*
   * Edit node controller
   */
  function EditNodeControllerTemplate($scope, $mdDialog, data, old_scope, templates, info)
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
      angular.copy(vm.node_info.params, vm.params);
      vm.types[vm.category].map(function (t)
          {
            if (t.name === vm.type)
            {
              vm.script = t.script;
              vm.description = t.description;
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

    vm.addInput = function(param)
    {
      if (param.value !== "")
      {

        if (vm.node_info.script.content !== vm.script.content)
        {
          angular.copy(vm.node_info.script, vm.script);
        }

        var tmp_input = {
          label: param.value,
          required: true,
          default: "",
          value: ""
        };

        var new_param = {
          name: "function" + vm.node_info.params.length,
          required: true,
          default: param.value,
          value: param.value
        };

        // make a copy of the old node
        var old_node = {};
        angular.copy(vm.node_info, old_node);

        // update params
        vm.params.push(new_param);

        console.log("before: " + vm.script.content);

        // update script
        var script_re = RegExp("<function>", "g");
        vm.script.content = vm.script.content.replace(script_re, "GENERATE<input_" + tmp_input.label + ">;<function>");

        console.log("after: " + vm.script.content);

        // make new input and param
        old_node.inputs.push(tmp_input);
        old_node.params.push(new_param);

        // copy back to node
        angular.copy(old_node, vm.node_info);
        angular.copy(vm.script, vm.node_info.script);
        param.value = "";

      }

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
    editNodeViewTemplate: "services/pig-flow/src/html/editNodeTemplate.html",

    // controllers
    EditNodeControllerTemplate: EditNodeControllerTemplate
  };

});
