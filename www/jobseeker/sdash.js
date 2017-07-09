"use strict";
app.controller('sDashCtrl', function ($q, $scope, $rootScope, $state, CONFIG, $stateParams, $ionicActionSheet, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate, $firebaseArray, $ionicPopup, $http, $ionicLoading, $ionicModal, $cordovaToast) {
  $scope.init = function () {

    if ($rootScope.userData && $rootScope.userData.location) {
      $scope.initData($rootScope.userData)
    } else {
      $scope.$on('handleBroadcast', function (event, userData) {
        console.log('Init data', userData);
        $scope.initData(userData)
      })
    }
  };

  $scope.initData = function (userData) {
    if (!userData) {
      $state.go('profile')
      $cordovaToast.showShortTop('Hãy cập nhật thông tin hồ sơ của bạn trước')
    } else if (!userData.location) {
      $state.go('profile')
      $cordovaToast.showShortTop('Hãy cập nhật địa chỉ đề tìm việc xung quanh')
    } else {

      $rootScope.newfilter = {
        job: $rootScope.service.getfirst($rootScope.userData.job),
        userId: $rootScope.userId,
        p: 1
      }
      $scope.getJobFiltered($rootScope.newfilter)

    }

  }

  $scope.getJobFiltered = function (newfilter) {
    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/api/job',
      params: newfilter
    }).then(function successCallback(response) {
      $scope.response = response.data;
      if ($rootScope.maxMatchJob == 0) {
        $rootScope.maxMatchJob = $scope.response.data[0].match
        console.log($rootScope.maxMatchJob)
      }
      $timeout(function () {
        if (!$rootScope.jobCard) {
          $rootScope.jobCard = []
        }
        for (var i in $scope.response.data) {

          var jobData = $scope.response.data[i]
          $scope.response.data[i].matchPer = Math.round($scope.response.data[i].match * 100 / $rootScope.maxMatchJob)

          if (jobData.act) {
            var ref = 'activity/like/' + jobData.storeId + ':' + $rootScope.userId
            firebase.database().ref(ref).on('value', function (snap) {
              $scope.response.data[i].act = snap.val()
            })
          }
          firebase.database().ref('presence/store/' + jobData.storeId + '/status').on('value', function (snap) {
            if (snap.val()) {
              $scope.response.data[i].presence = snap.val()
              console.log(snap.val())
            }
          })
        }
        $rootScope.jobCard = $rootScope.jobCard.concat($scope.response.data);


        if ($rootScope.jobCard.length == 0) {

          $ionicLoading.hide();
          $cordovaToast.showShortTop('Chúng tôi đã gửi thông báo tìm ứng viên cho bạn, hãy thử tìm vị trí khác!')

        } else {

          $timeout(function () {
            $scope.swiper.update();
            $ionicLoading.hide();
            $scope.loading = false
            if ($rootScope.newfilter.p == 1) {
              $cordovaToast.showShortTop('Chúng tôi đã tìm thấy ' + $scope.response.total + ' công việc phù hợp với bạn')
            }
          })

        }


      })
    }, function (error) {
      console.log(error)
      $ionicLoading.hide();
      $cordovaToast.showShortTop('Chúng tôi đang nâng cấp dữ liệu, bạn hãy thử lại 1 lúc sau nhé!')
      $scope.loading = false

    })
  }
  $scope.onReadySwiper = function (swiper) {
    console.log('ready');
    $scope.swiper = swiper;
    $scope.swiper.update();
  };

  $scope.onTouch = function (swiper) {
    $scope.swiper = swiper;
    $scope.swiper.update();
    console.log('touched', $scope.swiper.activeIndex);
    if ($scope.swiper.activeIndex == $rootScope.jobCard.length - 5 || !$rootScope.jobCard) {
      console.log('load more')
      $scope.loadMore()
    }
  }
  $scope.onRelease = function () {
    console.log('released');
  }
  $scope.loading = false;
  $scope.loadMore = function () {
    console.log('request load')
    if (!$scope.loading && $rootScope.newfilter) {
      $scope.loading = true;
      console.log('loading')
      $rootScope.newfilter.p++
      $scope.getJobFiltered($rootScope.newfilter);
      $timeout(function () {
        $scope.loading = false;
      }, 500)
    }
  }

  $scope.editjob = function () {
    if (!$rootScope.newfilter) {
      $rootScope.newfilter = {};
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
      $scope.clearFilter = function () {
        $rootScope.newfilter = {
          userId: $rootScope.userId,
          sort: 'match',
          p: 1
        }
      }

      $scope.showjob = function () {
        if (!$scope.newHospital) {
          $scope.newHospital = {}
        }
        if ($rootScope.newfilter.job) {
          $scope.newHospital.job = $rootScope.newfilter.job

        }
        $ionicPopup.confirm({
          title: 'Vị trí bạn muốn',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/select-job.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-dark bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
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
        $scope.newHospital.working_type = $rootScope.newfilter.working_type;
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
            $rootScope.newfilter.working_type = $scope.newHospital.working_type;
            console.log('select', $rootScope.newfilter);

          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.showindustry = function () {
        if (!$scope.newHospital) {
          $scope.newHospital = {}
        }
        $scope.newHospital.industry = $rootScope.newfilter.industry;
        $ionicPopup.confirm({
          title: 'Lĩnh vực',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/select-industry.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-dark bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            $rootScope.newfilter.industry = $scope.newHospital.industry;
            console.log('select', $rootScope.newfilter);

          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.createHospital = function () {
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner><br>' + ' Đang lọc công việc...',
        })
        $scope.modalProfile.hide();
        $rootScope.jobCard = []
        $scope.getJobFiltered($rootScope.newfilter);
        $rootScope.service.Ana('filter', $rootScope.newfilter)
      };
    });
  };

  $scope.like = function (a, b, c) {
    $rootScope.service.userLike(a, b, c).then(function () {
      $scope.swiper.slideNext()
    })
  }


});
