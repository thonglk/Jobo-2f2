"use strict";
app.controller('sNotificationCtrl', function ($q, $scope, $rootScope, CONFIG, $stateParams, $ionicActionSheet, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate, $firebaseArray, $ionicPopup, $http, $ionicLoading, AuthUser) {


  $scope.init = function () {
    AuthUser.user()
      .then(function (result) {
          console.log(result)

        var notificationRef = firebase.database().ref('notification/' + $rootScope.userid)
        notificationRef.on('value', function (snap) {
          $timeout(function () {
            $scope.notification = snap.val()
            console.log($scope.notification)

          },10)

        })
        }, function (error) {
          console.log(error);
          // error
        }
      );
  };

  $scope.timeAgo = function (timestamp) {
    var time;
    var now = new Date().getTime()
    var a = now - timestamp

    var minute = (a - a % 60000) / 60000
    if (minute < 60) {
      time = minute + " phút trước"
    } else {
      var hour = (minute - minute % 60) / 60 + 1
      if (hour < 24) {
        time = hour + " giờ trước"
      } else {
        var day = (hour - hour % 24) / 24 + 1
        if (hour < 24) {
          time = day + " ngày trước"
        } else {
          var month = (day - day % 30) / 30 + 1
          if (hour < 24) {
            time = month + " tháng trước"
          } else {
            var year = (month - month % 12) / 12 + 1
            time = year + " năm  trước"
          }
        }
      }
    }

    return time;
  }
  $scope.$watch('interviewList', function (newValue, oldValue) {
    console.log('input.message $watch, newValue ', $scope.interviewList);

  });
});

