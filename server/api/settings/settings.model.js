/*
 * @license MIT
 * @file settings.model.js
 * @copyright KeyW Corporation 2016
 */


'use strict';

var logger  = require('../../config/logger.js');
var Document  = require('camo').Document;

/**
* Class representing a setting
* @extends Document
*/
class Setting extends Document {
  /**
  * Create a Setting.
  */
  constructor() {
    super();
    
    this.default      = String;
    this.inputType    = String;
    this.name         = String;
    this.data         = [];
    this.displayName  = String;
  }
  /**
   * Change the collection name in the database
   * @return {string} collection name
   */
  static collectionName() {
        return 'settings.data';
    }
  preValidate()
  {
    console.log('validate: ', this.name);
  }
  postValidate()
  {
    console.log('validate: ', this.name);
  }
}
exports.Setting = Setting;
/**
 * Description
 * @method init
 * @param {} cb
 */
exports.init = function(cb)
{
  cb(null);
}
