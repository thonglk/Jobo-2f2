'use strict';
app.controller("eSettingCtrl", function ($scope, $rootScope, AuthUser, $ionicModal, $http, $ionicLoading, $state, $cordovaSocialSharing, $timeout) {
  $scope.$back = function () {
    window.history.back();
  };

  $scope.init = function () {
    AuthUser.employer().then(function (result) {
      var userRef = firebase.database().ref('user/' + result.userId)
      userRef.on('value', function (snap) {
        $timeout(function () {
          $scope.userData = snap.val()
        }, 10)
      })
    })
  }

  $scope.submit = function () {
    var userRef = firebase.database().ref('user/' + $rootScope.userId)
    userRef.update($scope.userData)
  }

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

    firebase.auth().signOut().then(function () {
      // Sign-out successful.
      console.log("Logout successful");
      $state.go("intro");

    }, function (error) {
      // An error happened.
      console.log(error);
    });

  };


})

