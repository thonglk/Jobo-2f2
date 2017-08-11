"use strict";
app.controller("eChatDetailCtrl", ["$scope", '$rootScope', "$stateParams", "AuthUser", "$ionicActionSheet", "$timeout", "$ionicScrollDelegate", "$firebaseArray", "$ionicPopup", "$http", '$interval', '$ionicLoading', '$cordovaToast', function ($scope, $rootScope, $stateParams, AuthUser, $ionicActionSheet, $timeout, $ionicScrollDelegate, $firebaseArray, $ionicPopup, $http, $interval, $ionicLoading, $cordovaToast) {
  var likeAct;

  $scope.init = function () {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    });
    $scope.chatedId = $stateParams.chatId;
    AuthUser.user().then(function () {
      $scope.loadMessage($rootScope.storeId, $scope.chatedId);

    });


  };

  $scope.loadMessage = function (storeId, chatedId) {

    var messageRef = firebase.database().ref('chat/' + storeId + ':' + chatedId);
    messageRef.on('value', function (snap) {
      $scope.messages = snap.val();
      console.log($scope.messages);
      $timeout(function () {
        viewScroll.scrollBottom();
      }, 0);
    })

    $rootScope.service.JoboApi('on/profile',{userId: chatedId}).then(function (data) {
      $timeout(function () {
          $rootScope.chatUser = data.data;
          $rootScope.chatUser.chatedId = $scope.chatedId;
          likeAct = firebase.database().ref('activity/like/' + $rootScope.storeId + ':' + chatedId);
          likeAct.on('value', function (snap) {
            $timeout(function () {
              $rootScope.chatUser.act = snap.val();
              console.log('$rootScope.profileData.act', $rootScope.chatUser.act)
              $rootScope.phoneShow(chatedId)
              $ionicLoading.hide();

            })
          });
        }
      );
    });
    /*var chatedRef = firebase.database().ref('profile/' + chatedId);
    chatedRef.on('value', function (snap) {
      $timeout(function () {
          $rootScope.chatUser = snap.val()
          $rootScope.chatUser.chatedId = $scope.chatedId
          likeAct = firebase.database().ref('activity/like/' + $rootScope.storeId + ':' + chatedId);
          likeAct.on('value', function (snap) {
            $timeout(function () {
              $rootScope.chatUser.act = snap.val();
              console.log('$rootScope.profileData.act', $rootScope.chatUser.act)
              $rootScope.phoneShow(chatedId)
              $ionicLoading.hide();
            })
          });
        }
      );
    });*/

  }


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

    var newPostKey = firebase.database().ref().child('chat/' + $rootScope.storeId + ":" + $scope.chatedId).push().key;
    var newPostRef = firebase.database().ref().child('chat/' + $rootScope.storeId + ":" + $scope.chatedId + '/' + newPostKey)
    var message = {
      key: newPostKey,
      createdAt: new Date().getTime(),
      text: $scope.input.message,
      sender: $rootScope.storeId,
      status: 0,
      type: 0
    };


    $scope.input.message = '';
    if ($rootScope.chatUser.act && $rootScope.chatUser.act.showContact) {
      newPostRef.update(message);
      $rootScope.service.Ana('sendMessage', {
        type: 0,
        sender: $rootScope.storeId,
        to: $scope.chatedId,
        text: message.text
      })

    } else {
      $scope.showphone()
    }


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
  $scope.viewProfile = function (msg) {
    window.location.href = '#/view/profile/' + msg
  };

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

  $scope.setInterview = function (timeInterview) {
    console.log(timeInterview,     new Date(timeInterview).getTime()
    );
    var timeInterviewRef = firebase.database().ref('activity/like/' + $rootScope.storeId + ":" + $scope.chatedId)
    timeInterviewRef.update({interview:     new Date(timeInterview).getTime()
    });
  }

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

  $rootScope.phoneShow = function (chatedId) {
    if ($rootScope.chatUser.act && $rootScope.chatUser.act.showContact) {
      $rootScope.service.JoboApi('on/user',{userId: chatedId}).then(function (data) {
        $timeout(function () {
          if (!$rootScope.contact) {
            $rootScope.contact = {}
          }
          $rootScope.contact = data.data;

        })
      });
      /*var contactRef = firebase.database().ref('user/' + chatedId)
      contactRef.once('value', function (snap) {
        $timeout(function () {
          if (!$rootScope.contact) {
            $rootScope.contact = {}
          }
          $rootScope.contact = snap.val()
        })
      })*/
    }
  }

  $scope.showphone = function () {
    $rootScope.service.Ana('showPhone', {chatedId: $scope.chatedId})
    $scope.confirmShow = function () {
      if ($rootScope.userData.credit >= 30) {
        likeAct.update({
          showContact: new Date().getTime()
        })
        $rootScope.service.JoboApi('update/user',{
          userId: $rootScope.userId,
          user: {
            credit: $rootScope.userData.credit - 30
          }
        });
        /*var userRef = firebase.database().ref('user/' + $rootScope.userId)
        userRef.update({
          credit: $rootScope.userData.credit - 30
        })*/
        $rootScope.phoneShow($scope.chatedId)
        $rootScope.service.Ana('confirmShowPhone', {chatedId: $scope.chatedId})
      } else {
        $rootScope.service.Ana('confirmShowPhone', {
          chatedId: $scope.chatedId,
          result: 'not enough'
        })
        $cordovaToast.showShortTop('Bạn không đủ credit để mở khóa liên hệ ứng viên, hãy nạp thêm')
      }
    }


    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/popups/contact.html',
      title: "Liên hệ",
      scope: $scope,
      buttons: [{text: 'Cancel'}
      ]
    });

    myPopup.then(function (res) {
      console.log('Tapped!', res);
    });
  };

}])


/**
 * Created by khanhthong on 3/6/17.
 */
