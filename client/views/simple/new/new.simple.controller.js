'use strict';

angular.module('hog')
.controller('NewSimpleCtrl', function ($log, Runner)
{
  var vm = this;

  vm.data = {
    nodes: [],
    links: []
  };

  vm.update = function (d)
  {
    console.log(JSON.stringify(d, null, 2));
  };

  vm.ots = function (d)
  {
    return JSON.stringify(d);
  };

  angular.extend(vm, {
    name: 'NewSimpleCtrl'
  });
});
