"use strict";


app.controller('introController', function ($state, $scope, $ionicLoading, $rootScope, $ionicDeploy, $cordovaToast, $timeout, $ionicPopup, $snackbar, CONFIG, $ionicSlideBoxDelegate, $ionicPlatform) {
  $scope.slideTo = function (index) {
    $ionicSlideBoxDelegate.slide(index);
  };


  firebase.database().ref('config').on('value', function (snap) {
    $scope.checkUpdate = snap.val().isShowUpdate;
    if ($scope.checkUpdate == 1) {
      $scope.updateversion()
    }
  });

  $scope.updateversion = function () {
    console.log("checking");
    $ionicDeploy.check().then(function (snapshotAvailable) {
      if (snapshotAvailable) {
        $ionicLoading.show({
          template: '<p>Đang cập nhật phiên bản mới...</p><ion-spinner></ion-spinner>'
        });
        $ionicDeploy.download().then(function () {
          $ionicDeploy.extract().then(function (process) {
            console.log("Process", process);
            $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
              title: 'Đã cập nhật phiên bản mới',
              template: '<p style="text-align: center">Nhấn ok để làm mới</p>'
            });
            alertPopup.then(function (res) {
              $ionicDeploy.load();
            });
          });
        });
      }
    });

  };


  $scope.deviceHeight = window.innerHeight;
  $scope.checkuser = function () {


    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner></ion-spinner>'
    });
    firebase.auth().onAuthStateChanged(function (user) {
        if (user && !$rootScope.registering) {
          $rootScope.userid = firebase.auth().currentUser.uid;
          firebase.database().ref('user/' + $rootScope.userid + '/type').once('value', function (snap) {
            console.log(snap.val());
            if (snap.val() == 1) {
              $state.go('employer.dash')
            }
            if (snap.val() == 2) {
              $state.go('jobseeker.dash')
            }
            $ionicLoading.hide();
            $cordovaToast.showLongCenter("Đăng nhập thành công! Đang chuyển hướng...")

          });
        } else {
          console.log("Hãy đăng nhập!")
          $ionicLoading.hide();

        }
      }
    );

  };
  $scope.lockSlide = function () {
    $ionicSlideBoxDelegate.enableSlide(false)
  };
  $scope.signupPage = function () {
    $ionicSlideBoxDelegate.previous()
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
      checkSignupOrSignIn(userData, type)
    }
  };
  $scope.Gotosignup = function () {
    $state.go('esignup',{slide:1});

  }

  $scope.googleLogin = function () {
    window.plugins.googleplus.login(
      {
        'redirect_uri': 'localhost',
        'webClientId': '748631498782-8svrsk4pv9ud6ve7o74k05d5bnl0gclj.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
      },
      function (obj) {
        alert(JSON.stringify(obj)); // do something useful instead of alerting
      },
      function (msg) {
        alert('error: ' + msg);
      }
    );

  }


  $scope.Login = function () {
    $ionicSlideBoxDelegate.next();
    $scope.$on('$ionicView.enter', function () {
      $ionicHistory.clearCache();
      console.log("clear");

    });
    $ionicPlatform.registerBackButtonAction(function () {
      $ionicSlideBoxDelegate.previous()
    }, 100);


    $scope.doLogin = function (userLogin) {
      $ionicLoading.show({
        template: '<ion-spinner class="spinner-positive"></ion-spinner>'
      });

      console.log(userLogin);


      firebase.auth().signInWithEmailAndPassword(userLogin.username, userLogin.password).then(function () {

        $rootScope.userid = firebase.auth().currentUser.uid;
        firebase.database().ref('user/' + $rootScope.userid + '/type').once('value', function (snap) {
          console.log(snap.val());
          if (snap.val() == 1) {
            $state.go('employer.dash')
          }
          if (snap.val() == 2) {
            $state.go('jobseeker.dash')
          }
        })
      }, function (error) {
        $ionicLoading.hide();

        // An error happened.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        if (errorCode === 'auth/invalid-email') {
          $cordovaToast.showShortTop('Kiểm tra lại email.');
          return false;
        } else if (errorCode === 'auth/wrong-password') {
          $cordovaToast.showShortTop('Mật khẩu không đúng.');
          return false;
        } else if (errorCode === 'auth/argument-error') {
          $cordovaToast.showShortTop('Password must be string.');
          return false;
        } else if (errorCode === 'auth/user-not-found') {
          $cordovaToast.showShortTop('Email này không tồn tại.');
          return false;
        } else if (errorCode === 'auth/too-many-requests') {
          $cordovaToast.showShortTop('Too many failed login attempts, please try after sometime.');
          return false;
        } else if (errorCode === 'auth/network-request-failed') {
          $cordovaToast.showShortTop('Request timed out, please try again.');
          return false;
        } else {
          $cordovaToast(errorMessage);
          return false;
        }

      });


    };// end $scope.doLogin()

  }
})
  .controller('resetController', ['$scope', '$state', '$document', '$firebaseArray', 'CONFIG', '$cordovaToast', function ($scope, $state, $document, $firebaseArray, CONFIG, $cordovaToast) {

    $scope.doResetemail = function (userReset) {



      //console.log(userReset);

      if ($document[0].getElementById("ruser_name").value != "") {


        firebase.auth().sendPasswordResetEmail(userReset.rusername).then(function () {
          // Sign-In successful.
          //console.log("Reset email sent successful");

          $state.go("login");


        }, function (error) {
          // An error happened.
          var errorCode = error.code;
          console.log(errorCode);


          if (errorCode === 'auth/user-not-found') {
            $cordovaToast.showShortTop('Email này không đúng.');
            return false;
          } else if (errorCode === 'auth/invalid-email') {
            $cordovaToast.showShortTop('Email you entered is not complete or invalid.');
            return false;
          }

        });


      } else {

        $cordovaToast.showShortTop('Please enter registered email to send reset link');
        return false;

      }//end check client username password


    };// end $scope.doSignup()


  }])

