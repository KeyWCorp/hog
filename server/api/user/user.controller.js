'use strict';

var _ = require('lodash');

var authService = require('../../auth/auth.service');
var _ready = false;
require('./user.model').init(
  function(err, db)
  {
    _ready = true;
  });

var User = require('./user.model').User;

function handleError (res, err) {
  return res.status(500).send(err);
}
exports.create = function (req, res) {
  if (_ready)
  {
    var newUser = User.create(req.body);
    newUser.save()
      .then(
        function (user)
        {
          res.status(201).json({
            user: _.omit(user.toJSON(), ['passwordHash', 'salt']),
            token: authService.signToken(user._id)
          });
        },
        function (err)
        {
          if (err) { return handleError(res, err); }
        });
  }
};
exports.getMe = function (req, res) {
  if (_ready)
  {
    User.findOne({_id: req.user._id})
      .then(
        function (user)
        {
          if (!user) { return res.json(401); }
          res.status(200).json(user);
        },
        function(err)
        {
          if (err) { return handleError(res, err); }
        });
  }
};