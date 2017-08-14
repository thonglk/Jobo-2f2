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
  , $sce
  , $rootScope
  , $ionicModal
  , $ionicSlideBoxDelegate
  , $ionicPopup
  , $timeout) {

  $scope.init = function () {

    $rootScope.service.user().then(function (data) {
      if ($rootScope.storeData) {
        $scope.initData($rootScope.storeData)

      } else {

        $scope.$on('storeListen', function (event, storeData) {
          console.log('Init data', storeData);
          $scope.initData(storeData)
        });
      }
    });
    /*if ($rootScope.storeData) {
      $scope.initData($rootScope.storeData)
    } else {
      $scope.$on('storeListen', function (event, storeData) {
        console.log('Init data', storeData);
        $scope.initData(storeData)
      });
    }*/

  };

  $scope.calculateAge = function calculateAge(birthday) {
        var ageDifMs = Date.now() - new Date(birthday).getTime(); // parse string to date
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      };
  $scope.initData = function (storeData) {
    if (!storeData) {
      $state.go('store', {id: null})
      $cordovaToast.showShortTop('Hãy tạo cửa hàng đầu tiên của bạn')
    } else if (!$rootScope.storeData.job) {
      $state.go('store', {id: 'job'})
      $cordovaToast.showShortTop('Bạn đang cần tuyển vị trí gì?')

    } else {
      $rootScope.usercard = []

      $rootScope.newfilter = {
        job: $rootScope.service.getfirst($rootScope.storeData.job),
        userId: $rootScope.storeId,
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
    $rootScope.usercard = []
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

  $rootScope.maxMatchUser = 0


  $scope.getUserFiltered = function (newfilter) {
    if (!newfilter.p){
      newfilter.p = 1;
    }
    if (!newfilter.userId){
      newfilter.userId = $rootScope.storeId;
    }
    console.log('filtering..', newfilter)

    $scope.loading = true
    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/api/users',
      params: newfilter
    }).then(function successCallback(response) {
      console.log("respond", response);
      $scope.response = response.data;
      if ($rootScope.maxMatchUser == 0) {
        $rootScope.maxMatchUser = $scope.response.data[0].match
        console.log($rootScope.maxMatchUser)
      }

      $timeout(function () {
        if (!$rootScope.usercard) {
          $rootScope.usercard = []
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
          /*firebase.database().ref('presence/' + profileData.userId).on('value', function (snap) {
            if(snap.val()){
              $scope.response.data[i].presence = snap.val()
            }
          })*/

        }
        $rootScope.usercard = $rootScope.usercard.concat($scope.response.data);
        $timeout(function () {
          console.log('$rootScope.usercard', $rootScope.usercard)
          $scope.swiper.update();
          $ionicLoading.hide()
          $scope.loading = false
          if($rootScope.newfilter.p == 1){
            $cordovaToast.showShortTop('Chúng tôi đã tìm thấy ' + $scope.response.total + ' ứng viên phù hợp với vị trí của bạn')
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
    $scope.swiper.update();
    console.log('touched', $scope.swiper.activeIndex);
    if ($scope.swiper.activeIndex == $rootScope.usercard.length - 5) {
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
  $scope.editjob = function () {
    if (!$rootScope.newfilter) {
      $rootScope.newfilter = {};
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
      $scope.clearFilter = function () {
        $rootScope.newfilter = {}
      }


      $scope.showjob = function () {
        if (!$scope.newHospital) {
          $scope.newHospital = {}
        }
        if ($rootScope.newfilter.job) {
          $scope.newHospital.job = $rootScope.newfilter.job

        }
        $ionicPopup.confirm({
          title: 'Vị trí bạn đang cần tuyển',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/select-job.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-dark bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            console.log('You are sure');
            $rootScope.newfilter.job = $scope.newHospital.job;
            console.log('select', $rootScope.newfilter);

          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.showtime = function () {
        if (!$scope.newHospital) {
          $scope.newHospital = {}
        }
        $scope.newHospital.time = $rootScope.newfilter.time;
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
            $rootScope.newfilter.time = $scope.newHospital.time;
            console.log('select', $rootScope.newfilter);

          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.createHospital = function (newfilter) {
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner><br>' + ' Đang lọc ứng viên...',
        })
        console.log('$rootScope.newfilter', $rootScope.newfilter)
        console.log('newfilter', newfilter)


        /*if ($rootScope.newfilter.public) {
          var newJobRef = firebase.database().ref('store/' + $rootScope.storeId + '/job/' + $rootScope.newfilter.job);
          newJobRef.update(true)
          var jobRef = firebase.database().ref('job/' + $rootScope.storeId + ':' + $rootScope.newfilter.job);
          jobRef.update($rootScope.newfilter)
        }*/
        $scope.modalProfile.hide();
        $rootScope.usercard = []
        $scope.getUserFiltered($rootScope.newfilter);
        $rootScope.service.Ana('filter', $rootScope.newfilter)
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

      $rootScope.service.JoboApi('on/store',{storeId: storeid}).then(function (data) {
        $scope.storeData = data.data;
      });
      /*var storeRef = firebase.database().ref('/store/' + storeid);
      storeRef.once('value', function (snap) {
        $scope.storeData = snap.val()
      });*/

      $rootScope.service.JoboApi('on/user',{userId: userId}).then(function (data) {
        $scope.userData = data.data;
      });
      /*var userRef = firebase.database().ref('/user/' + userId);
      userRef.once('value', function (snap) {
        $scope.userData = snap.val()
      });*/

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
