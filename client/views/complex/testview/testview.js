//this is a test view and should not be included in final build
'use strict';

angular.module('hog')
  .config(function (  $stateProvider ) {
        $stateProvider
            .state('home.complex.test',
            {
                url: '/testview',
                views:{
                    list: {
				        templateUrl: '/views/complex/testview/testview.complex.html',
				        controller: 'TestComplexCtrl',
						controllerAs: 'vm'
                    }
                }
            });
  });
