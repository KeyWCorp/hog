/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

describe('Controller: HomeCtrl', function () {

  beforeEach(module('hog'));

  var HomeCtrl,
    scope;

  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HomeCtrl = $controller('HomeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toBe(1);
  });

});
