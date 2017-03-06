"use strict";
app.controller('eChatsCtrl', function ($scope, $rootScope, CONFIG, $stateParams, $ionicActionSheet, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate, $firebaseArray, $ionicPopup, $http, $ionicLoading) {

  $scope.init = function () {
    var user = firebase.auth().currentUser;

    if (user) {
      // User is signed in.
      $rootScope.userid = user.uid;
      var setCurrent = firebase.database().ref('currentStore/' + $rootScope.userid)
      setCurrent.once('value', function (snap) {
        var data = snap.val();
        if (data) {
          $rootScope.storeIdCurrent = data.currentStore;
          console.log("i'm in " + $rootScope.userid + 'with' + $rootScope.storeIdCurrent);
          $scope.getListReact()

        }
      })
    }

  };

  // Get list
  $scope.getListReact = function () {
    if (!$scope.reactList) {
      $http({
        method: 'GET',
        url: CONFIG.APIURL + '/api/employer/react?id=' + $rootScope.storeIdCurrent + '&react=apply'
      }).then(function successCallback(response) {
        console.log("respond", response.data);
        $scope.reactList = response.data;
      })
    }
  };

  $scope.slideIndex = 0

  $scope.slideHasChanged = function (index) {
    console.log('slideHasChanged')
    $scope.slideIndex = index
  }
  $scope.slideTo = function (index) {
    $ionicSlideBoxDelegate.slide(index);

  }
  $scope.chatTo = function (index) {
    console.log(index)

    $rootScope.chatUser = index;
    console.log($rootScope.chatUser);
    $ionicSlideBoxDelegate.slide(1);

    if ($rootScope.chatUser) {

    }

    //set Interview

    $scope.setInterview = function (timeInterview) {
      console.log(timeInterview);
      var timeInterviewRef = firebase.database().ref('activity/' + $rootScope.storeIdCurrent + $rootScope.chatUser.userid)
      timeInterviewRef.update({interview: timeInterview});
      var newPostRef = firebase.database().ref().child('chat/' + $rootScope.storeIdCurrent + $rootScope.chatUser.userid + '/interview')

      var message = {
        key: "interview",
        createdAt: new Date().getTime(),
        interview: timeInterview,
        place: $rootScope.storeDataCurrent.address,
        sender: $rootScope.storeIdCurrent,
        status: 0,
        type: 1
      };
      newPostRef.update(message);

    }

  };


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


  $scope.swiper = {};
  $scope.onReadySwiper = function (swiper) {
    console.log('ready');
    $scope.swiper = swiper;
    console.log($scope.swiper)

  };
  $scope.swiperto = function (index) {
    $scope.swiper.slideTo(index);
  };

  $scope.timeConverter = function (timestamp) {
    var a = new Date(timestamp);
    var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = hour + ' : ' + min + ' ' + date + '/' + month + '/' + year;
    return time;
  }


})
  .controller("eChatDetailCtrl", ["$scope", '$rootScope', "chatMessages", "$stateParams", "Auth", "$ionicActionSheet", "$timeout", "$ionicScrollDelegate", "$firebaseArray", "$ionicPopup", "$http", function ($scope, $rootScope, chatMessages, $stateParams, Auth, $ionicActionSheet, $timeout, $ionicScrollDelegate, $firebaseArray, $ionicPopup, $http) {

    $scope.init = function () {
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner>'
      });
      $scope.chated = $stateParams.chatId;
      var messageRef = firebase.database().ref('chat/' + $rootScope.storeIdCurrent + $scope.chated);
      messageRef.on('value', function (snap) {
        $scope.messages = snap.val();
        console.log($scope.messages);
        $timeout(function () {
          viewScroll.scrollBottom();
        }, 0);
      })
      var chatedRef = firebase.database().ref('user/' + $scope.chated);
      chatedRef.on('value', function (snap) {
        $timeout(
          $scope.chatedData = snap.val()
          , 0);
      })
      $ionicLoading.hide();

    };


    $scope.input = {
      message: localStorage['userMessage-' + $rootScope.chatUser.userid] || ''
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
        localStorage.removeItem('userMessage-' + $rootScope.chatUser.userid);
      }
    });


    $scope.$watch('input.message', function (newValue, oldValue) {
      console.log('input.message $watch, newValue ' + newValue);
      if (!newValue) newValue = '';
      localStorage['userMessage-' + $rootScope.chatUser.userid] = newValue;
    });

    $scope.keepKeyboardOpen = function () {
    }

    $scope.sendMessage = function (sendMessageForm) {
      var newPostKey = firebase.database().ref().child('chat/' + $rootScope.storeIdCurrent + $rootScope.chatUser.userid).push().key;
      var newPostRef = firebase.database().ref().child('chat/' + $rootScope.storeIdCurrent + $rootScope.chatUser.userid + '/' + newPostKey)
      var message = {
        key: newPostKey,
        createdAt: new Date().getTime(),
        text: $scope.input.message,
        sender: $rootScope.storeIdCurrent,
        status: 0,
        type: 0

      };

      // if you do a web service call this will be needed as well as before the viewScroll calls
      // you can't see the effect of this in the browser it needs to be used on a real device
      // for some reason the one time blur event is not firing in the browser but does on devices

      //MockService.sendMessage(message).then(function(data) {
      $scope.input.message = '';

      newPostRef.update(message);


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
      window.location.href = '#/viewprofile/' + msg
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
  }])


/*
 .controller("eChatDetailCtrl", ["$scope",'$rootScope', "chatMessages", "$stateParams", "Auth", "$ionicActionSheet", "$timeout", "$ionicScrollDelegate", "$firebaseArray", "$ionicPopup", "$http", function ($scope,$rootScope, chatMessages, $stateParams, Auth, $ionicActionSheet, $timeout, $ionicScrollDelegate, $firebaseArray, $ionicPopup, $http) {
 $scope.init = function () {
 $scope.userchat = $rootScope.userid
 $scope.firebaseUser = firebase.auth().currentUser.uid;
 console.log("Hihi: ", $scope.firebaseUser);
 var userRef = firebase.database().ref('user/employer/' + $scope.firebaseUser)
 userRef.on('value', function (snap) {
 $scope.usercurent = snap.val();
 })
 // we add chatMessages array to the scope to be used in our ng-repeat
 $scope.messages = chatMessages;


 $scope.formId = $stateParams.chatId;
 var db = firebase.database();
 var ref = db.ref('user/jobber/' + $scope.formId);

 // Attach an asynchronous callback to read the data at our posts reference
 ref.on("value", function (snapshotc) {
 console.log("this" + snapshotc.val());
 $scope.fromdata = snapshotc.val();

 }, function (errorObject) {
 console.log("The read failed: " + errorObject.code);
 });
 }


 $scope.$back = function () {
 window.history.back();
 };

 $scope.showphone = function () {

 // An elaborate, custom popup
 var myPopup = $ionicPopup.show({
 templateUrl: 'templates/popups/contact.html',
 title: "Liên hệ",
 scope: $scope,
 buttons: [
 {text: 'Cancel'},
 ]
 });

 myPopup.then(function (res) {
 console.log('Tapped!', res);
 });
 };


 $scope.clearnewmes = function () {
 var myRef = firebase.database().ref('newmessages/' + $scope.firebaseUser);
 myRef.transaction(function (post) {

 if (post && post[$scope.formId]) {
 post[$scope.formId] = null;
 }
 return post;
 });
 }


 // a method to create new messages; called by ng-submit
 $scope.addMessage = function () {
 var usersRef = firebase.database().ref('newmessages/' + $scope.formId);
 usersRef.transaction(function (post) {

 if (post && post[$scope.firebaseUser]) {
 post[$scope.firebaseUser]++
 } else {
 if (!post) {
 post = {};
 }
 post[$scope.firebaseUser] = 1;
 console.log("done", $scope.firebaseUser);
 }

 return post;
 });

 // calling $add on a synchronized array is like Array.push(),
 // except that it saves the changes to our database!
 $scope.messages.$add({
 from: $scope.firebaseUser,
 to: $scope.formId,
 text: $scope.newMessageText,
 timestamp: firebase.database.ServerValue.TIMESTAMP

 });
 // push noti
 var toTokenRef = firebase.database().ref('token/' + $scope.formId);
 toTokenRef.on('value', function (snap) {
 $scope.toToken = snap.val()
 });


 FCMPlugin.subscribeToTopic('all'); //subscribe current user to topic

 var fcm_server_key = "AAAArk3qIB4:APA91bEWFyuKiFqLt4UIrjUxLbduQCWJB4ACptTtgAovz4CKrMdonsS3jt06cfD9gGOQr3qtymBmKrsHSzGhqyJ_UWrrEbA4YheznlqYjsCBp_12bNPFSBepqg_qrxwdYxX_IcT9ne5z6s02I2mu2boy3VTN3lGPYg";

 $http({
 method: "POST",
 dataType: 'jsonp',
 headers: {'Content-Type': 'application/json', 'Authorization': 'key=' + fcm_server_key},
 url: "https://fcm.googleapis.com/fcm/send",
 data: JSON.stringify(
 {
 "notification": {
 "title": "Tin nhắn mới",  //Any value
 "body": $scope.usercurent.name + ":" + $scope.newMessageText,  //Any value
 "sound": "default", //If you want notification sound
 "click_action": "FCM_PLUGIN_ACTIVITY",  //Must be present for Android
 "icon": "fcm_push_icon",  //White icon Android resource
 "content_available": true
 },
 "data": {
 "param1": '#/schats/' + $scope.firebaseUser,  //Any data to be retrieved in the notification callback
 "param2": 'chat',
 "param3": $scope.usercurent.name + ": " + $scope.newMessageText

 },
 "to": $scope.toToken.tokenId, //Topic or single device
 "priority": "high", //If not set, notification won't be delivered on completely closed iOS app
 "restricted_package_name": "" //Optional. Set for application filtering
 }
 )
 }).success(function (data) {
 $scope.reply = $scope.newMessageText;
 console.log("Success: " + JSON.stringify(data));
 }).error(function (data) {
 console.log("Error: " + JSON.stringify(data));
 });
 // reset the message input
 $scope.newMessageText = "";
 $ionicScrollDelegate.$getByHandle('userMessageScroll').scrollBottom();
 };

 var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');

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
 var footerBar; // gets set in $ionicView.enter
 var scroller;

 $scope.timeConverter = function (timestamp) {
 var a = new Date(timestamp);
 var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
 var year = a.getFullYear();
 var month = months[a.getMonth()];
 var date = a.getDate();
 var hour = a.getHours();
 var min = a.getMinutes();
 var sec = a.getSeconds();
 var time = hour + ' : ' + min + ' ' + date + '/' + month + '/' + year;
 return time;
 }
 }
 ])
 */
