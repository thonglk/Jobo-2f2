"use strict";

app.controller("storeCtrl", function ($scope,
                                      $rootScope,
                                      $ionicActionSheet,
                                      $ionicSlideBoxDelegate,
                                      $cordovaCamera,
                                      $ionicModal,
                                      $http,
                                      CONFIG,
                                      $cordovaCapture,
                                      $cordovaToast,
                                      $sce,
                                      $state,
                                      AuthUser,
                                      $timeout,
                                      $firebaseArray,
                                      $ionicLoading,
                                      $ionicPopup,
                                      $stateParams) {
  var staticData = {
    viewed: 0,
    liked: 0,
    shared: 0,
    rated: 0,
    rateAverage: 0,
    matched: 0,
    chated: 0,
    like: 0,
    share: 0,
    rate: 0,
    match: 0,
    chat: 0,
    timeOnline: 0,
    login: 1,
    profile: 0
  }


  $scope.convertIns = function (job) {
    var card = CONFIG.data.convertIns

    var converted;
    if
    (card.beauty_salon[job]) {
      converted = 'beauty_salon'
    } else if (card.store[job]) {
      converted = 'store'

    } else if (card.restaurant_bar[job]) {
      converted = 'restaurant_bar'

    } else if (card.education_centre[job]) {
      converted = 'education_centre'

    } else if (card.resort[job]) {
      converted = 'resort'

    } else if (card.real_estate[job]) {
      converted = 'real_estate'
    } else if (card.supermarket_cinema[job]) {
      converted = 'supermarket_cinema'
    } else if (card.unique[job]) {
      converted = job

    } else {
      converted = "other"
    }
    return converted
  }
  $scope.$back = function () {
    $window.history.back();
  };
  $scope.init = function () {
    $scope.type = $stateParams.id;
    console.log($scope.type);
    //
    $scope.contact = {}
    $scope.picFile = null;
    $scope.tempoExperience = {}
    //

    if ($scope.type == 'new') {

      $scope.firsttime = true;

      //tạo thêm cửa hàng
      console.log('new');

      AuthUser.user().then(function (result) {
        if (result.name) {
          $scope.contact.name = true
        }
        if (result.email) {
          $scope.contact.email = true
        }
        if (result.phone) {
          $scope.contact.phone = true
        }
        var newstoreKey = firebase.database().ref('store').push().key
        $rootScope.storeData = {
          createdBy: result.userId,
          storeId: newstoreKey,
          createdAt: new Date().getTime(),
          job: {},
        }
        $scope.jobData = []

        $rootScope.userData.currentStore = newstoreKey


      }, function (error) {
        console.log(error)
        // error
      });


    } else {

      AuthUser.user().then(function (result) {
        if (result.name) {
          $scope.contact.name = true
        }
        if (result.email) {
          $scope.contact.email = true
        }
        if (result.phone) {
          $scope.contact.phone = true
        }

        console.log(result)
        if (result.currentStore) {
          $scope.ByHand = true
          firebase.database().ref('store/' + result.currentStore).once('value', function (snap) {
            $timeout(function () {
              $rootScope.storeData = snap.val();
              console.log($rootScope.storeData);
              if ($rootScope.storeData && $rootScope.storeData.job) {
                $rootScope.service.loadJob($rootScope.storeData)
                  .then(function (data) {
                    $timeout(function () {
                      $scope.jobData = data
                      console.log($scope.jobData)
                    })
                  })
              } else {
                //chưa có job
                $rootScope.storeData.job = {}
                $scope.jobData = []
              }

              //Đã có, vào để update
              $scope.autocompleteAddress.text = $scope.storeData.address
            })
          })
        } else {

          $scope.firsttime = true;
          //tạo mới đầu
          console.log('Tạo mới');
          var newstoreKey = firebase.database().ref('store').push().key;
          $rootScope.userData.currentStore = newstoreKey
          $rootScope.storeId = newstoreKey
          $rootScope.storeData = {
            createdBy: $rootScope.userId,
            storeId: newstoreKey,
            createdAt: new Date().getTime(),
            job: {},
            static: staticData
          };
          $scope.jobData = []
        }
      }, function (error) {
        console.log(error);
        // error
      });


    }


  }


  $scope.newHospital = {job: {}};

  $scope.autocompleteLocation = {text: ''};
  $scope.searchLocation = function () {
    var params = {
      query: $scope.autocompleteLocation.text
    }
    $http({
      method: 'GET',
      url: CONFIG.APIURL + '/api/places',
      params: params
    }).then(function successCallback(response) {
      $scope.ketquasLocation = response.data.results;
      console.log($scope.ketquasLocation);
    })
  };


  $scope.setSelectedLocation = function (selected) {
    $scope.location = selected;
    console.log($scope.location)
    $rootScope.storeData.location = {};
    $rootScope.storeData.storeName = $scope.location.name;
    $rootScope.storeData.address = $scope.location.formatted_address;
    $rootScope.storeData.location.lat = $scope.location.geometry.location.lat;
    $rootScope.storeData.location.lng = $scope.location.geometry.location.lng;
    $rootScope.storeData.googleIns = $scope.location.types;
    console.log($rootScope.storeData)
  };

  $scope.createByHand = function () {
    if ($rootScope.storeData.googleIns) {
      $rootScope.storeData.industry = $scope.convertIns($rootScope.storeData.googleIns[0])
    }
    $scope.ByHand = true
  }


  $scope.selectIndustry = function () {
    $scope.newHospital.industry = $rootScope.storeData.industry;

    $ionicPopup.confirm({
      title: 'Vị trí',
      scope: $scope,
      // template: 'Are you sure you want to eat this ice cream?',
      templateUrl: 'templates/popups/select-industry.html',
      cssClass: 'animated bounceInUp dark-popup',
      okType: 'button-small button-calm bold',
      okText: 'Xong ',
      cancelType: 'button-small'
    }).then(function (res) {
      if (res) {
        console.log('You are sure', $scope.newHospital);
        $rootScope.storeData.industry = $scope.newHospital.industry;

      } else {
        console.log('You are not sure');
      }
    });
  };


  // Search Address
  $scope.selectAddress = function () {

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
      $scope.storeData.address = selected.formatted_address;
      $scope.storeData.location = selected.geometry.location;

    };


    $ionicPopup.confirm({
      title: 'Địa chỉ',
      scope: $scope,
      // template: 'Are you sure you want to eat this ice cream?',
      templateUrl: 'templates/popups/select-Address.html',
      cssClass: 'animated bounceInUp dark-popup',
      okType: 'button-small button-calm bold',
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

  $scope.collectLanguages = function () {
    $ionicPopup.confirm({
      title: 'Khả năng ngoại ngữ',
      scope: $scope,
      // template: 'Are you sure you want to eat this ice cream?',
      templateUrl: 'templates/popups/collect-languages.html',
      cssClass: 'animated bounceInUp dark-popup',
      okType: 'button-small button-calm bold',
      okText: 'Done',
      cancelType: 'button-small'
    }).then(function (res) {
      if (res) {
        for (var obj in $scope.newHospital.languages) {
          $scope.keyjob = $scope.newHospital.languages[obj];
          console.log('obj', $scope.keyjob);
          if ($scope.keyjob == false) {
            delete $scope.languages.job[obj];
          }
        }
        console.log('You are sure', $scope.newHospital);
        $scope.userData.languages = $scope.newHospital.languages

      } else {
        console.log('You are not sure');
      }
    })
  }

  $scope.addJob = function () {
    $scope.newJob = {}
  }

  $scope.calculatemonth = function calculatemonth(birthday) { // birthday is a date
    var birthdate = new Date(birthday);
    var month = birthdate.getMonth() + 1;
    var year = birthdate.getFullYear();
    var time = month + "/" + year;

    return time;
  };
  $scope.calculateAge = function calculateAge(birthday) { // birthday is a date
    var birthdate = new Date(birthday);
    var ageDifMs = Date.now() - birthdate;
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

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
                  $scope.storeData.avatar = uploadTask.snapshot.metadata.downloadURLs[0];

                  $ionicLoading.hide()

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
                  $scope.storeData.avatar = uploadTask.snapshot.metadata.downloadURLs[0];
                  $ionicLoading.hide()
                });

              });
            }, function (error) {
              console.error(error);
              $cordovaToast.showShortTop(error);
            });

            break;
        }

        return true;
      }
    });
  };
  $scope.editjob = function () {
    $scope.newJob = {}

    if (!$scope.newfilter) {
      $scope.newfilter = {};
    }
    $ionicModal.fromTemplateUrl('employer/modals/addjob.html', {
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
        $scope.newfilter = {}
      }
      $scope.showjob = function () {
        if (!$scope.newHospital) {
          $scope.newHospital = {}
        }
        if ($scope.newfilter.job) {
          $scope.newHospital.job = $scope.newfilter.job
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
            $scope.newfilter.job = $scope.newHospital.job;
            console.log('select', $scope.newfilter);

          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.showtime = function () {
        if (!$scope.newHospital) {
          $scope.newHospital = {}
        }
        $scope.newHospital.working_type = $scope.newfilter.working_type;
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
            $scope.newfilter.working_type = $scope.newHospital.working_type;
            console.log('select', $scope.newfilter);

          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.createHospital = function () {
        $scope.newJob = $scope.newfilter
        $scope.saveJob()
        $scope.modalProfile.hide();
      };
    });
  };
  $scope.saveJob = function () {
    if (!$scope.jobData) {
      $scope.jobData = []
    }
    if (!$scope.anaJob) {
      $scope.anaJob = []
    }

    console.log($scope.newJob)

    $scope.jobData.push($scope.newJob)
    console.log($scope.jobData)
    $scope.anaJob.push($scope.newJob.job)

    delete $scope.newJob
  }
  $scope.deleteJob = function (id) {
    delete  $scope.jobData[id]
  };

  $scope.showShift = function (key) {
    $scope.newHospital.time = $rootScope.storeData.job[key].time

    $ionicPopup.confirm({
      title: 'Ca làm việc',
      scope: $scope,
      // template: 'Are you sure you want to eat this ice cream?',
      templateUrl: 'templates/popups/select-time.html',
      cssClass: 'animated bounceInUp dark-popup',
      okType: 'button-small button-calm bold',
      okText: 'Done',
      cancelType: 'button-small'
    }).then(function (res) {
      if (res) {
        console.log($scope.newHospital.time)
        $rootScope.storeData.job[key].time = $scope.newHospital.time;
        console.log('You are sure', $rootScope.storeData.job);
      } else {
        console.log('You are not sure');
      }
    });
  }

  $scope.showjob = function () {
    if ($rootScope.storeData.job) {
      for (var i in $rootScope.storeData.job) {
        $scope.newHospital.job[i] = true
        console.log($scope.newHospital.job)
      }
    } else {
      $scope.newHospital = {job: {}}
      $rootScope.storeData.job = {}
    }

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
              delete $rootScope.storeData.job[obj];
            } else {
              $rootScope.storeData.job[obj] = {job: obj}
            }

          }
        }
        else
          console.log('You are not sure');

      }
    )
  }
  $scope.submit = function () {
    $scope.error = $rootScope.userData;

    if ($rootScope.userData.email && $rootScope.userData.phone && $rootScope.storeData.location) {

      for (var i in $scope.jobData) {
        var job = $scope.jobData[i]
        $rootScope.storeData.job[job.job] = true
        if (job.deadline) {
          job.deadline = new Date(job.deadline).getTime()
          console.log(job.deadline)
        }
        delete job.$$hashKey
        firebase.database().ref('job/' + $rootScope.storeId + ":" + job.job).update(job)
      }
      firebase.database().ref('store/' + $rootScope.storeData.storeId).update($rootScope.storeData)


      firebase.database().ref('user/' + $rootScope.userId).update($rootScope.userData);

      if ($scope.firsttime) {
        $rootScope.service.Ana('createStore');
        $state.go('employer.dash')
        $cordovaToast.showShortTop('Tạo cửa hàng thành công')

      } else {
        $rootScope.service.Ana('updateStore', {job: $scope.anaJob || ''});
        $state.go('employer.dash')
        $cordovaToast.showShortTop('Cập nhật thành công')
      }


    } else {
      toastr.error('Bạn chưa cập nhật đủ thông tin', 'Lỗi');
    }
  }

});
