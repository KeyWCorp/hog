'use strict';

angular.module('hog')
  .config(function (  $stateProvider ) {
        $stateProvider
            .state('home.complex.new',
            {
                url: '/new',
                views:{
                    new: {
				        templateUrl: '/views/complex/new/new.complex.html',
				        controller: 'NewComplexCtrl',
						controllerAs: 'vm'
                    }
                }
            });
  });
