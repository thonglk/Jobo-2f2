angular.module('starter.services', [])
  .service('myService', function (CacheFactory) {
    var profileCache;

    // Check to make sure the cache doesn't already exist
    if (!CacheFactory.get('profileCache')) {
      profileCache = CacheFactory('profileCache');
    }
  })

  .service('AuthUser', function ($rootScope, $q, $http, CONFIG, $timeout, $state, $cordovaSocialSharing, $ionicPopup, $cordovaToast, $ionicLoading, $ionicModal) {
    var messaging = firebase.messaging();
    var db = firebase.database()

    this.fcm = function () {
      checkFCM()

    }
    this.$back = function () {
      window.history.back();
    };
    this.saveMobileToken = function () {
      if (typeof FCMPlugin != 'undefined') {
        getTheToken()

      }
    }
    function checkFCM() {
      if (typeof FCMPlugin != 'undefined') {
        console.log("check done fcm");

        FCMPlugin.onNotification(
          function (data) {
            console.log("data", data);
            if (data.wasTapped) {

              window.location.href = data.linktoaction;
              //Notification was received on device tray and tapped by the user.
            } else {
              $cordovaToast.showShortTop(data.body)
            }
          }
        );
        FCMPlugin.onTokenRefresh(function (token) {
          console.log('tokenRefresh', token)
          getTheToken()
        });

        getTheToken()

      } else {
        console.log("null fcm");
      }

    }

    function getTheToken() {
      FCMPlugin.getToken(
        function (token) {
          if (token) {
            $rootScope.tokenuser = token;
            console.log("I got the token: " + token);
            $rootScope.service.JoboApi('update/user',{
              userId: $rootScope.userId,
              user: {
                mobileToken: token
              }
            });
            /*firebase.database().ref('user/' + $rootScope.userId)
              .update({mobileToken: token})*/
            $rootScope.service.Ana('get_token', token)
          } else {
            console.log("null token");
            $timeout(getTheToken, 1000);
          }
        },
        function (err) {
          console.log('error retrieving token: ' + err);
        }
      );
    }
    this.getNotification = function (userId) {
      firebase.database().ref('notification/' + userId).orderByChild('createdAt').limitToFirst(10)
        .on('value', function (snap) {
          $timeout(function () {
            $rootScope.notification = $rootScope.service.ObjectToArray(snap.val())
            console.log($rootScope.notification)
            $rootScope.newNoti = $rootScope.service.calNoti($rootScope.notification)
          })
        })
    }
    this.user = function () {
      var output = {},
        deferred = $q.defer();
      secondary.auth().onAuthStateChanged(function (user) {
        console.log('Auth')
        if (user) {
          $rootScope.userId = user.uid;
          $rootScope.service.JoboApi('initData', {userId: $rootScope.userId}).then(function (res) {
            console.log(res);
            var user = res.data;
            console.log('user', user);
            $rootScope.userData = user.userData;
            output = $rootScope.userData;
            deferred.resolve(output);
            $rootScope.type = $rootScope.userData.type;
            if ($rootScope.userData.currentStore) {
              $rootScope.storeId = $rootScope.userData.currentStore
            }
            $rootScope.storeList = user.storeList;
            $rootScope.storeData = user.storeData;
            $rootScope.notification = $rootScope.service.ObjectToArray(user.notification);
            $rootScope.newNoti = $rootScope.service.calNoti($rootScope.notification);
            $rootScope.reactList = user.reactList;
            $rootScope.$broadcast('handleBroadcast', $rootScope.userId);

          })
          /*firebase.database().ref('user/' + $rootScope.userId)
            .once('value', function (snap) {
              $rootScope.userData = snap.val()
              $rootScope.type = $rootScope.userData.type;
              if ($rootScope.userData.currentStore) {
                $rootScope.storeId = $rootScope.userData.currentStore
              }
              output = $rootScope.userData;
              console.log(output)
              deferred.resolve(output);
            })*/
          // User is signed in.
        } else {
          $rootScope.type = 0;

          output = {type: 0}
          console.log(output)
          deferred.resolve(output);
          // No user is signed in.
        }
      });

      return deferred.promise;
    }

    this.sendVerifyEmail = function (userId) {
      console.log('sendVerifyEmail')
      $rootScope.service.JoboApi('sendverify', {id: userId})
      $cordovaToast.showShortTop('Đã gửi lại email, hãy kiểm tra hòm mail của bạn')
    }
    this.storeLike = function (card, action, jobOffer) {
      $rootScope.jobOffer = {}

      var selectedJob = {}
      selectedJob[jobOffer] = new Date().getTime()
      if ($rootScope.type == 1) {

        if (!$rootScope.clicked) {
          $rootScope.clicked = {}
        }
        var output = {},
          deferred = $q.defer();

        var likedId = card.userId;
        var likeActivity = firebase.database().ref('activity/like/' + $rootScope.storeId + ':' + likedId);

        if (card.act && card.act.type == 2 && card.act.status == 0) {
          likeActivity.update({
            matchedAt: new Date().getTime(),
            status: 1,
            jobStore: selectedJob
          });
          console.log('match')
          output = {
            result: 1,
            userId: card.userId,
            storeId: $rootScope.storeId
          }
          $rootScope.service.Ana('match', {userId: card.userId, job: jobOffer})

          itsMatch(card)
        } else {
          if (card.act && card.act.jobUser) {

          }
          likeActivity.update({
            likeAt: new Date().getTime(),
            type: 1,
            status: action,
            jobStore: selectedJob,
            employerId: $rootScope.userId,
            storeId: $rootScope.storeId,
            storeName: $rootScope.storeData.storeName,
            storeAvatar: $rootScope.storeData.avatar || '',
            userAvatar: card.avatar || '',
            userName: card.name,
            userId: card.userId

          })
          $rootScope.clicked[card.userId] = true

          output = {
            result: 0,
            userId: card.userId,
            storeId: $rootScope.storeId
          }
          $rootScope.service.Ana('like', {userId: card.userId, job: jobOffer})
          $cordovaToast.showShortTop('Đã gửi lời mời đến cho ' + card.name)

        }

        deferred.resolve(output);
        return deferred.promise;
      } else {
        if ($rootScope.type == 2) {
          $cordovaToast.showShortTop('Chỉ có nhà tuyển dụng mới có quyền tuyển ứng viên!')
        } else {
          $cordovaToast.showShortTop('Bạn phải đăng nhập để tuyển ứng viên này!')
        }
      }
    };
    this.userLike = function (card, action, jobOffer) {
      $rootScope.jobOffer = {}

      var selectedJob = {}
      selectedJob[jobOffer] = new Date().getTime()

      if ($rootScope.type == 2) {
        if (!$rootScope.clicked) {
          $rootScope.clicked = {}
        }
        var output = {},
          deferred = $q.defer();

        var likedId = card.storeId;
        var likeActivity = firebase.database().ref('activity/like/' + likedId + ':' + $rootScope.userId);
        likeActivity.on('value', function (snap) {
          card.act = snap.val()
        })

        if (card.act && card.act.type == 1) {
          likeActivity.update({
            matchedAt: new Date().getTime(),
            status: 1,
            jobUser: selectedJob
          });
          output = {
            result: 1,
            storeId: card.storeId,
            userId: $rootScope.userId

          }
          itsMatch(card);
          $rootScope.service.Ana('match', {storeId: card.storeId, job: jobOffer})
        } else {
          if (card.act && card.act.jobUser) {
            selectedJob = Object.assign(selectedJob, card.act.jobUser)
          }
          if ($rootScope.userData.avatar && $rootScope.userData.name) {
            likeActivity.update({
              likeAt: new Date().getTime(),
              type: 2,
              status: action,
              jobUser: selectedJob,
              employerId: card.createdBy,
              storeId: likedId,
              storeName: card.storeName,
              storeAvatar: card.avatar || "",
              userAvatar: $rootScope.userData.avatar || "",
              userName: $rootScope.userData.name,
              userId: $rootScope.userId
            })
            output = {
              result: 0,
              storeId: likedId,
              userId: $rootScope.userId
            }
            $rootScope.clicked[card.storeId] = true
            $rootScope.service.Ana('like', {storeId: card.storeId, job: jobOffer})
            $cordovaToast.showShortTop('Bạn đã ứng tuyển vào ' + card.storeName)
          } else {
            $rootScope.service.Ana('like_error', {storeId: card.storeId, job: jobOffer})
            $cordovaToast.showShortTop('Bạn cần cập nhật ảnh đại diện và tên để ứng tuyển')
            $state.go('profile')
          }
        }
        deferred.resolve(output);
        return deferred.promise;
      } else {
        if ($rootScope.type == 1) {
          $cordovaToast.showShortTop('Chỉ có ứng viên mới có thể ứng tuyển vào vị trí này!')
        } else {
          $state.go('signup', {id: 2, apply: card.storeId, job: jobOffer})
        }
      }

    }

    this.itsMatch = function (card) {
      $cordovaToast.showShortCenter(card.storeName + ' và ' + card.userId + ' đã tương hợp với nhau, hãy đặt lịch phỏng vấn!')
    }

    this.timeAgo = function (timestamp) {
      var time;
      timestamp = new Date(timestamp).getTime()
      var now = new Date().getTime()
      var a = now - timestamp
      if (a > 0) {
        var minute = Math.round(a / 60000);
        if (minute < 60) {
          time = minute + " phút trước"
        } else {
          var hour = Math.round(minute / 60);
          if (hour < 24) {
            time = hour + " giờ trước"
          } else {
            var day = Math.round(hour / 24);
            if (day < 30) {
              time = day + " ngày trước"
            } else {
              var month = Math.round(day / 30);
              if (month < 12) {
                time = month + " tháng trước"
              } else {
                var year = Math.round(month / 12);
                time = year + " năm trước"
              }
            }
          }
        }

        return time;
      }
      if (a < 0) {
        a = Math.abs(a);

        var minute = Math.round(a / 60000);
        if (minute < 60) {
          time = "còn " + minute + " phút"
        } else {
          var hour = Math.round(minute / 60);
          if (hour < 24) {
            time = "còn " + hour + " giờ"
          } else {
            var day = Math.round(hour / 24);
            if (day < 30) {
              time = "còn " + day + " ngày"
            } else {
              var month = Math.round(day / 30);
              if (month < 12) {
                time = "còn " + month + " tháng"
              } else {
                var year = Math.round(month / 12);
                time = "còn " + year + " năm "
              }
            }
          }
        }

        return time;

      }

    }

    this.Ana = function (action, data) {
      if (!data) {
        data = {}
      }
      var anany = $rootScope.userId
      if (!$rootScope.userId) {
        anany = window.localStorage.getItem('anany')
        if (!anany) {
          anany = Math.round(100000000000000 * Math.random())
          window.localStorage.setItem('anany', anany)
        }
      }

      data.agent = $rootScope.checkAgent.platform + ':' + $rootScope.checkAgent.device;
      // var logRef = firebase.database().ref('log')
      var actRef = firebase.database().ref('act')

      var analyticKey = Math.round(100000000000000 * Math.random());

      var obj = {
        userId: anany,
        action: action,
        createdAt: new Date().getTime(),
        data: data,
        id: analyticKey
      }

      // logRef.child(analyticKey).set(obj)
      $rootScope.service.JoboApi('update/log', {
        userId: anany,
        key: analyticKey,
        log: obj
      });
      console.log("Jobo Analytics", obj);

      if (action == 'createProfile'
        || action == 'createStore'
        || action == 'updateProfile'
        || action == 'updateStore'
        || action == 'viewStore'
        || action == 'like'
        || action == 'viewProfile'
        || action == 'match'

      ) {
        actRef.child(analyticKey).set(obj)
        console.log("Jobo act", obj);
      }

    }

    this.shortAddress = function (fullAddress) {
      if (fullAddress) {
        var mixAddress = fullAddress.split(",")
        var address = mixAddress[0] + ', ' + mixAddress[1] + ', ' + mixAddress[2]
        return address
      }
    };

    this.nextLine = function (text) {
      if (text) {
        return text.split(/\r\n|\r|\n/g);
      }
    }
    this.upperName = function (fullname) {
      var arrayName = fullname.toLowerCase().split(" ")
      var Name = "";
      for (var i in arrayName) {
        var N = arrayName[i].charAt(0).toUpperCase()
        var n = arrayName[i].replace(arrayName[i].charAt(0), N);
        Name = Name + " " + n
      }

      var n = Name.match(/\d+/g)

      console.log(n)

      for (var i in n) {
        Name = Name.replace(n[i], "");
      }

      return Name
    }
    this.calReview = function (reviewData) {
      if (reviewData) {
        var totalReview = Object.keys(reviewData).length
        var total = 0
        for (var i in reviewData) {
          var card = reviewData[i];
          total += card.rate;
        }
        var average = total / totalReview;
        var avergageRounded = Math.round(average * 10) / 10;
        var obj = {}
        for (i = 0; i < avergageRounded; i++) {
          obj[i] = true
        }
        var output = {
          average: avergageRounded,
          total: totalReview,
          obj: obj


        }
        return output
      }

    }
    this.JoboApi = function (url, params) {
      var res = {};
      var defer = $q.defer()

      $http({
        method: 'GET',
        url: CONFIG.APIURL + '/' + url,
        params: params
      }).then(function successCallback(response) {
        console.log("respond", response);
        res = response
        defer.resolve(res)
      }, function (error) {
        console.log(error);
        res = error

        defer.resolve(res)
      })
      return defer.promise

    }
    this.convertDate = function (date) {
      var str = date;
      var res = str.slice(0, 2);
      var res2 = str.slice(2, 4);
      var res3 = str.slice(4, 8);
      var createDate = new Date(res3, res2, res)
      return createDate
    }
    this.convertDateRes = function (date) {
      var k = new Date(date).getDate()
      if (k <= 9) {
        k = '0' + k;
      }

      var a = new Date(date).getMonth()
      if (a <= 9) {
        a = '0' + a;
      }

      var x = new Date(date).getFullYear()

      var c = k + '' + a + '' + x

      return c

    }
    this.getfirst = function (obj) {
      if (obj) {
        return Object.keys(obj)[0]

      } else {
        return ''
      }
    }
    this.getStringJob = function (listJob) {
      var stringJob = '';
      var k = 0;
      for (var i in listJob) {
        if (i != 'other') {
          stringJob += CONFIG.data.job[i] + ' (' + $rootScope.service.timeAgo(listJob[i]) + '), ';
          k++
        }
      }
      var lengaf = stringJob.length - 2
      return stringJob.substr(0, lengaf);

    }


    this.facebookLogin = function (type) {

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
        $rootScope.service.JoboApi('on/user',{userId: userData.userId}).then(function (data) {
          console.log('checkSignupOrSignIn', type, JSON.stringify(data.data));
          if (data.data) {
            console.log('Đăng nhập')
            type = data.data.type;
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
                cssClass: 'animated bounceInUp dark-popup',
                template: 'Hãy chọn đúng vai trò sử dụng của bạn,',
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
                  createDataUser(userData.userId, userData, type)
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
                  cssClass: 'animated bounceInUp dark-popup',
                  template: '<label class="item item-input"><input type="email" ng-model="username" id="user_name" placeholder="Email"></label>',
                  scope: $rootScope, // Scope (optional). A scope to link to the popup content.
                  buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                    text: 'OK',
                    type: 'button-default',
                    onTap: function (e) {
                      userData.email = $rootScope.username;
                    }
                  }]
                }).then(function (res) {
                  if (res) {
                    console.log('You are sure', res);
                    createDataUser(userData.userId, userData, type)
                  } else {
                    console.log('You are not sure');
                  }
                });
              }

              createDataUser(userData.userId, userData, type)
            }


          }
        });
        /*var userRef = firebase.database().ref("user/" + userData.userId);
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
                cssClass: 'animated bounceInUp dark-popup',
                template: 'Hãy chọn đúng vai trò sử dụng của bạn,',
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
                  cssClass: 'animated bounceInUp dark-popup',
                  template: '<label class="item item-input"><input type="email" ng-model="username" id="user_name" placeholder="Email"></label>',
                  scope: $rootScope, // Scope (optional). A scope to link to the popup content.
                  buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                    text: 'OK',
                    type: 'button-default',
                    onTap: function (e) {
                      userData.email = $rootScope.username;
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
        })*/

      }

      function createDataUser(userId, userData, type) {
        userData.type = type;
        $rootScope.service.JoboApi('update/user',{
          userId: userId,
          user: userData
        });
        console.log("create username successful");
        $ionicLoading.hide();
        if (type == 1) {
          $state.go('store')
        }
        if (type == 2) {
          $state.go('profile')
        }
        /*userRef.update(userData);
        console.log("create username successful");
        $ionicLoading.hide();
        if (type == 1) {
          $state.go('store')
        }
        if (type == 2) {
          $state.go('profile')
        }*/
      }
    };
    /*this.loadJob = function (storeData) {
      var output = [],
        deferred = $q.defer();

      for (var i in storeData.job) {
        firebase.database().ref('job/' + storeData.storeId + ":" + i).once('value', function (snap) {
          if (snap.val()) {
            var job = snap.val()

            output.push(job)
            deferred.resolve(output);

          }
        })
      }

      return deferred.promise;
    }*/
    this.readNoti = function (id,card) {
      if ($rootScope.type == 1) {
        db.ref('notification/' + $rootScope.storeId).child(id).update({update: new Date().getTime()})
      } else if ($rootScope.type == 2) {
        db.ref('notification/' + $rootScope.userId).child(id).update({update: new Date().getTime()})
      }
      if(card.storeId){
        $rootScope.setCurrentStore(card.storeId)
      }

    }
    this.calNoti = function (noti) {
      var i = 0
      angular.forEach(noti, function (card) {
        if (!card.update) {
          i++
        }
      })
      return i
    }
    this.chatToUser = function (chatedId) {
      $state.go('employer_chat-detail', {chatId: chatedId})
    }
    this.chatToStore = function (chatedId) {
      $state.go('jobseeker_chat-detail', {chatId: chatedId})
    }
    this.ObjectToArray = function (Object) {
      var array = []
      for (var i in Object) {
        array.push(Object[i])
      }
      return array
    }
    this.loadLang =  function (lang) {
      firebase.database().ref('tran/' + lang).once('value', function (snap) {
        $rootScope.Lang = snap.val()
      });
    }
    this.getFreeCredit = function () {

      $rootScope.service.JoboApi('update/user',{
        userId: $rootScope.userId,
        user: {
          firstFreeCredit: true,
          credit: 500
        }
      });
      /*var userRef = firebase.database().ref('user/' + $rootScope.userId)
      userRef.update({
        firstFreeCredit: true,
        credit: 500
      })*/
      $cordovaToast.showShortTop('Bạn đã nhận 500,000đ credit!')
    }
    this.changeEmail = function (email) {
      var user = secondary.auth().currentUser;

      user.updateEmail(email).then(function () {
        // Update successful.
        $rootScope.service.JoboApi('update/user', {
          userId: user.uid,
          user: {
            email: email
          }
        });
        /*var userRef = firebase.database().ref('user/' + user.uid)
        userRef.update({email: email})*/
        sendVerifyEmail()
        $cordovaToast.showShortTop('Cập nhật email thành công, kiểm tra hòm mail để xác thực', 'Thay đổi email thành công')

      }, function (error) {
        // An error happened.
        console.log(error)
        if (error.code === "auth/requires-recent-login") {
          $state.go('intro')
        }
        $cordovaToast.showShortTop(error)

      });
    };
    this.changePassword = function (password) {
      var user = secondary.auth().currentUser;
      if (password.password == password.password2) {
        user.updatePassword(password.password).then(function () {

          // Update successful.
        }, function (error) {
          console.log(error)
          $cordovaToast.showShortTop(error)

          if (error.code === "auth/requires-recent-login") {
            $state.go('intro')
          }
          $cordovaToast.showShortTop('Bạn đã đổi mật khẩu thành công')

          // An error happened.
        });
      } else {
        $cordovaToast.showShortTop('Mật khẩu không trùng')
      }
    }


    this.openSupportPopover = function () {

      $ionicModal.fromTemplateUrl('templates/chat-support.html', {
        scope: $rootScope,
        animation: 'animated _zoomOut',
        hideDelay: 920
      }).then(function (modal) {
        $rootScope.modalProfile = modal;
        $rootScope.modalProfile.show();
        $rootScope.closeSupportPopover = function () {
          $rootScope.modalProfile.hide();
        };

      })
    }

    this.logout = function () {
      secondary.auth().signOut().then(function () {
        // Sign-out successful.
        $state.go("app.dash");
        $window.location.reload();
        $cordovaToast.showShortTop("Bạn đã đăng xuất thành công!");

      }, function (error) {
        // An error happened.
        console.log(error);
      });
    }
    this.shareJob = function (message, image, link) {

      $cordovaSocialSharing
        .shareViaFacebook(message, image, link)
        .then(function (result) {
          // Success!
        }, function (err) {
          // An error occurred. Show a message to the user
        });

    }
    this.searchProfile = function (textfull) {
      $rootScope.searchResults = []
      var URL = $rootScope.CONFIG.APIURL +'/query?q=' + textfull;

      $http({
        method: 'GET',
        url: URL
      }).then(function successCallback(response) {
        var i = 0;
        for (var j = 0; j < response.data.store.length; j++){
          $rootScope.searchResults[i] = response.data.store[j];
          i++;
        }
        for (var j = 0; j < response.data.profile.length; j++){
          $rootScope.searchResults[i] = response.data.profile[j];
          i++;
        }
        console.log($rootScope.searchResults);
      })

    }

  });




app.filter('myLimitTo', [function () {
  return function (obj, limit) {
    var keys = Object.keys(obj);
    if (keys.length < 1) {
      return [];
    }

    var ret = new Object,
      count = 0;
    angular.forEach(keys, function (key, arrayIndex) {
      if (count >= limit) {
        return false;
      }
      ret[key] = obj[key];
      count++;
    });
    return ret;
  };
}]);

app.factory('debounce', function($timeout) {
    return function(callback, interval) {
        var timeout = null;
        return function() {
            $timeout.cancel(timeout);
            var args = arguments;
            timeout = $timeout(function () {
                callback.apply(this, args);
              }, interval);
          };
      };
  });
