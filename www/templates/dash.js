"use strict";


app.controller('DashCtrl', function ($state, $scope, $ionicLoading, $rootScope, $ionicDeploy, $timeout, $ionicPopup, $snackbar, CONFIG, AuthUser, $http, $ionicSlideBoxDelegate, $cordovaToast) {
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

          $ionicLoading.hide();
        }
      }
    );

  };

  $scope.cardDestroyed = function (index) {
    $scope.UserCard.splice(index, 1);

  };

  $scope.addCard = function () {
    $scope.newfilter.p++
    $scope.getUserFiltered($scope.newfilter)

  }

  $scope.refreshCards = function () {
    // Set $scope.cards to null so that directive reloads
    $scope.UserCard = null;
    $timeout(function () {
      $scope.addCard()
    });
  }

  $scope.$on('removeCard', function (event, element, card) {
    var discarded = $scope.cards.master.splice($scope.cards.master.indexOf(card), 1);
    $scope.cards.discards.push(discarded);
  });

  $scope.cardSwipedLeft = function (index) {
    console.log('LEFT SWIPE');
    var card = $scope.UserCard[index];
    // $scope.cards.disliked.push(card);
  };
  $scope.cardSwipedRight = function (index) {
    console.log('RIGHT SWIPE');
    var card = $scope.UserCard[index];

  };

  function like(param) {
    $log.info(param)
  }

  function info() {
    $log.info('info popup');
  }

  $scope.onTouch = function () {
    $ionicSlideBoxDelegate.enableSlide(false);
    console.log('touched');
  }
  $scope.onRelease = function () {
    $ionicSlideBoxDelegate.enableSlide(true);
    console.log('released');
  }


  $scope.shortFilter = function () {
    $state.go('intro')
    $cordovaToast.showShortTop('Bạn phải đăng nhập để thực hiện tác vụ này!');
  };


})
