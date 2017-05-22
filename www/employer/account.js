"use strict";

app.controller('eAccountCtrl', function (AuthUser, $timeout, $scope, $rootScope, CONFIG, $ionicModal, $http, $ionicSlideBoxDelegate, $ionicActionSheet, $cordovaCamera, $ionicPopover, $state, $ionicPopup, $ionicLoading, $ionicPlatform) {

  // Config Slide function
  // End Config Slide function

  //Set Current Store

  $scope.setCurrentStore = function (storeId) {
    $rootScope.storeIdCurrent = storeId;
    var setCurrent = firebase.database().ref('user/' + $rootScope.userId)
    setCurrent.update({currentStore: storeId});
    console.log({currentStore: storeId});
    $scope.loadCurrentStore(storeId)
    $scope.closePopover();
  };

  $scope.loadCurrentStore = function (storeId) {
    var storeDataCurrent = firebase.database().ref('store/' + storeId);
    storeDataCurrent.on('value', function (snap) {
      $timeout(
        $rootScope.storeData = snap.val()
        , 100
      );
      console.log($rootScope.storeData);
    });
  };
  $scope.getListStore = function (userId) {
    if (!$scope.storeList) {
      var storeListRef = firebase.database().ref('store').orderByChild('createdBy').equalTo(userId);
      storeListRef.on('value', function (snap) {
        $timeout(function () {
          $scope.storeList = snap.val()
          console.log($scope.storeList)
        })
      })
    }
  };

  // Change Store

  // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('employer/popover/change-store.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function ($event) {
    console.log('pop')
    $scope.popover.show($event);
  };
  $scope.closePopover = function () {
    $scope.popover.hide();
  };


})
