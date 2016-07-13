/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

describe('complex route', function () {

  beforeEach(function () {
    browser.get('/complex');
  });

  it('should have a basic content', function () {
    expect(element.all(by.css('div')).first().getText()).toBe('ComplexCtrl');
  });

});
