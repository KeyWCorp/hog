/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
  .controller('SimpleCtrl', function () {

    var vm = this;

    /**
     * Description
     * @method update
     * @param {} d
     */
    vm.update = function (d)
    {
      console.log(d);
    };

    /**
     * Description
     * @method ots
     * @param {} d
     */
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
