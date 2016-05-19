'use strict';

var crypto    = require('crypto');
var ds        = require('nedb');
var path      = require('path');
var logger    = require('../../config/logger');
var _         = require('lodash');
var connect   = require('camo').connect;
var Document  = require('camo').Document;

class User extends Document {
  constructor() {
      super();

      this.username = {
        type: String,
        unique: true,
        required: true
      };
      this.passwordHash = String;
      this.salt = String
  }
  
  // I guess getters and setters are now called virtuals
  set password(pass)
  {
    this._password = password;
    this.salt = this.makeSalt();
    this.passwordHash = this.encryptPassword(password);
  }
  get password()
  {
    return this._password;
  }
  
  // Internal Methods
  
  /**
   * Authenticate
   *
   * @param {String} password
   * @return {Boolean}
   */
  authenticate (password) {
    return this.encryptPassword(password) === this.passwordHash;
  }

  /**
   * Make salt
   *
   * @return {String}
   */
  makeSalt () {
    return crypto.randomBytes(16).toString('base64');
  }

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   */
  encryptPassword (password) {
    if (!password || !this.salt) { return ''; }
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
  // Static Methods
  static collectionName() {
      return 'users';
  }
};

var users = new ds({ filename: path.join(__dirname, "users.data.db"), autoload: true, onload: function (err) { if(err) { logger.error('Error on load: ', err) }}});

var userSchema = {
  username: '',
  password: '',
}
var internals = {};
exports.create = function(username, password, cb)
{
  users.findOne({username: username},
    function(err, obj)
    {
      if(err)
      {
        return cb(err);
      }
      if (obj == null || _.isUndefined(obj))
      {
        return cb('User ', username, ' already exists');
      }
      var user = _.copy(userSchema);
      user.password = internals.saltPassword(password);
      user.username = username;
      users.insert(user,
        function(err, doc)
        {
          cb(err, doc);
        })
    });
};

exports.find = function(id, cb)
{
  users.findOne({_id: id}, cb)
};


internals.checkPassword = function(username, password, cb)
{
  users.findOne({username: username},
    function(err, doc)
    {
      if(err)
      {
        return cb(err);
      }
      if()
    })
  
};
internals.saltPassword = function(password)
{
  
};
  /**
   * Authenticate
   *
   * @param {String} password
   * @return {Boolean}
   */
  internals.authenticate: function (password) {
    return this.encryptPassword(password) === this.passwordHash;
  },

  /**
   * Make salt
   *
   * @return {String}
   */
  internals.makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   */
  internals.encryptPassword: function (password) {
    if (!password || !this.salt) { return ''; }
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }