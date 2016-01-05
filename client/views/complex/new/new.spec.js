'use strict';

describe('Controller: NewCtrl', function () {

  beforeEach(module('hog'));

  var NewCtrl;

  beforeEach(inject(function ($controller) {
    NewCtrl = $controller('NewCtrl', {});
  }));

  it('should ...', function () {
    expect(1).toBe(1);
  });

});
