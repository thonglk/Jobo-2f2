
"use strict";

app.controller('sJobCtrl', function ($scope, $state, $firebaseArray, $http
  , CONFIG
  , $window
  , $cordovaToast
  , $cordovaLocalNotification
  , $cordovaSocialSharing
  , $ionicLoading
  , $ionicPlatform
  , $ionicPopover
  , $log
  , $sce
  , $rootScope
  , $ionicModal
  , $ionicSlideBoxDelegate
  , $ionicPopup
  , $timeout) {

  $scope.init = function () {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner><br>' + ' Đang tải công việc...',
    })
    if ($rootScope.userData) {
      $scope.initData($rootScope.userData)

    } else {
      $scope.$on('handleBroadcast', function (event, userData) {
        console.log('Init data', userData);
        $scope.initData(userData)
      });
    }

  };

  $scope.initData = function (userData) {
    if (!userData) {
      $state.go('profile', {id: null})
      $cordovaToast.showShortTop('Nhà tuyển dụng muốn xem hồ sơ của bạn')
    } else {
      $rootScope.storeCard = []

      $rootScope.newfilter = {
        job: $rootScope.service.getfirst($rootScope.userData.job),
        userId: $rootScope.userId,
        sort: 'match',
        p: 1
      }
      $scope.getUserFiltered($rootScope.newfilter)

    }
  }

  $rootScope.newfilterFilter = function (type, key) {
    $rootScope.newfilter[type] = key
    $rootScope.newfilter.p = 1
    if ($rootScope.newfilter.experience == false) {
      delete $rootScope.newfilter.experience
    }
    if ($rootScope.newfilter.figure == false) {
      delete $rootScope.newfilter.figure
    }

    console.log($rootScope.newfilter)
    $rootScope.storeCard = []
    $scope.getUserFiltered($rootScope.newfilter)
  }
  $scope.loading = false;
  $scope.loadMore = function () {
    console.log('request load')
    if (!$scope.loading && $rootScope.newfilter) {
      $scope.loading = true;
      console.log('loading')
      $rootScope.newfilter.p++
      $scope.getUserFiltered($rootScope.newfilter);
      $timeout(function () {
        $scope.loading = false;
      }, 500)
    }
  }

  $rootScope.maxMatchStore = 0

  $scope.getUserFiltered = function (newfilter) {
    console.log('filtering..', newfilter)

    $scope.loading = true
    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/api/employer',
      params: newfilter
    }).then(function successCallback(response) {
      console.log("respond", response);
      $scope.response = response.data;
      if ($rootScope.maxMatchUser == 0) {
        $rootScope.maxMatchUser = $scope.response.data[0].match
        console.log($rootScope.maxMatchUser)
      }

      $timeout(function () {
        if (!$rootScope.storeCard) {
          $rootScope.storeCard = []
        }

        for (var i in $scope.response.data) {
          var profileData = $scope.response.data[i]
          $scope.response.data[i].matchPer = Math.round($scope.response.data[i].match * 100 / $rootScope.maxMatchUser)

          if (profileData.act) {
            var ref = 'activity/like/' + $rootScope.storeId + ':' + profileData.userId
            firebase.database().ref(ref).on('value', function (snap) {
              $scope.response.data[i].act = snap.val()
            })
          }

          firebase.database().ref('profile/' + profileData.userId + '/presence').on('value', function (snap) {
            if(snap.val()){
              console.log(snap.val())
              $scope.response.data[i].presence = snap.val()
            }
          })
        }

        $rootScope.storeCard = $rootScope.storeCard.concat($scope.response.data);

        $timeout(function () {
          console.log('storeCard', $rootScope.storeCard)
          $scope.swiper.update();
          $ionicLoading.hide();
          $scope.loading = false
          if ($rootScope.newfilter.p == 1) {
            $cordovaToast.showShortTop('Chúng tôi đã tìm thấy ' + $scope.response.total + ' nhà tuyển dụng phù hợp với bạn')
          }
        })
      })
    }, function (error) {
      console.log(error)
      $ionicLoading.hide()
      $scope.loading = false

    })
  };

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
    console.log('touched', $scope.swiper.activeIndex);
    if ($scope.swiper.activeIndex == $rootScope.storeCard.length - 5) {
      console.log('load more')
      $scope.loadMore()
    }
  }
  $scope.onRelease = function () {
    console.log('released');
  }
  $scope.showVideo = function (user) {
    $scope.showVid = user.userId
    $scope.videoTrusted = $sce.trustAsResourceUrl(user.videourl)
  }

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

  function itsAMatch(storeid, userId) {
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

      var userRef = firebase.database().ref('/user/' + userId);
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


