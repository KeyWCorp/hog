'use strict';

angular.module('hog')
  .controller('LandingCtrl', function ($state, Runner) {

    var vm = this;
    console.log('asking for simple');
    Runner.recent(5, 'simple')
      .then(
        function(data)
        {
          vm.simplePigs = data.json;
        });
    console.log('asking for complex');
    Runner.recent(5, 'complex')
      .then(
        function(data)
        {
          vm.complexPigs = data.json;
          console.log('piggies', vm.complexPigs, 'data', data.json);
        });

    vm.editComplex = function(id)
    {
      $state.go('home.complex.edit', {id: id});
    }
	  vm.editSimple = function(id)
    {
      $state.go('home.simple.edit', {id: id});
    }

    angular.extend(vm, {
      name: 'LandingCtrl',
      


    });

  });
