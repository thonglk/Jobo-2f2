angular.module('starter.services', [])
  .service('myService', function (CacheFactory) {
    var profileCache;

    // Check to make sure the cache doesn't already exist
    if (!CacheFactory.get('profileCache')) {
      profileCache = CacheFactory('profileCache');
    }
  })

  .service('AuthUser', function ($rootScope, $q) {

    this.employer = function (data) {
      var output = [],
        deferred = $q.defer();

      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          $rootScope.userid = user.uid;
          var setCurrent = firebase.database().ref('user/' + $rootScope.userid)
          setCurrent.once('value', function (snap) {
            var dataCurrent = snap.val();
            if (dataCurrent) {
              $rootScope.storeIdCurrent = dataCurrent.currentStore;
              output = {
                userid: $rootScope.userid,
                storeIdCurrent: $rootScope.storeIdCurrent
              }
              deferred.resolve(output);
            } else {
              console.log("i'm in " + $rootScope.userid + 'with' + "no store")
            }
          });
          // User is signed in.
        } else {
          data = "None";
          // No user is signed in.
        }

      })


      return deferred.promise;
    }

    this.user = function (data) {
      var output = [],
        deferred = $q.defer();

      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          $rootScope.userid = user.uid;
          output = {
            userid: $rootScope.userid
          }
          deferred.resolve(output);
          // User is signed in.
        } else {
          data = "None";
          // No user is signed in.
        }

      })
      return deferred.promise;
    }
  })
;

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
