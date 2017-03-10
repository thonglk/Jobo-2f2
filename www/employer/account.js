"use strict";

app.controller('AccountCtrl', function (AuthUser, $timeout, $scope, $rootScope, CONFIG, $ionicModal, $http, $ionicSlideBoxDelegate, $ionicActionSheet, $cordovaCamera, $ionicPopover, $state, $ionicPopup, $ionicLoading, $ionicPlatform) {

  // Config Slide function
  $scope.lockSlide = function () {
    $ionicSlideBoxDelegate.enableSlide(false);
  };
  $scope.next = function () {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function () {
    $ionicSlideBoxDelegate.previous();
  };
  $scope.slideChanged = function (index) {
    $scope.slideIndex = index;
    console.log($scope.slideIndex)
  };
  $scope.slideTo = function (index) {
    $ionicSlideBoxDelegate.slide(index);
  };

  // End Config Slide function

  $scope.init = function () {
    AuthUser.employer()
      .then(function (result) {
          console.log(result)
          $scope.loadCurrentStore(result.storeIdCurrent)
          $scope.getListStore(result.userid);
          $scope.getListJob(result.storeIdCurrent);
        }, function (error) {
          console.log(error)

          // error
        }
      );
  };

  //Set Current Store

  $scope.setCurrentStore = function (storeKey) {
    $rootScope.storeIdCurrent = storeKey;
    var setCurrent = firebase.database().ref('user/' + $rootScope.userid)
    setCurrent.update({currentStore: storeKey});
    console.log({currentStore: storeKey});
    $scope.loadCurrentStore()
    $scope.getListJob();
    $scope.closePopover();
  };

  $scope.loadCurrentStore = function (storeId) {
    var storeDataCurrent = firebase.database().ref('store/' + storeId);
    storeDataCurrent.on('value', function (snap) {
      $timeout(
        $rootScope.storeDataCurrent = snap.val()
        , 100
      )
      console.log($rootScope.storeDataCurrent);
    });
  }
  $scope.getListStore = function (userId) {
    if (!$scope.storeList) {
      var storeListRef = firebase.database().ref('store').orderByChild('createdBy').equalTo(userId);
      storeListRef.on('value', function (snap) {
        $timeout($scope.storeList = snap.val()
          , 100
        )
        console.log($scope.storeList)
      })
    }
  };
  $scope.getListJob = function () {
    var jobListRef = firebase.database().ref('job/' + $rootScope.storeIdCurrent);
    jobListRef.on('value', function (snap) {
      $timeout($rootScope.jobList = snap.val()
        ,
        100)
      console.log($rootScope.jobList);
    });
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


// Add store
  $scope.addStore = function () {
    $scope.closePopover()
    $ionicModal.fromTemplateUrl('/employer/modals/add-store.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalAddStore = modal;
      $scope.modalAddStore.show();

      $scope.store = {};


//Find Store by Google
      $scope.autocompleteLocation = {text: ''};
      $scope.searchLocation = function () {

        $scope.URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + $scope.autocompleteLocation.text + '&language=vi&components=country:VN&sensor=true&key=' + CONFIG.APIKey;
        $http({
          method: 'GET',
          url: $scope.URL
        }).then(function successCallback(response) {

          $scope.ketquasLocation = response.data.results;
          console.log($scope.ketquasLocation);
        })
      };


      $scope.setSelectedLocation = function (selected) {
        $scope.location = selected;
        console.log($scope.location)

        $scope.store.location = {};
        $scope.store.name = $scope.location.name;
        $scope.store.address = $scope.location.formatted_address;
        $scope.store.location.lat = $scope.location.geometry.location.lat;
        $scope.store.location.lng = $scope.location.geometry.location.lng;
        $scope.store.industry = $scope.location.types[0];
        console.log($scope.store)

      };

      //Create Store by hand
      $scope.storeName = '';
      $scope.storeIndustry = '';

      //find Address by Google
      $scope.autocompleteAddress = {text: ''};
      $scope.searchAddress = function () {

        $scope.URL = 'https://maps.google.com/maps/api/geocode/json?address=' + $scope.autocompleteAddress.text + '&components=country:VN&sensor=true&key=' + CONFIG.APIKey;
        $http({
          method: 'GET',
          url: $scope.URL
        }).then(function successCallback(response) {

          $scope.ketquasAddress = response.data.results;
          console.log($scope.ketquasAddress);
        })
      };

      $scope.setSelectedAddress = function (selected) {
        $scope.address = selected;
        console.log($scope.address)
        $scope.store.location = {};
        $scope.store.name = $scope.storeName;
        $scope.store.address = $scope.address.formatted_address;
        $scope.store.location.lat = $scope.address.geometry.location.lat;
        $scope.store.location.lng = $scope.address.geometry.location.lng;
        $scope.store.industry = $scope.storeIndustry;
        console.log($scope.store)
      };

      $scope.submitStore = function (storeCreate) {
        if (!$scope.store.name || !$scope.store.industry) {
          $scope.store.name = storeCreate.Name;
          $scope.store.industry = storeCreate.Industry;

        }

        var newStoreKey = firebase.database().ref('store').push().key;
        $rootScope.storeIdCurrent = newStoreKey;

        var storeData = {
          storeKey: newStoreKey,
          storeName: $scope.store.name,
          address: $scope.store.address,
          location: $scope.store.location,
          createdBy: $rootScope.userid,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          starCount: 0,
          industry: $scope.store.industry,
          photourl: $scope.photoUpload || 'img/restaurant.png'

        }
        console.log(storeData)


        var newStoreRef = firebase.database().ref('store/' + newStoreKey);
        newStoreRef.update(storeData);

        var userRef = firebase.database().ref('user/employer/' + $rootScope.userid);
        userRef.transaction(function (post) {
          if (post) {
            if (post.storelist && post.storelist[newStoreKey]) {
            } else {
              if (!post.storelist) {
                post.storelist = {};
              }
              post.storelist[newStoreKey] = true;
            }
          }
          return post;
        });
        $scope.getListStore()
        $scope.slideTo(2)
      }

      // Add Initial Job For Store
      $scope.newHospital = {};
      $scope.showjob = function () {
        $ionicPopup.confirm({
          title: 'Vị trí bạn đang cần tuyển',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/collect-job.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-calm bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            for (var obj in $scope.newHospital.job) {
              $scope.keyjob = $scope.newHospital.job[obj];
              console.log('obj', $scope.keyjob);
              if ($scope.keyjob == false) {
                delete $scope.newHospital.job[obj];
              }
            }
            console.log('You are sure', $scope.newHospital);

          } else {
            console.log('You are not sure');
          }
        });
      };

      $scope.saveinterestjob = function () {

        var savejobRef = firebase.database().ref('store/' + $rootScope.storeIdCurrent + '/job');
        console.log($scope.newHospital.job);
        savejobRef.set($scope.newHospital.job);

        for (var key in $scope.newHospital.job) {
          var jobKey = key;
          var jobRef = firebase.database().ref('job/' + $rootScope.storeIdCurrent + '/' + jobKey);
          var dataSave = {
            job: jobKey,
            createdByStore: $rootScope.storeIdCurrent,
            createdById: $rootScope.userid,
            createdAt: firebase.database.ServerValue.TIMESTAMP
          }
          console.log(dataSave);

          jobRef.update(dataSave);

        }
        $scope.modalAddStore.hide();

      };


      $scope.cancel = function () {
        $scope.modalAddStore.hide();

      }
    })
  };

  //Create Avatar
  $scope.avatarimage = 'img/add-button.jpg';

  $scope.updateavatar = function () {
    console.log('update avatar clicked');
    $ionicActionSheet.show({
      buttons: [{
        text: 'Chụp ảnh'
      }, {
        text: 'Chọn từ thư viện'
      }],
      cancelText: 'Cancel',
      cancel: function () {
      },
      buttonClicked: function (index) {
        switch (index) {

          case 0:
            var options = {
              quality: 75,
              destinationType: Camera.DestinationType.FILE_URI,
              encodingType: Camera.EncodingType.JPEG,
              popoverOptions: CameraPopoverOptions,
              targetWidth: 500,
              targetHeight: 500,
              saveToPhotoAlbum: false,
              allowEdit: true

            };
            $cordovaCamera.getPicture(options).then(function (imageData) {
              $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
              });
              // $scope.images = imageData;

              var storageRef = firebase.storage().ref();
              // filename = imageData.name;

              var getFileBlob = function (url, cb) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.addEventListener('load', function () {
                  cb(xhr.response);
                });
                xhr.send();
              };

              var blobToFile = function (blob, name) {
                blob.lastModifiedDate = new Date();
                blob.name = name;
                return blob;
              };

              var getFileObject = function (filePathOrUrl, cb) {
                getFileBlob(filePathOrUrl, function (blob) {
                  cb(blobToFile(blob, new Date().getTime()));
                });
              };

              getFileObject(imageData, function (fileObject) {
                var metadata = {
                  'contentType': fileObject.type
                };
                var uploadTask = storageRef.child('images/' + fileObject.name).put(fileObject, metadata);

                uploadTask.on('state_changed', null, function (error) {
                  // [START onfailure]
                  console.error('Upload failed:', error);
                  alert('Upload failed:', error);
                  // [END onfailure]
                }, function () {
                  console.log(uploadTask.snapshot.metadata);
                  var url = uploadTask.snapshot.metadata.downloadURLs[0];
                  $scope.avatarimage = url
                  $scope.photoUpload = url;
                  $cordovaToast.showShortTop("Cập nhật ảnh thành công");
                  $ionicLoading.hide();

                });

              });
            }, function (error) {
              console.error(error);
              alert(error);
            });


            break;
          case 1: // chọn pickercordova plugin add https://github.com/wymsee/cordova-imagePicker.git
            var options = {
              quality: 75,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
              encodingType: Camera.EncodingType.JPEG,
              popoverOptions: CameraPopoverOptions,
              targetWidth: 500,
              targetHeight: 500,
              saveToPhotoAlbum: false,
              allowEdit: true
            };
            $cordovaCamera.getPicture(options).then(function (imageData) {

              $ionicLoading.show({
                template: '<p>Loading...</p><ion-spinner></ion-spinner>'
              });
              var storageRef = firebase.storage().ref();
              // filename = imageData.name;

              var getFileBlob = function (url, cb) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.addEventListener('load', function () {
                  cb(xhr.response);
                });
                xhr.send();
              };

              var blobToFile = function (blob, name) {
                blob.lastModifiedDate = new Date();
                blob.name = name;
                return blob;
              };

              var getFileObject = function (filePathOrUrl, cb) {
                getFileBlob(filePathOrUrl, function (blob) {
                  cb(blobToFile(blob, new Date().getTime()));
                });
              };

              getFileObject(imageData, function (fileObject) {

                var metadata = {
                  'contentType': fileObject.type
                };
                var uploadTask = storageRef.child('images/' + fileObject.name).put(fileObject, metadata);

                uploadTask.on('state_changed', null, function (error) {
                  // [START onfailure]
                  console.error('Upload failed:', error);
                  alert('Upload failed:', error);
                  // [END onfailure]
                }, function () {
                  console.log(uploadTask.snapshot.metadata);
                  var url = uploadTask.snapshot.metadata.downloadURLs[0];
                  $scope.avatarimage = url
                  $scope.photoUpload = url
                  $ionicLoading.hide();
                });

              });
            }, function (error) {
              console.error(error);
              $cordovaToast.showShortTop("Cập nhật ảnh thành công");
            });

            break;
        }

        return true;
      }
    });
  };

// Add job for store

  $scope.addJob = function () {
    $ionicModal.fromTemplateUrl('/employer/modals/add-job.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalAddJob = modal;
      $scope.modalAddJob.show();

      $scope.Hospital = {};

      $scope.newHospital = {}

      $scope.showShift = function (key) {
        $ionicPopup.confirm({
          title: 'Ca làm việc',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/collect-shift.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-calm bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            for (var obj in $scope.newHospital.shift) {
              $scope.keyjob = $scope.newHospital.shift[obj];
              console.log('obj', $scope.keyjob);
              if ($scope.keyjob == false) {
                delete $scope.newHospital.shift[obj];
              }
            }
            var dataShift = $scope.newHospital;
            $scope.shift = dataShift.shift;
            $scope.Hospital[key].shift = $scope.shift;
            console.log('You are sure', $scope.Hospital);
            delete $scope.newHospital.shift
          } else {
            console.log('You are not sure');
          }
        });
      }
      $scope.showjob = function () {
        $scope.newHospital = {}
        $ionicPopup.confirm({
          title: 'Vị trí bạn đang cần tuyển',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/collect-job.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-calm bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            console.log('You are sure', $scope.newHospital);


          } else {
            console.log('You are not sure');
          }
        })
      }

      $scope.submitJob = function (Hospital) {
        $scope.newHospital.createdByStore = $rootScope.storeIdCurrent;
        $scope.newHospital.createdById = $rootScope.userid;
        $scope.newHospital.createdAt = firebase.database.ServerValue.TIMESTAMP;
        console.log($scope.newHospital);

        var savejobRef = firebase.database().ref('store/' + $rootScope.storeIdCurrent + '/job');
        console.log('newHospital save to store ', $scope.newHospital.job);
        savejobRef.set($scope.newHospital.job)

        $scope.Hospital = Hospital;

        for (var key in $scope.newHospital.job) {
          var jobRef = firebase.database().ref('job/' + $rootScope.storeIdCurrent + '/' + key);
          var dataJob = $scope.Hospital[key];
          dataJob.job = key;
          dataJob.createdByStore = $rootScope.storeIdCurrent;
          dataJob.createdById = $rootScope.userid;
          dataJob.createdAt = firebase.database.ServerValue.TIMESTAMP;


          console.log(' newHospitalNew ', dataJob);
          jobRef.update(dataJob)

        }


      }

      $scope.cancel = function () {
        $scope.modalAddJob.hide()

      }


    })
  }


})
