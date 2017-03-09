"use strict";

app.controller("sprofileCtrl", function ($scope,
                                         $ionicActionSheet,
                                         $ionicSlideBoxDelegate,
                                         $cordovaCamera,
                                         $ionicModal,
                                         $http,
                                         CONFIG,
                                         $cordovaCapture,
                                         $cordovaToast,
                                         $sce,
                                         $firebaseArray,
                                         $ionicLoading,
                                         $ionicPopup) {

  $scope.userData = {
    "createdAt": 1488285452104,
    "email": "test2@joboapp.com",
    "name": "Hoàng Quốc",
    "phone": "0987654345",
    "photourl": "img/macdinh.jpg",
    "type": 2,
    "userid": "2Ex94dTG7ffOJTIuadP5Ko4XBtd2",
    "address": "48 Hai Bà Trưng, Tràng Tiền, Hoàn Kiếm, Hà Nội, Vietnam",
    "birth": 1996,
    "experience": true,
    "figure": true,
    "job": {
      "baotri": true
    },
    "location": {
      "lat": 21.0250862,
      "lng": 105.8502656
    },
    "sex": "Nữ",
  };
  var a = 1;
  $scope.userData.experience = {}
  $scope.userData.experience[a] = {}
  $scope.addMoreExp = function (exp) {
    var stt;
    for (var i in exp) {
      stt = i
    }
    var n = stt + 1
    exp[n] = {}
  }

  $scope.deleteExp = function (exp) {
    var stt;
    for (var i in exp) {
      stt = i
    }
    delete exp[stt]
  }

  // Search Address
  $scope.selectAddress = function () {
    $scope.newHospital = {};

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
      templateUrl: 'jobseeker/popup/select-Address.html',
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


  $scope.selectSchool = function () {
    $ionicPopup.confirm({
      title: 'Địa chỉ',
      scope: $scope,
      // template: 'Are you sure you want to eat this ice cream?',
      templateUrl: 'jobseeker/popup/select-School.html',
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
    //find school

    $scope.autocompleteSchool = {text: ''};
    $scope.searchSchool = function () {

      $scope.URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + $scope.autocompleteSchool.text + '&language=vi&type=university&components=country:VN&sensor=true&key=' + CONFIG.APIKey;
      $http({
        method: 'GET',
        url: $scope.URL
      }).then(function successCallback(response) {

        $scope.ketquasSchool = response.data.results;
        console.log($scope.ketquasSchool);
      })
    };


    $scope.setSelectedSchool = function (selected) {
      $scope.school = selected;
      console.log($scope.school)
      $scope.userData.school = $scope.school.name

    };

  }
  $scope.newHospital = {}
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


  $scope.init = function () {
    // var uid = firebase.auth().currentUser.uid;
    // $scope.uid = firebase.auth().currentUser.uid;
    // console.log('im', $scope.uid);
    // $ionicLoading.show({
    //   template: '<ion-spinner class="spinner-positive"></ion-spinner>'
    // });
    // var userRef = firebase.database().ref('user/jobber/' + uid);
    // userRef.on("value", function (snapshot) {
    //   $ionicLoading.hide();
    //   $scope.usercurent = snapshot.val();
    //   $scope.birthdate = snapshot.val().birth
    //
    //
    // })

  };

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
  $scope.addjob = function () {
    $ionicModal.fromTemplateUrl('templates/modals/add-job.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalProfile = modal;
      $scope.modalProfile.show();

      $scope.showjob = function () {
        $scope.newHospital = {};
        $ionicPopup.confirm({
          title: 'Vị trí',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/collect-job.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-calm bold',
          okText: 'Xong ',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            console.log('You are sure', $scope.newHospital);

          } else {
            console.log('You are not sure');
          }
        });
      };

      $scope.savejob = function (job) {


        var db = firebase.database();
        var ref = db.ref("user");
        var uid = firebase.auth().currentUser.uid;
        var newPostKey = firebase.database().ref("user").child('jobber/' + uid + '/jobhistory').push().key;

        var usersRef = ref.child('jobber/' + uid + '/jobhistory/' + newPostKey);

        usersRef.update({
          company: job.company,
          monthstart: job.monthstartselected,
          monthend: job.monthendselected,
          industry: job.industry,
          title: $scope.newHospital.job,
          key: newPostKey

        });
        $scope.modalProfile.hide();
        $cordovaToast.showShortTop("Đã thêm")


      };
      $scope.hideProfile = function () {
        $scope.modalProfile.hide();
      }
    });
  };
  $scope.captureVideo = function () {
    var options = {limit: 1, duration: 60};

    $cordovaCapture.captureVideo(options).then(function (mediaFiles) {
      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner></ion-spinner>'
      });
      var i, imageData, len;
      for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        imageData = mediaFiles[i].fullPath;
        var storageRef = firebase.storage().ref();

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
          var uploadTask = storageRef.child('video/' + fileObject.name).put(fileObject, metadata);

          uploadTask.on('state_changed', null, function (error) {
            // [START onfailure]
            console.error('Upload failed:', error);
            $cordovaToast.showShortTop('Upload failed:', error);
            // [END onfailure]
          }, function () {
            console.log(uploadTask.snapshot.metadata);
            var url = uploadTask.snapshot.metadata.downloadURLs[0];
            var user = firebase.auth().currentUser;
            var db = firebase.database();
            var ref = db.ref("user");
            var uid = firebase.auth().currentUser.uid;
            var usersRef = ref.child('jobber/' + uid);
            usersRef.update({
              videourl: url
            });
            $ionicLoading.hide();
            $cordovaToast.showShortTop('Đã cập nhật video')

          });

        });
      }
      // Success! Video data is here

    }, function (err) {
      // An error occurred. Show a message to the user
    });
  };
  $scope.trustSrc = function (src) {
    return $sce.trustAsResourceUrl(src);
  };
  $scope.showinterest = function () {
    $ionicModal.fromTemplateUrl('templates/modals/edit-interest.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalSettings = modal;
      $scope.modalSettings.show();
      $scope.cancel = function () {
        $scope.modalSettings.hide();
      };

      $scope.showjob = function () {

        $ionicPopup.confirm({
          title: 'Lựa chọn vị trí mà bạn muốn ',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/collect-job.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-calm bold',
          okText: 'Xong ',
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

      var uid = firebase.auth().currentUser.uid;
      var usersRef = firebase.database().ref("user").child('jobber/' + uid + '/interest');
      usersRef.on('value', function (snap) {
        $scope.newHospital = snap.val();

      });
      $scope.createHospital = function () {
        for (var obj in $scope.newHospital.time) {
          $scope.keyjob = $scope.newHospital.time[obj];
          console.log('obj', $scope.keyjob);
          if ($scope.keyjob == false) {
            delete $scope.newHospital.time[obj];
          }
        }
        console.log($scope.newHospital);
        usersRef.set($scope.newHospital);
        $cordovaToast.showShortTop('Lưu!');
        usersRef.update({
          done: "true"
        });
        $scope.modalSettings.hide();
      };


    });
  };



  $scope.showShift = function () {
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
        $scope.userData.time = $scope.newHospital.shift
      } else {
        console.log('You are not sure');
      }
    });
  }

  $scope.showJob = function () {
    $ionicPopup.confirm({
      title: 'Lựa chọn vị trí mà bạn muốn ',
      scope: $scope,
      // template: 'Are you sure you want to eat this ice cream?',
      templateUrl: 'templates/popups/collect-job.html',
      cssClass: 'animated bounceInUp dark-popup',
      okType: 'button-small button-calm bold',
      okText: 'Xong ',
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
        $scope.userData.job = $scope.newHospital.job

      } else {
        console.log('You are not sure');
      }
    });
  };


  $scope.showJobExp = function (card) {
    $ionicPopup.confirm({
      title: 'Lựa chọn vị trí bạn đã làm',
      scope: $scope,
      // template: 'Are you sure you want to eat this ice cream?',
      templateUrl: 'templates/popups/collect-job.html',
      cssClass: 'animated bounceInUp dark-popup',
      okType: 'button-small button-calm bold',
      okText: 'Xong ',
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
        card.job = $scope.newHospital.job

      } else {
        console.log('You are not sure');
      }
    });
  };

});
