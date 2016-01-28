'use strict';
 
angular.module('hog')
  .config(function (  $stateProvider ) {
        $stateProvider
            .state('home.complex',
            {
                url: 'complex',
                views: {
                    '': {
                        templateUrl: 'views/complex/complex.html',
                        controller: 'ComplexCtrl',
                        controllerAs: 'vm'
                    },
                    // sub-state insert
                    list: {
				        templateUrl: '/views/complex/list/list.complex.html',
				        controller: 'ListComplexCtrl',
						controllerAs: 'vm'
					},
                   /* edit: {
						templateUrl: 'edit.complex.html',
						controller: 'EditComplexCtrl',
                        controllerAs: 'vm'
                    },
                    new: {
                        templateUrl: 'new.complex.html',
                        controller: 'NewComplexCtrl',
                        controllerAs: 'vm'
                    },*/
                }
            });
  });
