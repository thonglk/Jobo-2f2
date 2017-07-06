angular.module('starter.controllers', [])
  .controller('DashCtrl', function ($scope) {
  })
  .controller("SupporterCtrl", ["$scope", '$rootScope', "$stateParams", "AuthUser", "$ionicActionSheet", "$timeout", "$ionicScrollDelegate", "$firebaseArray", "$ionicPopup", "$http", '$interval', '$ionicLoading', '$cordovaToast', function ($scope, $rootScope, $stateParams, AuthUser, $ionicActionSheet, $timeout, $ionicScrollDelegate, $firebaseArray, $ionicPopup, $http, $interval, $ionicLoading, $cordovaToast) {

    $scope.init = function () {
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner>'
      });
      AuthUser.user().then(function () {
        $scope.loadMessage($rootScope.userId);
        $ionicLoading.hide()
      });

    };

    $scope.loadMessage = function (id) {

      var messageRef = firebase.database().ref('support/' + id);
      messageRef.on('value', function (snap) {
        $scope.messages = snap.val();
        console.log($scope.messages);
        $timeout(function () {
          viewScroll.scrollBottom();
        }, 0);
      })

      var chatedRef = firebase.database().ref('CONFIG/supporter');
      chatedRef.on('value', function (snap) {
        $timeout(function () {
            $rootScope.chatUser = snap.val()
          }
        );
      });

    }

    $scope.chatedId = 'supporter'
    $scope.input = {
      message: localStorage['userMessage-' + $scope.chatedId] || ''
    };

    var messageCheckTimer;

    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
    var footerBar; // gets set in $ionicView.enter
    var scroller;
    var txtInput; // ^^^

    $scope.$on('$ionicView.enter', function () {
      console.log('UserMessages $ionicView.enter');

      $timeout(function () {
        // footerBar = document.body.querySelector('#userMessagesView .bar-footer');
        // scroller = document.body.querySelector('#userMessagesView .scroll-content');
        // txtInput = angular.element(footerBar.querySelector('textarea'));
      }, 0);

      messageCheckTimer = $interval(function () {
        // here you could check for new messages if your app doesn't use push notifications or user disabled them
      }, 20000);
    });

    $scope.$on('$ionicView.leave', function () {
      console.log('leaving UserMessages view, destroying interval');
      // Make sure that the interval is destroyed
      if (angular.isDefined(messageCheckTimer)) {
        $interval.cancel(messageCheckTimer);
        messageCheckTimer = undefined;
      }
    });

    $scope.$on('$ionicView.beforeLeave', function () {
      if (!$scope.input.message || $scope.input.message === '') {
        localStorage.removeItem('userMessage-' + $scope.chatedId);
      }
    });

    $scope.$watch('input.message', function (newValue, oldValue) {
      console.log('input.message $watch, newValue ' + newValue);
      if (!newValue) newValue = '';
      localStorage['userMessage-' + $scope.chatedId] = newValue;
    });

    $scope.keepKeyboardOpen = function () {
      console.log('keepKeyboardOpen');
      txtInput.one('blur', function() {
        console.log('textarea blur, focus back on it');
        txtInput[0].focus();
      });
    }

    $scope.sendMessage = function () {

      var newPostKey = firebase.database().ref().child('support/' + $rootScope.userId).push().key;
      var newPostRef = firebase.database().ref().child('support/' + $rootScope.userId + '/' + newPostKey)
      var message = {
        key: newPostKey,
        createdAt: new Date().getTime(),
        text: $scope.input.message,
        sender: $rootScope.userId,
        status: 0,
        type: 1

      };

      // if you do a web service call this will be needed as well as before the viewScroll calls
      // you can't see the effect of this in the browser it needs to be used on a real device
      // for some reason the one time blur event is not firing in the browser but does on devices

      //MockService.sendMessage(message).then(function(data) {
      $scope.input.message = '';
      newPostRef.update(message);
      $rootScope.service.Ana('sendMessage', {
        type: 1,
        sender: $rootScope.userId,
        to: $scope.chatedId,
        text: message.text
      })

      $timeout(function () {
        $scope.keepKeyboardOpen();
        viewScroll.scrollBottom(true);
      }, 0);
      //});
    };

    // this keeps the keyboard open on a device only after sending a message, it is non obtrusive

    $scope.showStatus = function (index) {
      if ($scope.Status && $scope.Status[index]) {
        delete $scope.Status[index]
      } else if (!$scope.Status || !$scope.Status[index]) {
        $scope.Status = {};
        $scope.Status[index] = true
      }
    }
    // this prob seems weird here but I have reasons for this in my app, secret!

    // I emit this event from the monospaced.elastic directive, read line 480
    $scope.$on('taResize', function (e, ta) {
      console.log('taResize');
      if (!ta) return;

      var taHeight = ta[0].offsetHeight;
      console.log('taHeight: ' + taHeight);

      if (!footerBar) return;

      var newFooterHeight = taHeight + 10;
      newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

      footerBar.style.height = newFooterHeight + 'px';
      scroller.style.bottom = newFooterHeight + 'px';
    });


    $scope.onMessageHold = function (e, itemIndex, message) {
      console.log('onMessageHold');
      console.log('message: ' + JSON.stringify(message, null, 2));
      $ionicActionSheet.show({
        buttons: [{
          text: 'Copy Text'
        }, {
          text: 'Delete Message'
        }],
        buttonClicked: function (index) {
          switch (index) {
            case 0: // Copy Text
              //cordova.plugins.clipboard.copy(message.text);

              break;
            case 1: // Delete
              // no server side secrets here :~)
              $scope.messages.splice(itemIndex, 1);
              $timeout(function () {
                viewScroll.resize();
              }, 0);

              break;
          }

          return true;
        }
      });
    };

  }]);


