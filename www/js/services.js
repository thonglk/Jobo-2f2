angular.module('starter.services', [])
  .service('myService', function (CacheFactory) {
    var profileCache;

    // Check to make sure the cache doesn't already exist
    if (!CacheFactory.get('profileCache')) {
      profileCache = CacheFactory('profileCache');
    }
  })

  .service('AuthUser', function ($rootScope, $q, $http, CONFIG, $timeout, $state,$cordovaSocialSharing) {
    var messaging = firebase.messaging();
    var db = firebase.database()

    this.fcm = function () {

      if ($rootScope.platforms == "app") {
        FCMPlugin.onTokenRefresh(function (token) {
          console.log(token)
          $timeout(getTheToken, 1000);
        });
      }
      function checkFCM() {

        if (typeof FCMPlugin != 'undefined') {
          $timeout(getTheToken, 1000);

          FCMPlugin.onNotification(
            function (data) {
              console.log("data", data);
              if (data.wasTapped) {

                window.location.href = data.goto;
                //Notification was received on device tray and tapped by the user.
              } else {

                var options = {
                  message: data.body,
                  buttonName: "Xem thêm",
                  buttonFunction: $rootScope.goTo
                };
                $rootScope.goTo = function () {
                  $state.go(data.goto)
                }
                $snackbar.show(options);
              }
            }
          );

        } else {
          console.log("null fcm");
          $timeout(checkFCM, 1000);
        }

      }

      function getTheToken() {
        FCMPlugin.getToken(
          function (token) {
            if (token) {
              $rootScope.tokenuser = token;
              console.log("I got the token: " + token);
              $rootScope.service.Ana(token, 'get_token', {})
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

    }

    this.user = function () {
      var output = {},
        deferred = $q.defer();
      if ($rootScope.userData) {
        console.log('no Auth');
        output = $rootScope.userData;
        if ($rootScope.userData.currentStore) {
          $rootScope.storeId = $rootScope.userData.currentStore
        }
        if (!$rootScope.userData.verifyEmail) {
          $rootScope.verifyEmail = true
        }
        if (!$rootScope.userData.webToken) {
          $rootScope.webToken = true
        }
        $rootScope.type = $rootScope.userData.type;
        deferred.resolve(output);

      } else {
        firebase.auth().onAuthStateChanged(function (user) {
          console.log('Auth')
          var firsttime
          if (user) {
            $rootScope.userId = user.uid;
            firebase.database().ref('user/' + $rootScope.userId)
              .on('value', function (snap) {
                $rootScope.userData = snap.val()
                $rootScope.type = $rootScope.userData.type;
                if ($rootScope.userData.currentStore) {
                  $rootScope.storeId = $rootScope.userData.currentStore
                }
                output = $rootScope.userData;
                console.log(output)
                deferred.resolve(output);
              })
            // User is signed in.
          } else {
            $rootScope.type = 0;

            output = {type: 0}
            console.log(output)
            deferred.resolve(output);
            // No user is signed in.
          }

        })
      }

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

          itsMatch(output.storeId, output.userId)
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
          itsMatch(output.storeId, output.userId)
          $rootScope.service.Ana('match', {storeId: card.storeId, job: jobOffer})
        } else {
          if (card.act && card.act.jobUser) {
            selectedJob = Object.assign(selectedJob, card.act.jobUser)
          }
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

    this.itsMatch = function (storeId, userId) {
      ModalService.showModal({
        templateUrl: 'templates/modals/match.html',
        controller: 'ModalMatchCtrl',
        inputs: {
          storeId: storeId,
          userId: userId
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {

        });
      });
    }
    this.checkPermit = function checkPermit(storeId, userId) {
      var check = '';
      var defer = $q.defer()
      var reactRef = firebase.database().ref('activity/like/' + storeId + ":" + userId)
      reactRef.once('value', function (snap) {
        var card = snap.val()
        if (card) {
          //có từng react
          if (card.status == 1) {
            //đã match
            check = 'match'
          } else if (card.status == 0 && card.type == 2) {
            // user like store
            check = 'uls'

          } else if (card.status == 0 && card.type == 1) {
            // store like user
            check = 'slu'

          } else if (card.status == -1 && card.type == 2) {

            // user dislike store
            check = 'sdu'

          } else if (card.status == -1 && card.type == 1) {
            // store dislike user
            check = 'uds'

          }

        } else {
          //chưa từng react
          check = 'yet';

        }
        defer.resolve(check)
      })
      return defer.promise
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
      var logRef = firebase.database().ref('log')
      var actRef = firebase.database().ref('act')

      var analyticKey = actRef.push().key

      var obj = {
        userId: anany,
        action: action,
        createdAt: new Date().getTime(),
        data: data,
        id: analyticKey
      }

      logRef.child(analyticKey).set(obj)
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
      if(text){
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
    this.saveWebToken = function () {

      getToken();
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/firebase-messaging-sw.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration);
            $rootScope.service.Ana('serviceWorker', {registration: 'ServiceWorker registration successful with scope: ' + registration})

          }).catch(function (err) {
            // registration failed :(
            $rootScope.service.Ana('serviceWorker', {registration: 'ServiceWorker registration failed: ' + err})

            console.log('ServiceWorker registration failed: ', err);
          });
        });
      }
    }

    function getToken() {
      messaging.getToken()
        .then(function (currentToken) {
          if (currentToken) {
            if ($rootScope.userId) {
              firebase.database().ref('user/' + $rootScope.userId).update({webToken: currentToken})
              $rootScope.service.Ana('getToken', {token: currentToken});
              console.log('save token')
            }

          } else {
            // Show permission request.
            console.log('No Instance ID token available. Request permission to generate one.');
            requestPermission();
            // Show permission UI.
          }
        })
        .catch(function (err) {
          console.log('An error occurred while retrieving token. ', err);
        })
    }


    function requestPermission() {
      messaging.requestPermission()
        .then(function () {
          console.log('Notification permission granted.');
          // TODO(developer): Retrieve an Instance ID token for use with FCM.
          // ...
          getToken();
          // Get Instance ID token. Initially this makes a network call, once retrieved
          // subsequent calls to getToken will return from cache.


        })
        .catch(function (err) {
          $rootScope.service.Ana('requestPermission', {err: err})

          console.log('Unable to get permission to notify.', err);
        });


    }

    this.loadJob = function (storeData) {
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
    }
    this.readNoti = function (id) {
      if ($rootScope.type == 1) {
        db.ref('notification/' + $rootScope.storeId).child(id).update({update: new Date().getTime()})
      } else if ($rootScope.type == 2) {
        db.ref('notification/' + $rootScope.userId).child(id).update({update: new Date().getTime()})
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
    $rootScope.pressArrow = function ($event, textmessage) {
      console.log($event.keyCode);
      if ($event.keyCode == 13 && textmessage && textmessage.length != 0) {
        $rootScope.sendMessage(textmessage)

      }

    }
    this.chatToUser = function (chatedId) {
      $state.go('employer.chat-detail', {chatId: chatedId})
    }
    this.closeChat = function () {
      $rootScope.chat = false
    }

    this.chatToStore = function (chatedId) {
      $rootScope.aside = true
      $rootScope.chat = true

      if (chatedId) {
        $rootScope.chatUser = {chatedId: chatedId}
        //có user cụ thể
        loadMessage(chatedId, $rootScope.userId);
      }

      // Get list

      $('#demo').daterangepicker({
        "singleDatePicker": true,
        "showDropdowns": true,
        "timePicker": true,
        "startDate": "03/16/2017",
        "endDate": "03/22/2017",
      }, function (start, end, label) {
        console.log("New date range selected: '" + start.format() + ' to ' + end.format('YYYY-MM-DD') + 'predefined range: ' + label);
        var date = new Date(start.format()).getTime()
        console.log(date)
        setInterview(date)
      });

      function setInterview(timeInterview) {
        console.log(timeInterview);
        var timeInterviewRef = firebase.database().ref('activity/' + $rootScope.storeId + ":" + chatedId)
        timeInterviewRef.update({interview: new Date().getTime()});
        var newPostRef = firebase.database().ref().child('activity/interview/' + $rootScope.storeId + ":" + chatedId)

        var message = {
          createdAt: new Date().getTime(),
          interview: timeInterview,
          place: $rootScope.storeData.address,
          userId: chatedId,
          storeId: $rootScope.storeId,
          status: 0,
          type: 1
        };
        newPostRef.update(message);

      }

      function loadMessage(storeId, chatedId) {
        var ProfileRef = firebase.database().ref('store/' + storeId);
        ProfileRef.once('value', function (snap) {
          $timeout(function () {
            $rootScope.chatUser.data = snap.val();
            console.log('$rootScope.chatUser.data', $rootScope.chatUser.data)

            var likeAct = firebase.database().ref('activity/like/' + storeId + ':' + chatedId);
            likeAct.on('value', function (snap) {
              $timeout(function () {
                $rootScope.chatUser.act = snap.val();
                console.log('$rootScope.profileData.act', $rootScope.chatUser.act)
              })
            });
          })
        })

        var messageRef = firebase.database().ref('chat/' + storeId + ':' + chatedId);
        messageRef.on('value', function (snap) {
          $timeout(function () {
            $rootScope.chatUser.messages = snap.val();
            console.log($rootScope.chatUser.messages);
          })
        })


        var newPostRef = firebase.database().ref().child('activity/interview/' + storeId + ":" + chatedId)
        newPostRef.on('value', function (snap) {
          $timeout(function () {
            $rootScope.chatUser.interview = snap.val();

          })
        })
      }

      $rootScope.sendMessage = function (textmessage) {
        var newPostKey = firebase.database().ref().child('chat/' + chatedId + ":" + $rootScope.userId).push().key;
        var newPostRef = firebase.database().ref().child('chat/' + chatedId + ":" + $rootScope.userId + '/' + newPostKey)
        var message = {
          key: newPostKey,
          createdAt: new Date().getTime(),
          text: textmessage,
          sender: $rootScope.userId,
          status: 0,
          type: 0
        };


        // if you do a web service call this will be needed as well as before the viewScroll calls
        // you can't see the effect of this in the browser it needs to be used on a real device
        // for some reason the one time blur event is not firing in the browser but does on devices

        //MockService.sendMessage(message).then(function(data) {
        $rootScope.input.message = '';

        newPostRef.update(message);
        console.log(message)
        //});
      };

      $rootScope.showphone = function (chatedId) {
        var employerId = $rootScope.chatUser.data.createdBy
        if ($rootScope.chatUser.act && $rootScope.chatUser.act.status == 1) {
          var contactRef = firebase.database().ref('user/' + employerId)
          contactRef.once('value', function (snap) {
            $timeout(function () {
              $rootScope.contact = snap.val()
              if (!$rootScope.showContact) {
                $rootScope.showContact = {}
              }
              $rootScope.showContact[chatedId] = $rootScope.contact.phone + ' | ' + $rootScope.contact.email

            })
          })
        } else {
          $cordovaToast.showShortTop('Bạn chưa tương hợp với nhà tuyển dụng này!')
        }

      }
      $rootScope.mustPermit = function () {
        ModalService.showModal({
          templateUrl: 'templates/modals/permit.html',
          controller: 'ModalPermitCtrl'
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            console.log(result)

          });
        });
      }


      $rootScope.input = {
        message: localStorage['userMessage-' + chatedId] || ''
      };

      var messageCheckTimer;

      var footerBar; // gets set in $ionicView.enter
      var scroller;
      var txtInput; // ^^^

    }

    this.getFreeCredit = function () {

      var userRef = firebase.database().ref('user/' + $rootScope.userId)
      userRef.update({
        firstFreeCredit: true,
        credit: 500
      })
      $cordovaToast.showShortTop('Bạn đã nhận 500,000đ credit!')
    }
    this.changeEmail = function (email) {
      var user = firebase.auth().currentUser;

      user.updateEmail(email).then(function () {
        // Update successful.
        var userRef = firebase.database().ref('user/' + user.uid)
        userRef.update({email: email})
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
      var user = firebase.auth().currentUser;
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
    this.logout = function () {
      firebase.auth().signOut().then(function () {
        // Sign-out successful.
        $state.go("app.dash");
        $window.location.reload();
        $cordovaToast.showShortTop("Bạn đã đăng xuất thành công!");

      }, function (error) {
        // An error happened.
        console.log(error);
      });
    }
    this.shareJob = function (message,image,link) {
      $cordovaSocialSharing
        .shareViaFacebook(message, image, link)
        .then(function(result) {
          // Success!
        }, function(err) {
          // An error occurred. Show a message to the user
        });

    }

  });
;

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
