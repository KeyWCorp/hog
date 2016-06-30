/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
  .controller('SimpleCtrl', function () {

    var vm = this;

    vm.update = function (d)
    {
      console.log(d);
    };

    vm.ots = function (d)
    {
      return JSON.stringify(d);
    };

    angular.extend(this, {
      data: {
        nodes: [],
        links: []
      },
      name: 'SimpleCtrl'
    });

  });
