"use strict";
app.controller('eNotificationCtrl', function ($q, $scope, $rootScope, CONFIG, $stateParams, $ionicActionSheet, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate, $firebaseArray, $ionicPopup, $http, $ionicLoading, AuthUser) {


  $scope.init = function () {
    AuthUser.employer()
      .then(function (result) {
          console.log(result)
          $rootScope.notification = []
          var notificationRef = firebase.database().ref('notification/' + $rootScope.storeIdCurrent)
          notificationRef.on('child_added', function (snap) {
            $rootScope.notification.push(snap.val())
          })

        }, function (error) {
          console.log(error);
          // error
        }
      );
  };


  $scope.$watch('interviewList', function (newValue, oldValue) {
    console.log('input.message $watch, newValue ');

  });
});

