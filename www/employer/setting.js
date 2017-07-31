'use strict';
app.controller("eSettingCtrl", function ($scope, $rootScope, AuthUser, $ionicModal, $http, $ionicLoading, $state, $cordovaSocialSharing, $timeout) {
  $scope.$back = function () {
    window.history.back();
  };



  $scope.share = function () {
    $cordovaSocialSharing
      .shareViaFacebook("Tuyển nhân viên nhanh chóng và hiệu quả!", "", 'https://www.facebook.com/jobovietnam')
      .then(function (result) {
        // Success!
      }, function (err) {
        // An error occurred. Show a message to the user
      });

  }
// to logout
  $scope.doLogout = function () {

    secondary.auth().signOut().then(function () {
      // Sign-out successful.
      console.log("Logout successful");
      $state.go("intro");

    }, function (error) {
      // An error happened.
      console.log(error);
    });

  };


})

