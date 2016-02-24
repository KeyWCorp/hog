'use strict';

angular.module('hog')
  .service('Settings',
    function ($log, lodash)
    {
      var serivce = {
        set: set,
        get: get,
      };
      var settings = {
        args: ['-x'],
        udfs: {},
      }
      function set(setting, value)
      {
        if(!lodash.isUndefined(settings[setting]))
          settings[setting] = value;
      };
      function get(setting)
      {
        return lodash.isUndefined(settings[setting]) ? null : settings[setting];
      }
    });
