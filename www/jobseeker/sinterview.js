"use strict";
app.controller('sInterviewCtrl', function ($q, $scope, $rootScope, CONFIG, $stateParams, $ionicActionSheet, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate, $firebaseArray, $ionicPopup, $http, $ionicLoading, AuthUser) {


  $scope.init = function () {
    AuthUser.user()
      .then(function (result) {
          console.log(result)

          var interviewRef = firebase.database().ref('activity/interview').orderByChild('userId').equalTo($rootScope.userid)
          interviewRef.on('value', function (snap) {
            var data = snap.val()
            $scope.interviewList = [];
            angular.forEach(data, function (card) {
              var userDataRef = firebase.database().ref('user/' + card.userId + '/name');
              userDataRef.once('value', function (snap) {
                card.name = snap.val()
                $scope.interviewList.push(card)

              })
            })
          })

        }, function (error) {
          console.log(error);
          // error
        }
      );
  };


  $scope.$watch('interviewList', function (newValue, oldValue) {
    console.log('input.message $watch, newValue ', $scope.interviewList);

  });
});

