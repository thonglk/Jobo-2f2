"use strict";
app.controller('esignupController', ['CONFIG', '$ionicModal', '$cordovaOauth', '$scope', '$state', '$document', '$firebaseArray', '$ionicSlideBoxDelegate', '$ionicActionSheet', '$http', '$cordovaCamera', '$rootScope', '$ionicLoading', '$cordovaToast', '$ionicPlatform', '$ionicPopup', '$ionicHistory', '$stateParams',
  function (CONFIG, $ionicModal, $cordovaOauth, $scope, $state, $document, $firebaseArray, $ionicSlideBoxDelegate, $ionicActionSheet, $http, $cordovaCamera, $rootScope, $ionicLoading, $cordovaToast, $ionicPlatform, $ionicPopup, $ionicHistory, $stateParams) {
    $scope.params = $stateParams.slide;
    console.log($scope.params);
    $scope.lockSlide = function () {
      $ionicSlideBoxDelegate.enableSlide(false);
    };
    $scope.next = function () {
      $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function () {
      $ionicSlideBoxDelegate.previous();
    };

    // Called each time the slide changes
    $scope.slideChanged = function (index) {
      $scope.slideIndex = index;
      console.log($scope.slideIndex)
    };

    $scope.slideTo = function (index) {
      $ionicSlideBoxDelegate.slide(index);
    };

    $scope.facebookLogin = function (type) {

      var fbLoginSuccess = function (userData) {
        var accessToken = userData.authResponse.accessToken;
        var credential = firebase.auth.FacebookAuthProvider.credential(accessToken);

        SignInWithCredential(credential);
        // Sign in with the credential from the Facebook user.

      };
      facebookConnectPlugin.login(["public_profile"], fbLoginSuccess,
        function loginError(error) {
          console.error(error)
        }
      );

      function SignInWithCredential(cre) {
        firebase.auth().signInWithCredential(cre).then(function (result) {
          $rootScope.userid = result.uid;

          console.log("SignInWithCredential", JSON.stringify(result));

          var userData = {
            userid: result.uid,
            name: result.displayName,
            email: result.email,
            photourl: 'img/macdinh.jpg',
            createdAt: new Date().getTime()
          };

          checkSignupOrSignIn(userData, type);
        })
      }

      function checkSignupOrSignIn(userData, type) {
        var userRef = firebase.database().ref("user/" + userData.userid);
        userRef.once('value', function (snap) {
          console.log('checkSignupOrSignIn', type, JSON.stringify(snap.val()));
          if (snap.val()) {
            console.log('Đăng nhập')
            type = snap.val().type;
            if (type == 1) {
              console.log('employer go to');

              $state.go('employer.dash')
            }
            if (type == 2) {
              $state.go('jobseeker.dash')
            }
          } else {
            console.log('Đăng ký');

            if (!type) {

              // A confirm dialog
              var confirmPopup = $ionicPopup.confirm({
                title: 'Bạn là?',
                template: 'Hãy chọn đúng vai trò sử dụng của bạn, tác vụ này sẽ không lặp lại vào lần sau?',
                scope: null, // Scope (optional). A scope to link to the popup content.
                buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                  text: 'Nhà tuyển dụng',
                  type: 'button-default',
                  onTap: function (e) {
                    type = 1;
                    return type;
                  }
                }, {
                  text: 'Ứng viên',
                  type: 'button-positive',
                  onTap: function (e) {
                    type = 2;
                    return type;
                  }
                }]
              });

              confirmPopup.then(function (res) {
                if (res) {
                  console.log('You are sure', res);
                  createDataUser(userRef, userData, type)
                } else {
                  console.log('You are not sure');
                }
              });
            }
            if (type) {
              console.log('has type');

              if (!userData.email) {
                // A confirm dialog
                $ionicPopup.confirm({
                  title: 'Email của bạn?',
                  template: '<label class="item item-input"><input type="email" ng-model="username" id="user_name" placeholder="Email"></label>',
                  scope: $scope, // Scope (optional). A scope to link to the popup content.
                  buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                    text: 'OK',
                    type: 'button-default',
                    onTap: function (e) {
                      userData.email = $scope.username;
                    }
                  }]
                }).then(function (res) {
                  if (res) {
                    console.log('You are sure', res);
                    createDataUser(userRef, userData, type)
                  } else {
                    console.log('You are not sure');
                  }
                });
              }

              createDataUser(userRef, userData, type)
            }


          }
        })

      }

      function createDataUser(userRef, userData, type) {
        userData.type = type;
        userRef.update(userData);
        console.log("create username successful");
        $ionicLoading.hide();
        $ionicSlideBoxDelegate.next()

      }
    };

    $ionicPlatform.registerBackButtonAction(function () {
      if ($scope.slideIndex) {
        $ionicSlideBoxDelegate.previous();
      } else {
        $ionicHistory.goBack();

      }
    }, 100);


    $scope.doSignup = function (userSignup) {
      $rootScope.registering = true;

      $ionicLoading.show({
        template: '<ion-spinner class="spinner-positive"></ion-spinner>'
      });
      firebase.auth().createUserWithEmailAndPassword(userSignup.username, userSignup.password).then(function (user) {
        $rootScope.userid = user.uid;

        $scope.userRef = firebase.database().ref("user/" + user.uid);
        $scope.userRef.update({
          type: 1,
          name: userSignup.name,
          userid: user.uid,
          email: user.email,
          photourl: 'img/restaurant.png',
          createdAt: new Date().getTime()
        });
        console.log("create username successful");
        $ionicLoading.hide();

        $ionicSlideBoxDelegate.next();


      }, function (error) {
        $ionicLoading.hide();

        // An error happened.
        var errorCode = error.code;
        console.log(errorCode);

        if (errorCode === 'auth/weak-password') {
          $cordovaToast.showShortTop('Mật khẩu yếu, hãy chọn mật khẩu dài hơn');
          return false;
        } else if (errorCode === 'auth/email-already-in-use') {
          $ionicSlideBoxDelegate.previous();

          $cordovaToast.showShortTop('Email này đã được sử dụng, hãy chọn email khác');

          return false;
        }


      });


    };// end $scope.doSignup()

    // Add store
    $scope.addStore = function () {
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
          $scope.userRef.update({
            currentStore: newStoreKey
          })

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
          console.log(storeData);


          var newStoreRef = firebase.database().ref('store/' + newStoreKey);
          newStoreRef.update(storeData);

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
          $state.go('employer.dash')
        };


        $scope.cancel = function () {
          $scope.modalAddStore.hide();

        }
      })
    };


    $scope.doUpdate = function (userSignup) {
      $ionicLoading.show({
        template: '<ion-spinner class="spinner-positive"></ion-spinner>'
      });
      $scope.userRef.update({
        phone: userSignup.phone,

      });
      console.log("update successful");
      $ionicLoading.hide();
      $ionicSlideBoxDelegate.next();
    };

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
                    $scope.photoUpload = uploadTask.snapshot.metadata.downloadURLs[0];
                    $cordovaToast.showShortTop("Cập nhật ảnh thành công");
                    $ionicLoading.hide();
                    $scope.next()

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
                    $scope.photoUpload = uploadTask.snapshot.metadata.downloadURLs[0];
                    $ionicLoading.hide();
                    $scope.next()
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
  }
])
;
