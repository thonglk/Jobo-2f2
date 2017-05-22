"use strict";

app.controller('sAccountCtrl', function (AuthUser, $timeout, $scope, $ionicPlatform,$rootScope, CONFIG, $ionicModal, $http, $ionicSlideBoxDelegate, $ionicActionSheet, $cordovaCamera, $ionicPopover, $state, $ionicPopup, $ionicLoading) {


  $scope.init = function () {
    $ionicPlatform.registerBackButtonAction(function (event) {
      event.preventDefault();
    }, 100);
  }
})
