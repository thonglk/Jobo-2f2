"use strict";

app.controller('AccountCtrl', function (AuthUser, $timeout, $scope, $ionicPlatform,$rootScope, CONFIG, $ionicModal, $http, $ionicSlideBoxDelegate, $ionicActionSheet, $cordovaCamera, $ionicPopover, $state, $ionicPopup, $ionicLoading) {


  $scope.init = function () {

    $ionicPlatform.registerBackButtonAction(function (event) {
      event.preventDefault();
    }, 100);

    AuthUser.user()
      .then(function (result) {
          console.log(result)
          firebase.database().ref('profile/' + result.userid).on('value', function (snap) {
            $scope.userData = snap.val()
          })
        }, function (error) {
          console.log(error)
          // error
        }
      );
  }

})
