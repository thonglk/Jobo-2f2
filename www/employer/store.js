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
                                      AuthUser,
                                      $timeout,
                                      $firebaseArray,
                                      $ionicLoading,
                                      $ionicPopup) {
  $scope.init = function () {
    AuthUser.employer().then(function () {
      firebase.database().ref('store/' + $rootScope.storeIdCurrent).on('value', function (snap) {
        $timeout(function () {
          $rootScope.storeData = snap.val()
          console.log($rootScope.storeData)

        }, 10)
      })
    })
  }


  $scope.selectIndustry = function () {
    $scope.newHospital.industry = $scope.storeData.industry;

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
        $scope.storeData.industry = $scope.newHospital.industry;

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
      $scope.userData.address = selected.formatted_address;
      $scope.userData.location = selected.geometry.location;

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
      templateUrl: 'jobseeker/popup/collect-languages.html',
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
                  var url = uploadTask.snapshot.metadata.downloadURLs[0];
                  var usersRef = firebase.database().ref('user/jobber/' + $scope.uid);
                  usersRef.update({
                    photourl: url
                  });
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
                  var url = uploadTask.snapshot.metadata.downloadURLs[0];
                  var db = firebase.database();
                  var ref = db.ref("user");
                  var uid = firebase.auth().currentUser.uid;
                  var usersRef = ref.child('jobber/' + uid);
                  usersRef.update({
                    photourl: url
                  });
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
        $scope.storeData.job[key].shift = $scope.shift;
        console.log('You are sure', $scope.storeData.job);
        delete $scope.newHospital.shift
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
              $rootScope.storeData.job[obj] = { job: obj}
            }

          }
        }
        else
          console.log('You are not sure');

      }
    )
  }

  $scope.submit = function () {

    console.log($rootScope.storeData)
    var profileRef = firebase.database().ref('store/' + $rootScope.storeIdCurrent)
    profileRef.update($rootScope.storeData)

  }

});
