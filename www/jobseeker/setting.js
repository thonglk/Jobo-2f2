'use strict';
app.controller("sSettingCtrl", function ($scope, $ionicModal, $http, $ionicLoading, $state, $cordovaSocialSharing) {
  $ionicLoading.show({
    template: '<ion-spinner class="spinner-positive"></ion-spinner>'
  });
  var uid = firebase.auth().currentUser.uid;
  $scope.uid = firebase.auth().currentUser.uid;
  console.log('im', $scope.uid)
  var userRef = firebase.database().ref('user/employer/' + uid)
  userRef.on("value", function (snapshot) {
    $scope.usercurent = snapshot.val();
    console.log('im', $scope.usercurent)
    $ionicLoading.hide()
  });


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

