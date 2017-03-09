'use strict';
app.controller('ssignupController', ['$scope', '$state', '$document', '$firebaseArray', 'CONFIG', '$ionicSlideBoxDelegate', '$http', '$cordovaToast', '$rootScope', '$ionicLoading', '$ionicActionSheet', '$cordovaCamera', '$ionicPlatform', '$ionicPopup', '$ionicHistory',
  function ($scope, $state, $document, $firebaseArray, CONFIG, $ionicSlideBoxDelegate, $http, $cordovaToast, $rootScope, $ionicLoading, $ionicActionSheet, $cordovaCamera, $ionicPlatform, $ionicPopup, $ionicHistory) {
    $ionicPlatform.registerBackButtonAction(function () {
      if ($scope.slideIndex) {
        $ionicSlideBoxDelegate.previous();
      } else {
        $ionicHistory.goBack();

      }
    }, 100);

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
    };


    $scope.facebookLogin = function () {
      $ionicLoading.show({
        template: '<ion-spinner class="spinner-positive"></ion-spinner>'
      });

      var facebooklog = true;

      $cordovaOauth.facebook("295208480879128", ["email"]).then(function (result) {
        console.log(result)
        console.log(result.access_token)

        var credential = firebase.auth.FacebookAuthProvider.credential(result.access_token);
        // Sign in with the credential from the Facebook user.
        console.log(credential)

        firebase.auth().signInWithCredential(credential).then(function (result) {
          console.log(result);
          firebase.auth().onAuthStateChanged(function (user) {
            if (user && facebooklog == true) {
              console.log(user);
              var userRef = firebase.database().ref("user/" + user.uid);
              userRef.once('value', function (snap) {
                if (snap.val()) {
                  $state.go('employer.dash')
                } else {
                  userRef.update({
                    type: 1,
                    name: user.displayName,
                    userid: user.uid,
                    email: user.email,
                    photourl: 'img/macdinh.jpg',
                    createdAt: new Date().getTime()
                  });
                  console.log("create username successful");
                  $ionicLoading.hide();
                  $ionicSlideBoxDelegate.next();
                }
              })

            } else {
              // No user is signed in.
            }
          });
        })
      })
    }
    $scope.googleLogin = function () {

      $cordovaOauth.google("748631498782-qt0hmdnb267fh9ltn0aktb7re2fjq944.apps.googleusercontent.com", ["email"]).then(function (result) {
        console.log("Response Object -> " + JSON.stringify(result.access_token));
        var credential = firebase.auth.GoogleAuthProvider.credential(result.access_token)
        // Sign in with the credential from the Facebook user.

        firebase.auth().signInWithCredential(credential).then(function (result) {
          console.log(result);
          firebase.auth().onAuthStateChanged(function (user) {
            if (user && facebooklog == true) {
              console.log(user);
              var userRef = firebase.database().ref("user/" + user.uid);
              userRef.once('value', function (snap) {
                if (snap.val()) {
                  $state.go('employer.dash')
                } else {
                  userRef.update({
                    type: 1,
                    name: user.displayName,
                    userid: user.uid,
                    email: user.email,
                    photourl: 'img/macdinh.jpg',
                    createdAt: new Date().getTime()
                  });
                  console.log("create username successful");
                  $ionicLoading.hide();
                  $ionicSlideBoxDelegate.next();
                }
              })

            } else {
              // No user is signed in.
            }
          });
        })
      }, function (error) {
        console.log("Error -> " + error);
      });
    }

    $scope.doSignup = function (userSignup) {

      $rootScope.registering = true;
      if ($document[0].getElementById("cuser_name").value != "" && $document[0].getElementById("cuser_pass").value != "") {
        $ionicLoading.show({
          template: '<p>Loading...</p><ion-spinner></ion-spinner>'
        });

        firebase.auth().createUserWithEmailAndPassword(userSignup.username, userSignup.password).then(function (user) {

          $rootScope.userid = user.uid
          $scope.usersRef = firebase.database().ref('user/' + user.uid);
          $scope.usersRef.update({
            type: 2,
            phone: userSignup.phone,
            userid: user.uid,
            email: userSignup.username,
            photourl: "img/macdinh.jpg",
            createdAt: new Date().getTime()
          });
          console.log("update username successful");
          $ionicLoading.hide();

          $ionicSlideBoxDelegate.next();


        }, function (error) {
          $ionicLoading.hide();

          // An error happened.
          var errorCode = error.code;
          console.log(errorCode);

          if (errorCode === 'auth/weak-password') {
            $cordovaToast.showShortTop('Mật khẩu không an toàn, hãy chọn mật khẩu khác!');
            return false;
          } else if (errorCode === 'auth/email-already-in-use') {
            $scope.previous();
            $cordovaToast.showShortTop('Email này đã được sử dụng rồi');

            return false;
          }
        });


      } else {
        $cordovaToast.showShortTop('Hãy điền email và password');
        return false;

      }//end check client username password


    };// end $scope.doSignup()

    $scope.doUpdate = function (userSignup) {
      console.log(userSignup);
      $scope.usersRef.update({
        phone: userSignup.phone,

      });
      console.log("phone ok");
      $ionicSlideBoxDelegate.next();
    };

    $scope.userInfo = {};

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
      $scope.userInfo.school = $scope.school.name

    };


    //$scope.address = {value: ''};
    /*$scope.$watch('address', function (newValue, oldValue) {

     });*/
    $scope.autocompleteAddress = {text: ''};
    $scope.setSelectedAddress = function (selectedAddress) {
      $scope.address = selectedAddress;
      console.log($scope.address);

      $scope.userInfo.address = $scope.address.formatted_address;
      $scope.userInfo.location = {};
      $scope.userInfo.location.lat = $scope.address.geometry.location.lat;
      $scope.userInfo.location.lng = $scope.address.geometry.location.lng;
    };
    $scope.searchAddress = function () {
      $scope.URL = 'https://maps.google.com/maps/api/geocode/json?address=' + $scope.autocompleteAddress.text + '&components=country:VN&sensor=true&key=AIzaSyCly7S-AaWT0UD7eLI2cKq6-DfhS4ex6zc&callback=JSON_CALLBACK';
      $http({
        method: 'GET',
        url: $scope.URL
      }).then(function successCallback(response) {

        $scope.ketquasAddress = response.data.results;
        console.log($scope.ketquasAddress);
      })

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
                    var url = uploadTask.snapshot.metadata.downloadURLs[0];
                    $scope.userInfo.photourl = url
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
                    var url = uploadTask.snapshot.metadata.downloadURLs[0];
                    $scope.userInfo.photourl = url

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

    $scope.saveInfo = function () {
      $scope.profileRef = firebase.database().ref('profile/' + $rootScope.userid);
      $scope.userInfo.userid = $rootScope.userid;
      $scope.profileRef.update($scope.userInfo);
      $scope.next();
      $cordovaToast.showShortTop('Lưu!');

    };


    $scope.newHospital = {};
    $scope.createHospital = function () {
      $scope.profileRef.update($scope.newHospital);

      $scope.next();

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
        } else {
          console.log('You are not sure');
        }
      });
    }

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
  }]);

