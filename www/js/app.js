// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', [
  'ionic'
  , 'ngStorage'
  , 'ion-datetime-picker'
  , 'snackbar'
  , 'ngCordovaOauth'
  , 'firebase'
  , 'ngCordova'
  , 'ui.mask'
  , 'monospaced.elastic'
  , 'angular-cache'
  , 'starter.configs'
  , 'starter.controllers'
  , 'starter.services'
  , 'starter.directives'
  , 'monospaced.elastic'
  , 'ksSwiper'
  , 'ionic.contrib.ui.tinderCards2'
  , 'ionic.cloud'
])
  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
        console.log(StatusBar)
      }
    });
  })

  .config(function ($ionicCloudProvider) {
    $ionicCloudProvider.init({
      "core": {
        "app_id": "3063d2c3"
      }
    });
  })


  .config(function ($provide, $ionicConfigProvider, $compileProvider) {
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.views.transition('none');
    $ionicConfigProvider.views.swipeBackEnabled(false);
    $ionicConfigProvider.spinner.icon('ripple');
    $ionicConfigProvider.navBar.alignTitle('center');

    // $ionicConfigProvider.scrolling.jsScrolling(false);
    // $translateProvider.useStaticFilesLoader({
    //     prefix: 'l10n/',
    //     suffix: '.json'
    //   });
    // $translateProvider.preferredLanguage("en");
    // $translateProvider.fallbackLanguage("en");
    $ionicConfigProvider.scrolling.jsScrolling(false);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|cdvfile|file|filesystem|blob):|data:image\//);
    $ionicConfigProvider.backButton.text(null).icon('ion-chevron-left');
  })
  //


  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive


    // Authentication

      .state('signup', {
        url: '/signup/:id',
        templateUrl: 'templates/signup.html',
        controller: 'signupCtrl'
      })

      .state('reset', {
        url: '/reset',
        templateUrl: "templates/resetemail.html",
        controller: "resetController"
      })


      .state('intro', {
        url: '/intro',
        templateUrl: "templates/intro.html",
        controller: "introController"
      })

      .state('dash', {
        url: '/dash',
        templateUrl: "templates/dash.html",
        controller: "DashCtrl"
      })
      // Employer states

      .state('employer', {
        url: '/employer',
        abstract: true,
        templateUrl: 'employer/tabs.html',
        controller: 'employerCtrl'


      })

      // Each tab has its own nav history stack:

      .state('employer.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'employer/tab-dash.html',
            controller: 'eDashCtrl'
          }
        }
      })

      .state('employer.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'employer/tab-chats.html',
            controller: 'eChatsCtrl'
          }
        }
      })
      .state('employer.chat-detail', {
        url: '/chats/:chatId',
        views: {
          'tab-chats': {
            templateUrl: 'employer/chat-detail.html',
            controller: 'eChatDetailCtrl'
          }
        }
      })

      .state('employer.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'employer/tab-account.html',
            controller: 'eAccountCtrl'
          }
        }
      })
      .state('employer.setting', {
        url: '/setting',
        views: {
          'tab-account': {
            templateUrl: 'employer/setting.html',
            controller: 'eSettingCtrl'
          }
        }
      })
      .state('employer.notification', {
        url: '/notification',
        views: {
          'tab-notification': {
            templateUrl: 'employer/tab-notification.html',
            controller: 'eNotificationCtrl'
          }
        }
      })
      .state('employer.interview', {
        url: '/interview',
        views: {
          'tab-interview': {
            templateUrl: 'employer/tab-interview.html',
            controller: 'eInterviewCtrl'
          }
        }
      })
      .state('viewprofile', {
        url: '/view/profile/:id',
        templateUrl: 'employer/modals/viewprofile.html',
        controller: 'ViewProfileCtrl'
      })
      .state('pricing', {
        url: '/pricing',
        templateUrl: 'employer/pricing.html',
        controller: 'pricingCtrl'
      })

      .state('store', {
        url: '/store/:id',
        templateUrl: 'employer/store.html',
        controller: 'storeCtrl'

      })

      .state('convert', {
        url: '/convert',
        templateUrl: 'templates/convert.html',
        controller: 'convertCtrl'
      })

      // Jobseeker states

      .state('jobseeker', {
        url: '/jobseeker',
        abstract: true,
        templateUrl: 'jobseeker/tabs.html',
        controller: 'jobseekerCtrl'

      })


      .state('profile', {
        url: '/profile',
        templateUrl: 'jobseeker/sprofile.html',
        controller: 'sprofileCtrl'

      })

      .state('jobseeker.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'jobseeker/tab-dash.html',
            controller: 'sDashCtrl'
          }
        }
      })

      .state('jobseeker.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'jobseeker/tab-chats.html',
            controller: 'eChatsCtrl'
          }
        }
      })
      .state('jobseeker.chat-detail', {
        url: '/chats/:chatId',
        views: {
          'tab-chats': {
            templateUrl: 'jobseeker/chat-detail.html',
            controller: 'sChatDetailCtrl'
          }
        }
      })
      .state('jobseeker.notification', {
        url: '/notification',
        views: {
          'tab-notification': {
            templateUrl: 'jobseeker/tab-notification.html',
            controller: 'sNotificationCtrl'
          }
        }
      })
      .state('jobseeker.job', {
        url: '/job',
        views: {
          'tab-job': {
            templateUrl: 'jobseeker/tab-job.html',
            controller: 'sJobCtrl'
          }
        }
      })


      .state('jobseeker.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'jobseeker/tab-account.html',
            controller: 'sAccountCtrl'
          }
        }
      })
      .state('jobseeker.setting', {
        url: '/setting',
        views: {
          'tab-account': {
            templateUrl: 'jobseeker/setting.html',
            controller: 'sSettingCtrl'
          }
        }
      })
      .state('viewstore', {
        url: '/view/store/:id',
        templateUrl: 'jobseeker/modals/viewstore.html',
        controller: 'ViewStoreCtrl'
      })


// if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/dash');

  })


  .run(function ($rootScope, $ionicLoading, CONFIG, $http, $timeout, $snackbar, $state, $ionicDeploy, $ionicPopup,
                 AuthUser) {
      function checkPlatform() {
        var ua = navigator.userAgent.toLowerCase();
        var platforms;
        if (ua.indexOf('mobile') < 0) {
          platforms = "web"
        } else {
          if (ua.indexOf('chrome') > 0 || ua.indexOf('safari') > 0 || ua.indexOf('firefox') > 0 || ua.indexOf('edge') > 0) {
            platforms = "mobile"
          } else {
            platforms = "app"
          }
        }
        return platforms
      }

      function checkDevice() {
        var ua = navigator.userAgent.toLowerCase();
        var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
        if (ipad || iphone || ipod) {
          return 'ios'
        }
        if (android) {
          return 'android'
        }

      };
      $rootScope.checkAgent = {
        platform: checkPlatform(),
        device: checkDevice() || ''
      }
      console.log('checkAgent', $rootScope.checkAgent)
      firebase.database().ref('config').on('value', function (snap) {
        if (snap.val() && snap.val().isShowUpdate == 1) {
          $rootScope.updateversion()
        }
      });
      $rootScope.updateversion = function () {
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

      $rootScope.jobOffer = {}
      $rootScope.service = AuthUser;
      $rootScope.CONFIG = CONFIG;
      $rootScope.dataJob = CONFIG.data.job;
      $rootScope.dataTime = CONFIG.data.time;
      $rootScope.dataIndustry = CONFIG.data.industry;
      $rootScope.dataLanguages = CONFIG.data.languages;


      var firsttime;
      $timeout(function () {
        var connectedRef = firebase.database().ref(".info/connected");
        connectedRef.on("value", function (snap) {
          console.log('connected', snap.val())
          if (snap.val() == true) {
            var options = {
              message: "Đã kết nối",
              messageColor: 'green',
            };
            if (!firsttime) {
              $snackbar.show(options);
              firsttime = true;
            }
          } else {
            var options = {
              message: "Không có kết nối internet",
              messageColor: 'red'
            };
            if (!firsttime) {
              $snackbar.show(options);
              firsttime = true;
            }
          }
        });
      }, 2000)
    }
  )
  .controller('employerCtrl', function ($rootScope, $timeout, AuthUser, $stateParams, $state) {
    $rootScope.service.Ana('trackView', {track: $stateParams['#'] || '', state: $state.current.name})
    $rootScope.service.fcm()
    AuthUser.user().then(function (data) {
      console.log(data);

      if (data.type == 2) {
        loadUserData($rootScope.userId)
        getNotification($rootScope.userId);
        getUserOnline($rootScope.userId);

        $timeout(function () {
          getListReact($rootScope.userId, 'userId')
          getStoreOnlineList()

        }, 1000)
      }
      if (data.type == 1) {
        loadCurrentStore($rootScope.storeId)
        getNotification($rootScope.storeId);
        loadListStore($rootScope.userId)
        getStoreOnline($rootScope.storeId)


        $timeout(function () {
          getProfileOnlineList()
          getListReact($rootScope.storeId, 'storeId')
        }, 1000);

        $rootScope.setCurrentStore = function (storeId) {
          $rootScope.storeId = storeId;
          var setCurrent = firebase.database().ref('user/' + $rootScope.userId)
          setCurrent.update({currentStore: storeId});
          console.log({currentStore: storeId});
          loadCurrentStore($rootScope.storeId)
          getListReact($rootScope.storeId, 'storeId')
          getNotification($rootScope.storeId);
        };

      }


      function getUserOnline(userId) {
        var userRef = firebase.database().ref('profile/' + userId + '/presence');


// Add ourselves to presence list when online.
        var presenceRef = firebase.database().ref('.info/connected');
        presenceRef.on("value", function (snap) {
          if (snap.val()) {
            // Remove ourselves when we disconnect.
            var off = {
              status: 'offline',
              at: new Date().getTime()
            }

            userRef.onDisconnect().set(off);
            var on = {
              status: 'online',
              at: new Date().getTime()

            };
            firebase.database().ref('profile/' + userId + '/name').on('value', function (snap) {
              var name = snap.val()
              if (name) {
                console.log(on);
                userRef.set(on)
              }
            })


          }
        });
      }

      function loadUserData(userId) {
        var userRef = firebase.database().ref('profile/' + userId);
        var firsttime;

        userRef.on('value', function (snap) {
          $timeout(function () {
            $rootScope.userData = snap.val()
            if (!firsttime) {
              firsttime = true;

              console.log('jobseekerTabsCtrl', $rootScope.userData)
              $rootScope.$broadcast('handleBroadcast', $rootScope.userData);
            }
          })
        })
      }

      function getStoreOnlineList() {
        var time = new Date().getTime() - 24 * 60 * 60 * 1000
        var onlinelistRef = firebase.database().ref('store').orderByChild('presence/at').startAt(time);
        onlinelistRef.on("value", function (snap) {
          $rootScope.onlineList = snap.val()
          console.log("# of online users = ", $rootScope.onlineList);

        });
      }


      function getProfileOnlineList() {
        var time = new Date().getTime() - 24 * 60 * 60 * 1000
        var onlinelistRef = firebase.database().ref('profile').orderByChild('presence/at').startAt(time);
        onlinelistRef.on("value", function (snap) {
          $rootScope.onlineList = snap.val()
          console.log("# of online users = ", $rootScope.onlineList);
        });
      }

      function getStoreOnline(storeId) {
        var userRef = firebase.database().ref('store/' + storeId + '/presence');


        var presenceRef = firebase.database().ref('.info/connected');
        presenceRef.on("value", function (snap) {
          if (snap.val()) {
            // Remove ourselves when we disconnect.
            var off = {
              status: 'offline',
              at: new Date().getTime(),

            };
            userRef.onDisconnect().set(off);
            var on = {
              status: 'online',
              at: new Date().getTime()

            }
            firebase.database().ref('store/' + storeId + '/storeName').on('value', function (snap) {
              var storeName = snap.val()
              if (storeName) {
                console.log(on)
                userRef.set(on)
              }
            })


          }
        });


      }

      function loadCurrentStore(storeId) {

        var storeRef = firebase.database().ref('store/' + storeId);

        storeRef.on('value', function (snap) {
          $timeout(function () {
            $rootScope.storeData = snap.val()
            $rootScope.$broadcast('storeListen', $rootScope.storeData);
          })
        })
      }

      function loadListStore(userId) {
        var storeListRef = firebase.database().ref('store').orderByChild('createdBy').equalTo(userId);
        storeListRef.on('value', function (snap) {
          $timeout(function () {
            $rootScope.storeList = snap.val()
            console.log($rootScope.storeList)

          })
        })
      }

      function getListReact(pros, type) {
        if (!$rootScope.reactList) {
          var reactRef = firebase.database().ref('activity/like').orderByChild(type).equalTo(pros);
          reactRef.on('value', function (snap) {
            $timeout(function () {
              var reactList = snap.val();
              console.log('reactList', reactList)
              $rootScope.reactList = {like: [], liked: [], match: []}

              if (type == 'storeId') {
                angular.forEach(reactList, function (card) {
                  firebase.database().ref('presence/profile/' + card.userId).on('value', function (snap) {
                    if (snap.val()) {
                      card.presence = snap.val().status
                      card.at = snap.val().at
                    }
                  })
                  if (card.status == 1) {
                    $rootScope.reactList.match.push(card)
                  } else if (card.status == 0 && card.type == 1) {
                    $rootScope.reactList.like.push(card)

                  } else if (card.status == 0 && card.type == 2) {
                    $rootScope.reactList.liked.push(card)

                  }
                })
                console.log($rootScope.reactList)
              }
              if (type == 'userId') {
                angular.forEach(reactList, function (card) {
                  firebase.database().ref('presence/store/' + card.storeId).on('value', function (snap) {
                    if (snap.val()) {
                      card.presence = snap.val().status
                      card.at = snap.val().at
                    }


                  })
                  if (card.status == 1) {
                    $rootScope.reactList.match.push(card)
                  } else if (card.status == 0 && card.type == 2) {
                    $rootScope.reactList.like.push(card)

                  } else if (card.status == 0 && card.type == 1) {
                    $rootScope.reactList.liked.push(card)

                  }
                })
                console.log($rootScope.reactList)
              }


            })
          })
        }
      };
      function getNotification(userId) {
        firebase.database().ref('notification/' + userId).orderByChild('createdAt').limitToFirst(10)
          .on('value', function (snap) {
            $timeout(function () {
              $rootScope.notification = snap.val()
              console.log($rootScope.notification)
              $rootScope.newNoti = $rootScope.service.calNoti($rootScope.notification)
            })
          })
      }

      if (data.type == 0) {
      }
    })

  })
  .controller('jobseekerCtrl', function ($rootScope, $timeout, AuthUser, $state, $stateParams) {
    $rootScope.service.Ana('trackView', {track: $stateParams['#'] || '', state: $state.current.name})
    $rootScope.service.fcm()

    AuthUser.user().then(function (data) {
      console.log(data);

      if (data.type == 2) {
        getUserOnline($rootScope.userId);
        loadUserData($rootScope.userId)
        getNotification($rootScope.userId);

        $timeout(function () {
          getListReact($rootScope.userId, 'userId')
          getStoreOnlineList()

        }, 1000)
      }
      if (data.type == 1) {
        loadCurrentStore($rootScope.storeId)
        getNotification($rootScope.storeId);
        loadListStore($rootScope.userId)
        getStoreOnline($rootScope.storeId)


        $timeout(function () {
          getProfileOnlineList()
          getListReact($rootScope.storeId, 'storeId')
        }, 1000)

        $rootScope.setCurrentStore = function (storeId) {
          $rootScope.storeId = storeId;
          var setCurrent = firebase.database().ref('user/' + $rootScope.userId)
          setCurrent.update({currentStore: storeId});
          console.log({currentStore: storeId});
          loadCurrentStore($rootScope.storeId)
          getListReact($rootScope.storeId, 'storeId')
          getNotification($rootScope.storeId);
        };

      }


      function getUserOnline(userId) {
        var userRef = firebase.database().ref('profile/' + userId + '/presence');


// Add ourselves to presence list when online.
        var presenceRef = firebase.database().ref('.info/connected');
        presenceRef.on("value", function (snap) {
          if (snap.val()) {
            // Remove ourselves when we disconnect.
            var off = {
              status: 'offline',
              at: new Date().getTime()
            }

            userRef.onDisconnect().set(off);
            var on = {
              status: 'online',
              at: new Date().getTime()

            };
            firebase.database().ref('profile/' + userId + '/name').on('value', function (snap) {
              var name = snap.val()
              if (name) {
                console.log(on);
                userRef.set(on)
              }
            })


          }
        });
      }

      function loadUserData(userId) {
        var userRef = firebase.database().ref('profile/' + userId);
        userRef.on('value', function (snap) {
          $timeout(function () {
            $rootScope.userData = snap.val()
            console.log('jobseekerTabsCtrl', $rootScope.userData)
            $rootScope.$broadcast('handleBroadcast', $rootScope.userData);
          })
        })
      }

      function getStoreOnlineList() {
        var time = new Date().getTime() - 24 * 60 * 60 * 1000
        var onlinelistRef = firebase.database().ref('store').orderByChild('presence/at').startAt(time);
        onlinelistRef.on("value", function (snap) {
          $rootScope.onlineList = snap.val()
          console.log("# of online users = ", $rootScope.onlineList);

        });
      }


      function getProfileOnlineList() {
        var time = new Date().getTime() - 24 * 60 * 60 * 1000
        var onlinelistRef = firebase.database().ref('profile').orderByChild('presence/at').startAt(time);
        onlinelistRef.on("value", function (snap) {
          $rootScope.onlineList = snap.val()
          console.log("# of online users = ", $rootScope.onlineList);
        });
      }

      function getStoreOnline(storeId) {
        var userRef = firebase.database().ref('store/' + storeId + '/presence');


        var presenceRef = firebase.database().ref('.info/connected');
        presenceRef.on("value", function (snap) {
          if (snap.val()) {
            // Remove ourselves when we disconnect.
            var off = {
              status: 'offline',
              at: new Date().getTime(),

            };
            userRef.onDisconnect().set(off);
            var on = {
              status: 'online',
              at: new Date().getTime()

            }
            firebase.database().ref('store/' + storeId + '/storeName').on('value', function (snap) {
              var storeName = snap.val()
              if (storeName) {
                console.log(on)
                userRef.set(on)
              }
            })


          }
        });


      }

      function loadCurrentStore(storeId) {

        var storeRef = firebase.database().ref('store/' + storeId);
        storeRef.on('value', function (snap) {
          $timeout(function () {
            $rootScope.storeData = snap.val()
            $rootScope.$broadcast('storeListen', $rootScope.storeData);

          })
        })
      }

      function loadListStore(userId) {
        var storeListRef = firebase.database().ref('store').orderByChild('createdBy').equalTo(userId);
        storeListRef.on('value', function (snap) {
          $timeout(function () {
            $rootScope.storeList = snap.val()
            console.log($rootScope.storeList)

          })
        })
      }

      function getListReact(pros, type) {
        if (!$rootScope.reactList) {
          var reactRef = firebase.database().ref('activity/like').orderByChild(type).equalTo(pros);
          reactRef.on('value', function (snap) {
            $timeout(function () {
              var reactList = snap.val();
              console.log('reactList', reactList)
              $rootScope.reactList = {like: [], liked: [], match: []}

              if (type == 'storeId') {
                angular.forEach(reactList, function (card) {
                  firebase.database().ref('presence/profile/' + card.userId).on('value', function (snap) {
                    if (snap.val()) {
                      card.presence = snap.val().status
                      card.at = snap.val().at
                    }
                  })
                  if (card.status == 1) {
                    $rootScope.reactList.match.push(card)
                  } else if (card.status == 0 && card.type == 1) {
                    $rootScope.reactList.like.push(card)

                  } else if (card.status == 0 && card.type == 2) {
                    $rootScope.reactList.liked.push(card)

                  }
                })
                console.log($rootScope.reactList)
              }
              if (type == 'userId') {
                angular.forEach(reactList, function (card) {
                  firebase.database().ref('presence/store/' + card.storeId).on('value', function (snap) {
                    if (snap.val()) {
                      card.presence = snap.val().status
                      card.at = snap.val().at
                    }


                  })
                  if (card.status == 1) {
                    $rootScope.reactList.match.push(card)
                  } else if (card.status == 0 && card.type == 2) {
                    $rootScope.reactList.like.push(card)

                  } else if (card.status == 0 && card.type == 1) {
                    $rootScope.reactList.liked.push(card)

                  }
                })
                console.log($rootScope.reactList)
              }


            })
          })
        }
      };
      function getNotification(userId) {
        firebase.database().ref('notification/' + userId).orderByChild('createdAt').limitToFirst(10)
          .on('value', function (snap) {
            $timeout(function () {
              $rootScope.notification = snap.val()
              console.log($rootScope.notification)
              $rootScope.newNoti = $rootScope.service.calNoti($rootScope.notification)
            })
          })
      }

      if (data.type == 0) {
      }
    })
  })
