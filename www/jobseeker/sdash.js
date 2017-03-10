"use strict";

app.controller('sDashCtrl', function ($scope, $state, $firebaseArray, $http
  , CONFIG
  , AuthUser
  , $window
  , $cordovaToast
  , $cordovaLocalNotification
  , $cordovaSocialSharing
  , $ionicLoading
  , $ionicPlatform
  , $ionicPopover
  , $log
  , $rootScope
  , $ionicModal
  , $ionicSlideBoxDelegate
  , $ionicPopup
  , $timeout) {


  $scope.init = function () {
    $rootScope.storeData = {};
    $ionicPlatform.registerBackButtonAction(function (event) {
      event.preventDefault();
    }, 100);

    AuthUser.user()
      .then(function (result) {
          console.log(result)
          $scope.getUserFiltered()
        }, function (error) {
          console.log(error)
          // error
        }
      );
  }

  $scope.$back = function () {
    window.history.back();
  };
  $scope.onReadySwiper = function (swiper) {
    console.log('ready');
    $scope.swiper = swiper;
    $scope.swiper.update();

  };


  $scope.onTouch = function (swiper) {
    $scope.swiper = swiper;
    $scope.swiper.update();

    console.log($scope.swiper.activeIndex);
    if ($scope.swiper.activeIndex == $scope.limit - 1) {
      $scope.limit = $scope.limit + 5;
    }
  };


  $scope.filterSearch = function () {
    if (!$scope.newfilter) {
      $scope.newfilter = {};
    }
    $scope.clearFilter =function () {
      $scope.newfilter = {}
    }
    $ionicModal.fromTemplateUrl('jobseeker/modals/filter.html', {
      scope: $scope,
      animation: 'animated _zoomOut',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalProfile = modal;
      $scope.modalProfile.show();
      $scope.cancel = function () {
        $scope.modalProfile.hide();

      };
      $scope.selectjob = function (selectedjob) {
        $scope.newfilter.job = selectedjob;
        console.log('select', $scope.newfilter)

      };
      $scope.showjob = function () {

        $ionicPopup.confirm({
          title: 'Vị trí bạn đang cần tuyển',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'employer/popup/select-job.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-dark bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            console.log('You are sure');
            console.log('select', $scope.newfilter)
          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.showtime = function () {
        $scope.selecttime = function (selectedtime) {
          $scope.newfilter.time = selectedtime;
          console.log('select', $scope.newfilter)
        };
        $ionicPopup.confirm({
          title: 'Ca làm việc',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/select-time.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-dark bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            console.log('You are sure');

          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.createHospital = function () {
        var uid = firebase.auth().currentUser.uid;
        var filtersRef = firebase.database().ref('filter/' + uid);

        console.log($scope.newfilter);
        filtersRef.update($scope.newfilter)
        $scope.modalProfile.hide();
        $scope.getUserFiltered();
      };
    });
  };
  $scope.getUserFiltered = function () {
    // $ionicLoading.show({
    //   template: '<p>Đang tải dữ liệu ứng viên...</p><ion-spinner></ion-spinner>'
    // });
    var filtersRef = firebase.database().ref('filter/' + $rootScope.userid);
    filtersRef.on('value', function (snap) {
      $scope.newfilter = snap.val();

      if ($scope.newfilter) {
        $scope.newfilter.userid = $rootScope.userid;
        console.log($scope.newfilter);
        $http({
          method: 'GET',
          url: CONFIG.APIURL + '/api/employer',
          params: $scope.newfilter
        }).then(function successCallback(response) {
          console.log("respond", response.data);
          $rootScope.storeData = response.data;
          $ionicLoading.hide();
        })
      } else {
        $ionicLoading.hide();
      }
    });
  };


  $scope.slideHasChanged = function (index) {
    console.log('slideHasChanged');
    $scope.slideIndex = index
  };

  $scope.slideTo = function (index) {
    $ionicSlideBoxDelegate.slide(index);
  };
  $scope.deviceHeight = window.innerHeight;

  $scope.slideIndex = 1;
// to logout

  $scope.share = function () {
    $cordovaSocialSharing
      .shareViaFacebook("Tuyển nhân viên nhanh chóng và hiệu quả!", "", 'https://www.facebook.com/jobovietnam')
      .then(function (result) {
        // Success!
      }, function (err) {
        // An error occurred. Show a message to the user
      });
  };

  $scope.matchlike = "";

  if (!$rootScope.userliked) {
    $rootScope.userliked = [];
  }
  if (!$rootScope.userdisliked) {
    $rootScope.userdisliked = [];
  }


  $scope.applyThis = function (id, key) {
    if ($scope.selectedJob && $scope.selectedJob[id] && $scope.selectedJob[id][key]) {
      delete $scope.selectedJob[id][key]
    } else {

      if (!$scope.selectedJob) {
        $scope.selectedJob = {}
      }
      if (!$scope.selectedJob[id]) {
        $scope.selectedJob[id] = {}
      }
      $scope.selectedJob[id][key] = true;
    }
  };
  /*  asdas = {
   $$hashKey: "object:39"

   address: "195 Đội Cấn, Ba Đình, Hà Nội, Vietnam"

   createdAt: 1488170787774

   createdBy: "j2sLCo7HsOdN7mPkGQSjFPLoOfx2"

   distance: 2.1

   industry: "banle"

   job: {banhang: true, chamsockhachhang: true}

   location: {lat: 21.035079, lng: 105.823692}

   photourl: "img/restaurant.png"

   starCount: 0

   storeKey: "-Kdxt195aFPl0LOBrtFd"

   storeName: "Cowoboy Jack"
   }*/

  $scope.like = function (card, action) {

    var likedId = card.storeKey;
    var likeActivity = firebase.database().ref('activity/like/' + likedId + ':' + $rootScope.userid);

    if (card.likeMe) {
      likeActivity.update({
        matchedAt: new Date().getTime(),
        status: 1,
        jobstore: $scope.selectedJob[likedId]
      });
      itsAMatch($rootScope.storeIdCurrent, likedId)
    } else {
      likeActivity.update({
        createdAt: new Date().getTime(),
        type: 2,
        status: action,
        jobUser: $scope.selectedJob[likedId],
        employerId: card.createdBy,
        storeId: card.storeKey,
        userId: $rootScope.userid,
      })
    }
  };

  $scope.chatto = function (id) {
    $state.go("employer.chats", {to: id, slide: 1})
  };

  $scope.limit = 5;

  function itsAMatch(storeid, userid) {
    $ionicModal.fromTemplateUrl('employer/modals/ematch.html', {
      scope: $scope,
      animation: 'animated _fadeOut',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalMatch = modal;
      $scope.modalMatch.show();

      var storeRef = firebase.database().ref('/store/' + storeid);
      storeRef.once('value', function (snap) {
        $scope.storeData = snap.val()
      });

      var userRef = firebase.database().ref('/user/' + userid);
      userRef.once('value', function (snap) {
        $scope.userData = snap.val()
      });

      $scope.chatto = function (id) {
        $state.go("employer.chats", {to: id, slide: 1})
      };

      $scope.hideMatch = function () {
        $scope.modalMatch.hide();
      }
    });
  }
})
;
