"use strict";

app.controller("ViewStoreCtrl", ['$scope', '$stateParams', '$sce', '$ionicModal', '$rootScope', '$http', 'CONFIG', function ($scope, $stateParams, $sce, $ionicModal, $rootScope, $http, CONFIG) {
  $scope.deviceHeight = window.innerHeight;

  $scope.$back = function () {
    window.history.back();
  };

  $scope.trustSrc = function (src) {
    return $sce.trustAsResourceUrl(src);
  };

  $scope.calculateAge = function calculateAge(birthday) { // birthday is a date
    var ageDifMs = new Date().getFullYear() - birthday
    return ageDifMs
  };

  $scope.profileId = $stateParams.id;
  firebase.database().ref('store/' + $scope.profileId).once('value', function (snap) {
    $scope.userData = snap.val()

  })
// Attach an asynchronous callback to read the data at our posts reference
//   $http({
//     method: 'GET',
//     url: CONFIG.APIURL + "/api/profile",
//     params: {id: $scope.profileId}
//   }).then(function (response) {
//     console.log(response.data);
//     $scope.userData = response.data
//   })


}]);
