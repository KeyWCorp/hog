'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../../api/user/user.model').User;

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function (username, password, done) {
    User.findOne({
      username: username
    },
    {populate: true})
    .then(
      function (user)
      {
        if (!user) { return done(null, false, { msg: 'username not found' }); }
        if (!user.authenticate(password)) {
          return done(null, false, { msg: 'incorrect password' });
        }
        done(null, user);
      },
      function(err)
      {
        if (err) { return done(err); }
      });
  }
));