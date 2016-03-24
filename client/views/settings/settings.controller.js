'use strict';

angular.module('hog')
  .controller('SettingsCtrl', function ($mdToast, $log, Settings) {

    var vm = this;
    angular.extend(vm, {
      name: 'SettingsCtrl',
      ins: Settings.list(),
      save: function(data)
      {
        //TODO: save the settings to the server
        $log.debug(data);
        var goodCount = 0;
        var badCount = [];
        data.forEach(
          function(e)
          {
            $log.debug(e);
            Settings.update(e)
              .then(
                function(datas)
                {
                   $log.debug('data');
                  goodCount++;
                  if(goodCount == data.length)
                  {
                    vm.showSavedToast();
                  }
                },
                function(err)
                {
                    $log.error('err');
                    badCount.push(err);
                     if (badCount.length > 0)
                      {
                        vm.showErrorToast(badCount);
                      }
                });
          });
        $log.debug(goodCount);
      },
      showSavedToast: function() {
        /*$mdToast.show(
          $mdToast.simple()
            .textContent('Settings Saved!')
            .position({
              bottom: false,
              top: true,
              left: false,
              right: true
            })
            .hideDelay(3000)
        )*/
        $mdToast.showSimple('Settings Saved!');
      },
      showErrorToast: function(err) {
        $mdToast.show(
          $mdToast.simple()
            .textContent('Error: ' + err +'!')
            .position({
              bottom: false,
              top: true,
              left: false,
              right: true
            })
            .hideDelay(3000)
        )
      },
      udfs: {displayName: 'User Defined Functions (UDFS):', data: []},
    });
  vm.showSavedToast();
  Settings.list()
    .then(
      function(data)
      {
        vm.ins = data;
        //vm.udfs = data[1];
      });
  Settings.getp('udfs')
    .then(
      function(data)
      {
        vm.udfs = data.json;
      });
});