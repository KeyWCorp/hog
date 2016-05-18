'use strict';

var express = require('express');
var router = express.Router();

require('./local/passport');
//require('./ldap/passport');

router.use('/local', require('./local'));
//router.use('/ldap', require('./ldap'));

module.exports = router;