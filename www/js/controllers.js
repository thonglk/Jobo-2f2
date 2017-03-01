angular.module('starter.controllers', [])
  .controller('DashCtrl', function ($scope) {
  })


  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  })
  .controller('convertCtrl', function ($scope, $rootScope, $ionicLoading) {

    $scope.showAna = function () {
      $ionicLoading.show({
        template: '<p>Đang tải dữ liệu...!</p><ion-spinner></ion-spinner>'
      });
      firebase.database().ref('user/employer').on('value', function (snap) {
        $ionicLoading.hide();
        $rootScope.dataEmployer = snap.val();
        $rootScope.cardjob = [];
        angular.forEach($rootScope.dataEmployer, function (card) {
          if (card.interest && card.interest.job) {
            for(var key in card.interest.job) {
              $rootScope.cardjob.push(key)
            }
          }
        })
        console.log($rootScope.cardjob)


      })
    }


    $scope.convertStore = function () {
      // chuyển store
      $ionicLoading.show({
        template: '<p>Đang tải dữ liệu...!</p><ion-spinner></ion-spinner>'
      });
      firebase.database().ref('user/employer').on('value', function (snap) {
        $rootScope.data = snap.val();
        console.log('done')
        angular.forEach($rootScope.data, function (card) {
          console.log(card);

          $scope.newStoreKey = firebase.database().ref('store').push().key;
          var storeData = {
            storeKey: $scope.newStoreKey,
          };
          if (card.location) {
            storeData.address = card.location.address;
            storeData.location = card.location.location;
          }
          if (card.name) {
            storeData.storeName = card.name;

          }
          if (card.userid) {
            storeData.createdBy = card.userid;
          }

          if (card.industry) {
            storeData.industry = card.industry;
          }

          if (card.dateCreated) {
            storeData.createdAt = card.dateCreated;
          }

          storeData.react = {};

          if (card.stars) {
            delete card.stars.start;
            storeData.react.apply = card.stars;

          }
          if (card.disstars) {
            delete card.disstars.start;
            storeData.react.dislike = card.disstars;
          }
          if (card.match) {
            storeData.react.match = card.match;

          }

          //convert store
          var newStoreRef = firebase.database().ref('store/' + $scope.newStoreKey);

          newStoreRef.update(storeData);

          //convert job
          if (card.interest && card.interest.job) {
            var Jobcard = card.interest.job;
            for (var jobKey in  Jobcard) {
              var jobRef = firebase.database().ref('job/' + $scope.newStoreKey + '/' + jobKey);
              var dataSave = {
                job: jobKey,
                createdByStore: $scope.newStoreKey,
                createdById: card.userid,
                createdAt: firebase.database.ServerValue.TIMESTAMP
              }
              console.log(dataSave);

              jobRef.update(dataSave);
            }
          }

          console.log(storeData);

        })
        $ionicLoading.hide()
      })

    }

  });

