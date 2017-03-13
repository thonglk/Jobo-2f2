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
    $ionicConfigProvider.spinner.icon('spiral');
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
    $ionicConfigProvider.backButton.text(null).icon('ion-chevron-left color-white');
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

      // Employer states

      .state('employer', {
        url: '/employer',
        abstract: true,
        templateUrl: 'employer/tabs.html'
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
            controller: 'AccountCtrl'
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
        url: '/viewprofile/:id',
        templateUrl: 'employer/modals/viewprofile.html',
        controller: 'ViewProfileCtrl'
      })
      .state('pricing', {
        url: '/pricing',
        templateUrl: 'employer/pricing.html',
        controller: 'pricingCtrl'
      })

      .state('store', {
        url: '/store',
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
        templateUrl: 'jobseeker/tabs.html'
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
      .state('jobseeker.interview', {
        url: '/interview',
        views: {
          'tab-interview': {
            templateUrl: 'employer/tab-interview.html',
            controller: 'sInterviewCtrl'
          }
        }
      })


      .state('jobseeker.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'jobseeker/tab-account.html',
            controller: 'AccountCtrl'
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
        url: '/viewstore/:id',
        templateUrl: 'jobseeker/modals/viewstore.html',
        controller: 'ViewStoreCtrl'
      })


// if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/intro');

  })


  .run(function ($rootScope, $ionicLoading, CONFIG, $http, $timeout, $snackbar, $state,
                 $localStorage,
                 $sessionStorage) {


      $rootScope.CONFIG = CONFIG;
      $rootScope.dataJob = CONFIG.data.job;

      $rootScope.dataTime = CONFIG.data.time;

      $rootScope.dataIndustry = CONFIG.data.industry;


      $rootScope.dataLanguages = {english: "Tiếng Anh"};


      $rootScope.checkPlatform = function () {
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
      };
      $rootScope.checkDevice = function () {
        var ua = navigator.userAgent.toLowerCase();
        var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
        return {
          ios: ipad || iphone || ipod,
          android: android
        };
      };

      $rootScope.platforms = $rootScope.checkPlatform();
      $rootScope.device = $rootScope.checkDevice();
      console.log($rootScope.platforms, $rootScope.device);


      if ($rootScope.platforms == "app") {
        $timeout(checkFCM, 1000);
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

      var firsttime;
      $timeout(function () {
        var connectedRef = firebase.database().ref(".info/connected");
        connectedRef.on("value", function (snap) {
          if (snap.val() === true) {
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
            $snackbar.show(options);
          }
        });
      }, 2000)
    }
  );
