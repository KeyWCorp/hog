/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


angular.module('pig.filters', [])
.filter('replaceWithSpaces', function() {
  return function(data) {
    return data.replace(/_/g, ' ');
  };
})
.filter('orderObjectBy', function(lodash) {
  return function(items, field, reverse, tolower) {
    var filtered = [];

    angular.forEach(items, function(item) {
      filtered.push(item);
    });

    filtered.sort(function (a, b) {
      if (tolower) {
        tmp_a = lodash.toLower(a[field]);
        tmp_b = lodash.toLower(b[field]);
        return (tmp_a > tmp_b ? 1 : -1);
      }
      return (a[field] > b[field] ? 1 : -1);
    });

    if(reverse) filtered.reverse();

    return filtered;
  };
});
