angular.module('pig.filters', [])
.filter('replaceWithSpaces', function() {
  return function(data) {
    return data.replace(/_/g, ' ');
  };
});
