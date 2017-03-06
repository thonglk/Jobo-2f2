angular.module('starter.services', [])
  .service('myService', function (CacheFactory) {
    var profileCache;

    // Check to make sure the cache doesn't already exist
    if (!CacheFactory.get('profileCache')) {
      profileCache = CacheFactory('profileCache');
    }
  })

  // .service('AuthFG', function ($state) {
  //
  //   }
  // );

app.filter('myLimitTo', [function () {
  return function (obj, limit) {
    var keys = Object.keys(obj);
    if (keys.length < 1) {
      return [];
    }

    var ret = new Object,
      count = 0;
    angular.forEach(keys, function (key, arrayIndex) {
      if (count >= limit) {
        return false;
      }
      ret[key] = obj[key];
      count++;
    });
    return ret;
  };
}]);
