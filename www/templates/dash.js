"use strict";


app.controller('DashCtrl', function ($state, $scope, $ionicLoading, $rootScope, $ionicDeploy, $timeout, $ionicPopup, $snackbar, CONFIG, AuthUser, $http, $ionicSlideBoxDelegate, $cordovaToast) {
  $http({
    method: 'GET',
    url: CONFIG.APIURL + '/api/dashboard'
  }).then(function successCallback(response) {
    console.log("respond", response);
    $timeout(function () {
      $scope.UserCard = response.data.jobseeker;
      $scope.StoreCard = response.data.employer
    })
  }, function (error) {
    console.log(error)
  });

  $scope.checkuser = function () {
    console.log('check Auth')
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner></ion-spinner>'
    });
    firebase.auth().onAuthStateChanged(function (user) {
        if (user && !$rootScope.registering) {
          $rootScope.userId = firebase.auth().currentUser.uid;
          firebase.database().ref('user/' + $rootScope.userId + '/type').once('value', function (snap) {
            console.log(snap.val());

            if (snap.val() == 1) {
              $state.go('employer.dash')
            }
            if (snap.val() == 2) {
              $state.go('jobseeker.dash')
            }

            $rootScope.service.Ana('autologin', {type: 'normal'});
            $ionicLoading.hide();
            $cordovaToast.showShortTop("Đăng nhập thành công! Đang chuyển hướng...")
          });
        } else {
          console.log("Hãy đăng nhập!");

          $ionicLoading.hide();
        }
      }
    );

  };


  $scope.shortFilter = function () {
    $scope.checkuser()
    $state.go('intro')
  };


})
