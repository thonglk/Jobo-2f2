"use strict";


app.controller('introController', function ($state, $scope, $ionicLoading, $rootScope, $ionicDeploy, $timeout, $ionicPopup, $snackbar, CONFIG, $ionicSlideBoxDelegate, $ionicPlatform, $cordovaToast, $stateParams) {

  $scope.$watch(function (scope) {
      return scope.slideIndex
    },
    function (newValue, oldValue) {
      switch (newValue) {
        case 0:
        case 2:
          $ionicSlideBoxDelegate.enableSlide(false);
          break;
      }
    }
  );

  if ($stateParams.id) {
    console.log($stateParams.id)
    $scope.slideIndex = $stateParams.id
  } else {
    $scope.slideIndex = 0
  }

  $scope.slideTo = function (index) {
    $ionicSlideBoxDelegate.slide(index);
  };


  $scope.lockSlide = function () {
    $ionicSlideBoxDelegate.enableSlide(false)
  };
  $scope.signupPage = function () {
    $ionicSlideBoxDelegate.previous()
  };


  $scope.Gotosignup = function () {
    $state.go('esignup', {slide: 1});
  }


  $scope.doLogin = function (userLogin) {
    $ionicLoading.show({
      template: '<ion-spinner class="spinner-positive"></ion-spinner>'
    });
    console.log(userLogin);

    secondary.auth().signInWithEmailAndPassword(userLogin.username, userLogin.password).then(function () {

      $rootScope.userId = secondary.auth().currentUser.uid;
      firebase.database().ref('user/' + $rootScope.userId + '/type').once('value', function (snap) {
        console.log(snap.val());
        $rootScope.service.Ana($rootScope.userId, 'login', {type: 'normal'})

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


})
  .controller('resetController', ['$scope', '$state', '$document', '$firebaseArray', 'CONFIG', '$cordovaToast', function ($scope, $state, $document, $firebaseArray, CONFIG, $cordovaToast) {

    $scope.doResetemail = function (userReset) {



      //console.log(userReset);

      if ($document[0].getElementById("ruser_name").value != "") {


        secondary.auth().sendPasswordResetEmail(userReset.rusername).then(function () {
          // Sign-In successful.
          //console.log("Reset email sent successful");
          $rootScope.service.Ana($rootScope.userId, 'reset_email')

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

  .controller('signupCtrl', function ($scope, $rootScope, $stateParams, $http, $ionicLoading, $ionicSlideBoxDelegate, $cordovaToast) {

    $scope.lockSlide = function () {
      $ionicSlideBoxDelegate.enableSlide(false)
    };

    var type = $stateParams.id;
    $scope.slideChanged = function (index) {
      console.log($ionicSlideBoxDelegate.currentIndex()
      )
    }
    $scope.type = type;
    console.log('type', type)
    $scope.doSignup = function (userSignup) {

      $rootScope.registering = true;
      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner></ion-spinner>'
      });

      secondary.auth().createUserWithEmailAndPassword(userSignup.username, 'tuyendungjobo').then(function (user) {

        $rootScope.userId = user.uid
        $scope.usersRef = firebase.database().ref('user/' + user.uid);
        $scope.usersRef.update({
          type: $scope.type,
          phone: '',
          userId: user.uid,
          email: userSignup.username,
          createdAt: new Date().getTime()
        });
        $rootScope.service.Ana($rootScope.userId, 'signup', {type: 'normal', role: type})
        console.log("create successful");
        $ionicLoading.hide();
        if ($scope.type == 1) {
          $ionicSlideBoxDelegate.slide(1);
        }
        if ($scope.type == 2) {
          $ionicSlideBoxDelegate.slide(2);
        }
        $cordovaToast.showShortTop('Mật khẩu đăng nhập của bạn là: tuyendungjobo')

      }, function (error) {
        $ionicLoading.hide();

        // An error happened.
        var errorCode = error.code;
        console.log(errorCode);

        if (errorCode === 'auth/weak-password') {
          $cordovaToast.showShortTop('Mật khẩu không an toàn, hãy chọn mật khẩu khác!');
          return false;
        } else if (errorCode === 'auth/email-already-in-use') {
          $cordovaToast.showShortTop('Email này đã được sử dụng rồi');

          return false;
        }
      });
    };// end $scope.doSignup()

    $scope.facebookLogin = function (type) {
      $rootScope.service.Ana($rootScope.userId, 'signup', {type: 'fb', role: type})

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
        secondary.auth().signInWithCredential(cre).then(function (result) {
          $rootScope.userId = result.uid;

          console.log("SignInWithCredential", JSON.stringify(result));

          var userData = {
            userId: result.uid,
            name: result.displayName,
            email: result.email,
            createdAt: new Date().getTime()
          };

          checkSignupOrSignIn(userData, type);
        })
      }

      function checkSignupOrSignIn(userData, type) {
        var userRef = firebase.database().ref("user/" + userData.userId);
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
        if (type == 1) {
          $state.go('store')
        }
        if (type == 2) {
          $state.go('profile')
        }
      }
    };
  })
