/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

describe('new sub-state', function () {

  beforeEach(function () {
    browser.get('');
  });

  it('should have a basic content', function () {
    expect(element.all(by.css('div')).first().getText()).toBe('NewCtrl');
  });

});
