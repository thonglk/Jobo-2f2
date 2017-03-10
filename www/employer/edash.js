"use strict";

app.controller('eDashCtrl', function ($scope, $state, $firebaseArray, $http
  , CONFIG
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


  $scope.initSlide = function () {
    var slidesPerView;
    $scope.width = $window.innerWidth;
    if ($scope.width > 1024) {
      slidesPerView = 3
    }
    if ($scope.width <= 1024 && $scope.width > 767) {
      slidesPerView = 2
    }

    if ($scope.width <= 767) {
      slidesPerView = 1

    }
    return slidesPerView
  }

  $scope.init = function () {

    $ionicPlatform.registerBackButtonAction(function (event) {
      event.preventDefault();
    }, 100);
    $rootScope.registering = false;


    var user = firebase.auth().currentUser;

    if (user) {
      // User is signed in.
      $rootScope.userid = user.uid;
      console.log("i'm in " + $rootScope.userid);


      var tokenRef = firebase.database().ref("token/" + $rootScope.userid);
      if ($rootScope.tokenuser) {
        tokenRef.update({
          userid: $rootScope.userid,
          tokenId: $rootScope.tokenuser

        })
      }
      ;

      if (!$rootScope.usercurent) {
        var userRef = firebase.database().ref('user/' + $rootScope.userid);
        userRef.once('value', function (snapshot) {
          $rootScope.usercurent = snapshot.val();
          $rootScope.storeIdCurrent = $rootScope.usercurent.currentStore;
          $rootScope.loadCurrentStore();
          console.log(" with " + $rootScope.storeIdCurrent)

          $scope.getUserFiltered()
        });
      } else {
        $scope.getUserFiltered()
      }
      $rootScope.loadCurrentStore = function () {
        var storeDataCurrent = firebase.database().ref('store/' + $rootScope.storeIdCurrent);
        storeDataCurrent.on('value', function (snap) {
          $rootScope.storeDataCurrent = snap.val()
          console.log($rootScope.storeDataCurrent);
        });
      }


    } else {
      // No user is signed in.
    }



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
//
// //Tinh khoang cach
// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//   var R = 6371; // Radius of the earth in km
//   var dLat = deg2rad(lat2 - lat1);  // deg2rad below
//   var dLon = deg2rad(lon2 - lon1);
//   var a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2)
//     ;
//   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   var x = R * c; // Distance in km
//   var n = parseFloat(x);
//   x = Math.round(n * 10) / 10;
//   return x;
// }
//
// function deg2rad(deg) {
//   return deg * (Math.PI / 180)
// }
//
// //end tinh khoang cach

  $scope.getUserFiltered = function () {
    // $ionicLoading.show({
    //   template: '<p>Đang tải dữ liệu ứng viên...</p><ion-spinner></ion-spinner>'
    // });
    var filtersRef = firebase.database().ref('filter/' + $rootScope.userid);
    filtersRef.on('value', function (snap) {
      $scope.newfilter = snap.val();

      if ($scope.newfilter) {
        $scope.newfilter.userid = $rootScope.storeIdCurrent;
        console.log($scope.newfilter);
        $http({

          method: 'GET',
          url: CONFIG.APIURL + '/api/users',
          params: $scope.newfilter
        }).then(function successCallback(response) {
          console.log("respond", response.data);
          $scope.usercard = response.data;
          $ionicLoading.hide();
        })

      } else {
        $ionicLoading.hide();
      }
    });
  };


  $scope.editjob = function () {
    if (!$scope.newfilter) {
      $scope.newfilter = {};
    }
    $ionicModal.fromTemplateUrl('employer/modals/filter.html', {
      scope: $scope,
      animation: 'animated _zoomOut',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalProfile = modal;
      $scope.modalProfile.show();
      $scope.cancel = function () {
        $scope.modalProfile.hide();

      };
      $scope.clearFilter =function () {
        $scope.newfilter = {}
      }

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
        filtersRef.set($scope.newfilter)
        $scope.modalProfile.hide();
        $scope.getUserFiltered();
      };
    });
  };
  $scope.gotosprofile = function (id) {
    window.location.href = "#/viewprofile/" + id
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

  $scope.like = function (card, action) {

    var likedId = card.userid;
    var likeActivity = firebase.database().ref('activity/like/' + $rootScope.storeIdCurrent + ':' + likedId);

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
        type: 1,
        status: action,
        jobStore: $scope.selectedJob[likedId],
        employerId: $rootScope.userid,
        storeId:$rootScope.storeIdCurrent,
        userId: likedId
      })
    }
  };

  $scope.chatto = function (id) {
    $state.go("employer.chats", {to:id,slide:1})
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
        $state.go("employer.chats", {to:id,slide:1})
      };

      $scope.hideMatch = function () {
        $scope.modalMatch.hide();
      }
    });
  }
})
;
