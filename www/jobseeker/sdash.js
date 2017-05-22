"use strict";
app.controller('sDashCtrl', function ($q, $scope, $rootScope, CONFIG, $stateParams, $ionicActionSheet, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate, $firebaseArray, $ionicPopup, $http, $ionicLoading, $ionicModal) {
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
      $rootScope.jobCard = []

      $rootScope.newfilter = {
        job: $rootScope.service.getfirst($rootScope.userData.job),
        userId: $rootScope.userId,
        sort: 'match',
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
      console.log("respond", response);
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
            console.log(snap.val())
          })


        }
        $rootScope.jobCard = $rootScope.jobCard.concat($scope.response.data);
        $timeout(function () {
          console.log('jobCard', $rootScope.jobCard)
          $scope.swiper.update();
          $ionicLoading.hide();
          $scope.loading = false
          if ($rootScope.newfilter.p == 1) {
            $cordovaToast.showShortTop('Chúng tôi đã tìm thấy ' + $scope.response.total + ' công việc phù hợp với bạn')
          }
        })
        $scope.loading = false

      })
    }, function (error) {
      console.log(error)

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
    console.log('touched', $scope.swiper.activeIndex);
    if ($scope.swiper.activeIndex == $rootScope.jobCard.length - 5) {
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
            console.log('You are sure');
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
            console.log('You are sure');
            $rootScope.newfilter.industry = $scope.newHospital.industry;
            console.log('select', $rootScope.newfilter);

          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.createHospital = function () {
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner><br>' + ' Đang lọc ứng viên...',
        })
        console.log('newfilter', $rootScope.newfilter)

        $scope.modalProfile.hide();
        $rootScope.jobCard = []
        $scope.getJobFiltered($rootScope.newfilter);
        $rootScope.service.Ana('filter', $rootScope.newfilter)
      };
    });
  };


});
