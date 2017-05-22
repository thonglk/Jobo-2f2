"use strict";

app.controller("sprofileCtrl", function ($scope,
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
                                         $timeout,
                                         $firebaseArray,
                                         $ionicLoading,
                                         $ionicPopup,
                                         AuthUser) {
    $scope.$back = function () {
      window.history.back();
    };
    $scope.init = function () {
      $scope.tempoExperience = {};
      AuthUser.user()
        .then(function (result) {
          console.log(result);
          var profileRef = firebase.database().ref('profile/' + $rootScope.userId);
          profileRef.once('value', function (snap) {
            $timeout(function () {
              $rootScope.userData = snap.val();
              console.log($rootScope.userData)

              if ($rootScope.userData) {
                console.log('có rồi')

                if ($rootScope.userData.experience) {
                  $scope.tempoExperience = $rootScope.userData.experience
                } else {
                  var experienceRef = firebase.database().ref('profile/' + $rootScope.userId + '/experience');
                  var newkey = experienceRef.push().key;
                  $scope.tempoExperience[newkey] = {id: newkey}
                }

              } else {
                console.log('chưa có')
                var userRef = firebase.database().ref('user/' + $rootScope.userId);
                userRef.once('value', function (snap) {
                  var userInfo = snap.val();
                  console.log(userInfo)
                  if (userInfo) {
                    $rootScope.userData = {
                      name: userInfo.name,
                      email: userInfo.email,
                      phone: userInfo.phone,
                    };
                    console.log($rootScope.userData);

                  }
                })
              }
            })
          })
        })

    };

    $scope.selectJob = function (id) {
      $scope.newHospital.job = $rootScope.userData.experience[id].job;

      $ionicPopup.confirm({
        title: 'Chọn công việc',
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
          $rootScope.userData.experience[id].job = $scope.newHospital.job
          console.log($rootScope.userData.experience);
          $scope.newHospital = {}
        } else {
          console.log('You are not sure');
        }
      });
    };

    $scope.selectExpJob = function (id) {
      console.log($scope.tempoExperience);
      $scope.newHospital.job = $scope.tempoExperience[id].job;

      $ionicPopup.confirm({
        title: 'Chọn công việc',
        scope: $scope,
        // template: 'Are you sure you want to eat this ice cream?',
        templateUrl: 'templates/popups/select-job.html',
        cssClass: 'animated bounceInUp dark-popup',
        okType: 'button-small button-calm bold',
        okText: 'Xong ',
        cancelType: 'button-small'
      }).then(function (res) {
        if (res) {
          $scope.tempoExperience[id].job = $scope.newHospital.job
          console.log($scope.tempoExperience)

        } else {
          console.log('You are not sure');
        }
      });
    };

    $scope.addMoreExp = function () {
      var experienceRef = firebase.database().ref('profile/' + $rootScope.userId + '/experience');
      var newkey = experienceRef.push().key;
      $scope.tempoExperience[newkey] = {id: newkey}
    }
    $scope.deleteExp = function (id) {
      delete  $scope.tempoExperience[id]
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
        $rootScope.userData.address = selected.formatted_address;
        $rootScope.userData.location = selected.geometry.location;

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

    $scope.selectSchool = function () {
      $ionicPopup.confirm({
        title: 'Địa chỉ',
        scope: $scope,
        // template: 'Are you sure you want to eat this ice cream?',
        templateUrl: 'templates/popups/select-School.html',
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

        var params = {
          query: $scope.autocompleteSchool.text,
          type: 'university'
        }
        $http({
          method: 'GET',
          url: CONFIG.APIURL + '/api/places',
          params: params
        }).then(function successCallback(response) {
          $scope.ketquasSchool = response.data.results
          console.log($scope.ketquasSchool);
        })
      };


      $scope.setSelectedSchool = function (selected) {
        $scope.school = selected;
        console.log($scope.school)
        $rootScope.userData.school = $scope.school.name

      };

    }
    $scope.newHospital = {}
    $scope.collectJob = function () {
      $ionicPopup.confirm({
        title: 'Công việc mong muốn',
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
          $rootScope.userData.job = $scope.newHospital.job

        } else {
          console.log('You are not sure');
        }
      })
    };

    $scope.collectTime = function () {
      $ionicPopup.confirm({
        title: 'Thời gian có thể đi làm',
        scope: $scope,
        // template: 'Are you sure you want to eat this ice cream?',
        templateUrl: 'templates/popups/collect-time.html',
        cssClass: 'animated bounceInUp dark-popup',
        okType: 'button-small button-calm bold',
        okText: 'Done',
        cancelType: 'button-small'
      }).then(function (res) {
        if (res) {
          for (var obj in $scope.newHospital.time) {
            $scope.keyjob = $scope.newHospital.time[obj];
            console.log('obj', $scope.keyjob);
            if ($scope.keyjob == false) {
              delete $scope.newHospital.time[obj];
            }
          }
          console.log('You are sure', $scope.newHospital);
          $rootScope.userData.time = $scope.newHospital.time
          $scope.newHospital = {}
        } else {
          console.log('You are not sure');
        }
      })
    };

    $scope.collectLanguages = function () {
      $scope.newHospital.languages = $rootScope.userData.languages

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
              delete $scope.newHospital.languages[obj];
            }
          }
          console.log('You are sure', $scope.newHospital);

          $rootScope.userData.languages = $scope.newHospital.languages

        } else {
          console.log('You are not sure');
        }
      })
    }

    $scope.collectIndustry = function () {
      $scope.newHospital.industry = $rootScope.userData.industry

      $ionicPopup.confirm({
        title: 'Nơi làm việc mong muốn',
        scope: $scope,
        // template: 'Are you sure you want to eat this ice cream?',
        templateUrl: 'templates/popups/collect-industry.html',
        cssClass: 'animated bounceInUp dark-popup',
        okType: 'button-small button-calm bold',
        okText: 'Done',
        cancelType: 'button-small'
      }).then(function (res) {
        if (res) {
          for (var obj in $scope.newHospital.industry) {
            $scope.keyjob = $scope.newHospital.industry[obj];
            console.log('obj', $scope.keyjob);
            if ($scope.keyjob == false) {
              delete $scope.newHospital.industry[obj];
            }
          }
          console.log('You are sure', $scope.newHospital);
          $rootScope.userData.industry = $scope.newHospital.industry

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
                    $scope.userData.avatar = uploadTask.snapshot.metadata.downloadURLs[0];

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
    $scope.submit = function () {
      $rootScope.userData.userId = $rootScope.userId
      console.log($rootScope.userData);
      var profileRef = firebase.database().ref('profile/' + $rootScope.userId)
      profileRef.update($rootScope.userData)
      $state.go('jobseeker.dash')
    }
  }
);
