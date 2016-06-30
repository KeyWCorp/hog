/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


/**
*/

'use strict';

myApp.controller('HomeCtrl', ['$scope', 'socket', function($scope, socket) {
    //TODO - put any directive code here

    $scope.running = false;

    $scope.removeFirst = function() {
        $scope.taskOne.obj.children.splice(0,1);
    };
    $scope.taskList = [];

    //$scope.taskList = [
    //    {id: 1, name: "test1", status: "FINISHED", parent: 0},
    //    {id: 2, name: "test2", status: "RUNNING", parent: 1},
    //    {id: 3, name: "test3", status: "FAILED", parent: 1},
    //    {id: 4, name: "test4", status: "pending", parent: 2},
    //    {id: 5, name: "test5", status: "RUNNING", parent: 1},
    //    {id: 6, name: "test6", status: "pending", parent: 2}
    //];

    socket.on('update', function (data) {
      $scope.taskList = data;
    });

    socket.on('finish', function () {
      $scope.running = false;
    });


    $scope.run = function () {
      $scope.taskList = [];
      $scope.running = true;
      socket.emit('run');
    };

    $scope.addChild = function() {
        $scope.taskList.push({
            id: $scope.taskList.length + 1,
            name: "TEster" + $scope.taskList.length,
            status: "FINISHED",
            parent: 6
        });
    };

    $scope.ots = function(o) {
        return JSON.stringify(o);
    };

}]);
