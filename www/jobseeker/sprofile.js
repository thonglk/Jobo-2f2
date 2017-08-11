"use strict";

app.controller("sprofileCtrl", function ($scope,
                                         $rootScope,
                                         $ionicActionSheet,
                                         $ionicSlideBoxDelegate,
                                         $cordovaCamera,
                                         $ionicModal,
                                         $http,
                                         $cordovaCapture,
                                         $cordovaToast,
                                         $sce,
                                         $state,
                                         $timeout,
                                         $ionicLoading,
                                         $ionicPopup,
                                         AuthUser,
                                         $cordovaImagePicker, debounce) {
    $scope.$back = function () {
      window.history.back();
    };
    $scope.indexToShow = 0;
    $scope.init = function () {
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner><br>',
      });
      $scope.tempoExperience = {};
      AuthUser.user()
        .then(function (userInfo) {
            console.log(userInfo);
            if (!userInfo.phone) {
              $scope.hasNoPhone = true
            } else {
              $scope.hasNoPhone = false;
              console.log($scope.hasNoPhone)
            }
            if (!userInfo.email) {
              $scope.hasNoEmail = true
            } else {
              $scope.hasNoEmail = false;
              console.log($scope.hasNoEmail)
            }
            $scope.userInfo = userInfo;
            $rootScope.service.JoboApi('on/profile',{userId: $rootScope.userId}).then(function (data) {
              $rootScope.userData = data.data;
              $timeout(function () {
                if (!$rootScope.userData) {
                  $scope.firsttime = true
                  $rootScope.userData = {
                    userId: $rootScope.userId,
                    name: userInfo.name,
                    photo: []
                  }
                }
                $rootScope.userData.email = userInfo.email;
                $rootScope.userData.phone = userInfo.phone;

                if ($rootScope.userData.email && $rootScope.userData.phone){
                  $scope.indexToShow = 1;
                  if ($rootScope.userData.name && $rootScope.userData.birth && $rootScope.userData.address && $rootScope.userData.job){
                    $scope.indexToShow = 2;
                  }
                }
                if ($rootScope.userData.experience) {
                  $scope.tempoExperience = $rootScope.userData.experience
                } else {
                  // var experienceRef = firebase.database().ref('profile/' + $rootScope.userId + '/experience');
                  // var newkey = experienceRef.push().key;
                  var newkey = 'p' + Math.round(100000000000000 * Math.random());
                  $scope.tempoExperience[newkey] = {id: newkey}
                }
                console.log('done Init', $rootScope.userData)
                $ionicLoading.hide()
              })
            });
            /*var profileRef = firebase.database().ref('profile/' + $rootScope.userId);
            profileRef.once('value', function (snap) {
              $rootScope.userData = snap.val();
              $timeout(function () {
                if (!$rootScope.userData) {
                  $scope.firsttime = true
                  $rootScope.userData = {
                    userId: $rootScope.userId,
                    name: userInfo.name,
                    photo: []
                  }
                }
                $rootScope.userData.email = userInfo.email;
                $rootScope.userData.phone = userInfo.phone;
                if ($rootScope.userData.experience) {
                  $scope.tempoExperience = $rootScope.userData.experience
                } else {
                  var experienceRef = firebase.database().ref('profile/' + $rootScope.userId + '/experience');
                  var newkey = experienceRef.push().key;
                  $scope.tempoExperience[newkey] = {id: newkey}
                }
                console.log('done Init', $rootScope.userData)
                $ionicLoading.hide()
              })
            })*/
          }
        )

    }
    ;

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
      // var experienceRef = firebase.database().ref('profile/' + $rootScope.userId + '/experience');
      // var newkey = experienceRef.push().key;
      var newkey = 'p' + Math.round(100000000000000 * Math.random());
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

      var delay = false
      $scope.searchAddress = function () {
        $scope.URL = 'https://maps.google.com/maps/api/geocode/json?address=' + $scope.autocompleteAddress.text + '&components=country:VN&sensor=true&key=' + $rootScope.CONFIG.APIKey;
        if (delay == false) {
          delay = true
          $http({
            method: 'GET',
            url: $scope.URL
          }).then(function successCallback(response) {
            $scope.ketquasAddress = response.data.results;
            console.log($scope.ketquasAddress);
          })
          $timeout(function () {
            delay = false
          }, 1000)
        }
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
          if (!$scope.school && $scope.autocompleteSchool) {
            $rootScope.userData.school = $scope.autocompleteSchool.text
          }
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
          url: $rootScope.CONFIG.APIURL + '/api/places',
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
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                targetWidth: 600,
                targetHeight: 600,
                saveToPhotoAlbum: false,
                allowEdit: true,
                cameraDirection: 1

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
                    $rootScope.userData.avatar = uploadTask.snapshot.metadata.downloadURLs[0];
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
                    $rootScope.userData.avatar = uploadTask.snapshot.metadata.downloadURLs[0];
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
              $rootScope.userData.videourl = uploadTask.snapshot.metadata.downloadURLs[0];
              $ionicLoading.hide()
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
    $scope.addPhoto = function () {
      var options = {
        maximumImagesCount: 20,
        width: 800,
        height: 800,
        quality: 100
      };

      $cordovaImagePicker.getPictures(options)
        .then(function (results) {
          for (var i = 0; i < results.length; i++) {
            console.log('Image URI: ' + results[i]);

            var imageData = results[i]

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
              var anany = Math.round(100000000000000 * Math.random())

              var uploadTask = storageRef.child('images/' + fileObject.name + anany).put(fileObject, metadata);

              uploadTask.then(function (snapshot) {
                var downloadPhoto = snapshot.downloadURL;
                console.log(downloadPhoto);
                if (!$rootScope.userData.photo) {
                  $rootScope.userData.photo = []
                }
                $rootScope.userData.photo.push(downloadPhoto);
                console.log('$rootScope.userData.photo', $rootScope.userData.photo)
              });

            });
          }
          $ionicLoading.hide()

        }, function (error) {
          // error getting photos
        });
    }
    $scope.deleteImage = function (images) {
      console.log('clicked', images)
      $scope.userData.photo.splice(images, 1);
    }

    //update data
    /*$scope.indexToShow = 0;
    $scope.$watch('$root.userData', function () {
      if ($rootScope.userData.email
        && $rootScope.userData.phone
        && $rootScope.userData.address
        && $rootScope.userData.name
        && $rootScope.userData.birth
        && $rootScope.userData.job
        && $scope.indexToShow === 0) {
        $scope.indexToShow = 2;
      }
    });*/
    $scope.updateData = function () {
      $scope.error = {};
      if ($scope.indexToShow === 0) {
        console.log('Update phone and email');
        if ($rootScope.userData.email && $rootScope.userData.phone) {
          console.log($rootScope.userData.phone);
          console.log($rootScope.userData.email);
          var userInfoUpdate = {
            phone: $rootScope.userData.phone,
            email: $rootScope.userData.email
          };
          $timeout(function () {
            $rootScope.service.JoboApi('update/user',{
              userId: $rootScope.userId,
              user: userInfoUpdate
            }).then(function () {
              console.log('save sucess')
            }, function () {
              console.log('save error')
            }, function () {
              console.log('process')
            });
            /*firebase.database().ref('user/' + $rootScope.userId).update(userInfoUpdate).then(function () {
              console.log('save sucess')
            }, function () {
              console.log('save error')
            }, function () {
              console.log('process')
            });*/
          });
          $scope.indexToShow++;
          console.log($scope.indexToShow);
          $rootScope.service.Ana('Update phone and email');
        }
        else {
          if (!$rootScope.userData.email) {
            $scope.error.email = true;
          }
          if (!$rootScope.userData.phone) {
            $scope.error.phone = true;
          }
        }
      } else if ($scope.indexToShow === 1) {
        console.log('Update User Profile');
        if ($rootScope.userData.email
          && $rootScope.userData.phone
          && $rootScope.userData.address
          && $rootScope.userData.name
          && $rootScope.userData.birth
          && $rootScope.userData.job) {
          // $rootScope.userData.name = $rootScope.service.upperName($rootScope.userData.name);
          console.log($rootScope.userData);
          var userInfoUpdate = {
            name: $rootScope.userData.name,
            phone: $rootScope.userData.phone,
            email: $rootScope.userData.email
          };
          var profileUpdate = {
            userId: $rootScope.userId,
            name: $rootScope.userData.name,
            birth: $rootScope.userData.birth,
            birthArray: $rootScope.userData.birthArray,
            address: $rootScope.userData.address,
            location: $rootScope.userData.location,
            job: $rootScope.userData.job,
            avatar: $rootScope.userData.avatar,
            createAt: $rootScope.userData.createAt
          };
          $timeout(function () {
            $rootScope.service.JoboApi('update/user',{
              userId: $rootScope.userId,
              user: userInfoUpdate,
              profile: profileUpdate
            }).then(function () {
              console.log('save sucess')
            }, function () {
              console.log('save error')
            }, function () {
              console.log('process')
            });
          });
          /*$timeout(function () {
            firebase.database().ref('user/' + $rootScope.userId).update(userInfoUpdate).then(function () {
              console.log('save sucess')
            }, function () {
              console.log('save error')
            }, function () {
              console.log('process')
            });
          });
          $timeout(function () {
            firebase.database().ref('profile/' + $rootScope.userId).update(profileUpdate).then(function () {
              console.log('save sucess')
            }, function () {
              console.log('save error')
            }, function () {
              console.log('process')
            });
          });*/
          $rootScope.service.Ana('Update user profile');
          $scope.indexToShow++;
          console.log($scope.indexToShow);
        } else {
          if (!$rootScope.userData.name) {
            $scope.error.name = true;
          }
          if (!$rootScope.userData.birth) {
            $scope.error.birth = true;
          }
          if (!$rootScope.userData.email) {
            $scope.error.email = true;
          }
          if (!$rootScope.userData.phone) {
            $scope.error.phone = true;
          }
          if (!$rootScope.userData.address) {
            $scope.error.address = true;
          }
          if (!$rootScope.userData.job) {
            $scope.error.job = true;
          }
        }
      }
    };
    //submit
    $scope.submit = function () {
      console.log('$rootScope.userData', $rootScope.userData)
      if ($rootScope.userData.email
        && $rootScope.userData.phone
        && $rootScope.userData.address
        && $rootScope.userData.name
        && $rootScope.userData.birth
        && $rootScope.userData.job) {

        console.log($rootScope.userData);
        var userInfoUpdate = {
          name: $rootScope.userData.name,
          phone: $rootScope.userData.phone,
          email: $rootScope.userData.email
        }
        var profileUpdate = $rootScope.userData;
        delete profileUpdate.phone
        delete profileUpdate.email
        delete profileUpdate.webToken
        delete profileUpdate.ref
        delete profileUpdate.provider
        delete profileUpdate.type
        delete profileUpdate.mobileToken
        delete profileUpdate.adminData
        delete profileUpdate.act
        delete profileUpdate.distance


        if ($scope.firsttime) {
          $rootScope.userData.createdAt = new Date().getTime()
          $rootScope.service.Ana('createProfile');
        } else {
          $rootScope.userData.updatedAt = new Date().getTime()
          $rootScope.service.Ana('updateProfile');
        }
        $timeout(function () {
          $rootScope.service.JoboApi('update/user',{
            userId: $rootScope.userId,
            user: userInfoUpdate,
            profile: profileUpdate
          }).then(function () {
            console.log('save sucess')
          }, function () {
            console.log('save error')
          }, function () {
            console.log('process')
          });
        });
        /*$timeout(function () {
          firebase.database().ref('user/' + $rootScope.userId).update(userInfoUpdate).then(function () {
            console.log('save sucess')
          }, function () {
            console.log('save error')
          }, function () {
            console.log('process')
          });
        })
        $timeout(function () {
          firebase.database().ref('profile/' + $rootScope.userId).update(profileUpdate).then(function () {
            console.log('save sucess')
          }, function () {
            console.log('save error')
          }, function () {
            console.log('process')
          });
        })*/

        if ($scope.hasNoEmail) {
          $rootScope.service.changeEmail($rootScope.userData.email)
        }
        //init profile
        if ($scope.firsttime) {
          $rootScope.service.Ana('createProfile');
        } else {
          $rootScope.service.Ana('updateProfile');
        }

        if ($rootScope.preApply) {
          $rootScope.service.userLike($rootScope.preApply.card, 0, $rootScope.preApply.jobOffer)
        }
        $state.go('jobseeker.dash', {}, {reload: true});
        $cordovaToast.showShortTop('Cập nhật hồ sơ thành công');
        if (!$rootScope.userData.avatar) {
          $cordovaToast.showShortTop('Bạn cần cập nhật avatar thì thông tin của bạn mới được hiện thị cho nhà tuyển dụng, hãy cập nhật ngay!');
        }

      } else {
        console.log($rootScope.userData);
        $scope.error = {}
        for (var i in $rootScope.userData) {
          if ($rootScope.userData[i]) {

          } else {
            $scope.error[i] = true;

            $timeout(function () {
              console.log($scope.error)
            })
          }
        }
        $cordovaToast.showShortTop('Bạn chưa cập nhật đủ thông tin', 'Lỗi');
      }
    }
  }
)
;
