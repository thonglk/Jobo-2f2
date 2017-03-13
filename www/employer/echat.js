"use strict";
app.controller('eChatsCtrl', function ($q, $scope, $rootScope, CONFIG, $stateParams, $ionicActionSheet, $timeout, $ionicScrollDelegate, $ionicSlideBoxDelegate, $firebaseArray, $ionicPopup, $http, $ionicLoading, AuthUser) {


    $scope.init = function () {
      AuthUser.employer()
        .then(function (result) {
            console.log(result)
            $scope.getListReact(result.storeIdCurrent)

          }, function (error) {
            console.log(error)

            // error
          }
        );


    };


  // Get list
  $scope.getListReact = function (store) {
    if (!$scope.reactList) {
      var reactRef = firebase.database().ref('activity/like').orderByChild('storeId').equalTo($rootScope.storeIdCurrent)
      reactRef.on('value', function (snap) {
        var data = snap.val()
        $scope.reactList = {};
        $scope.reactList.like = [];
        $scope.reactList.liked = [];
        $scope.reactList.match = [];
        $scope.reactUser = {};

        angular.forEach(data, function (card) {
          var reActRef = firebase.database().ref('user/' + card.userId);
          reActRef.once('value', function (snap) {
            $scope.reactUser[card.storeId] = snap.val();
            if (card.status == 1) {

              // match
              var cardPush = {
                storeName: $scope.reactStore[card.storeId].name,
                userid: $scope.reactStore[card.storeId].storeId,
                photourl: $scope.reactStore[card.storeId].photourl,
                likeAt: card.createdAt,
                matchedAt: card.matchedAt,
                jobUser: card.jobUser,
                jobStore: card.jobStore
              }
              $scope.reactList.match.push(cardPush)
            } else {
              if (card.status == 0 && card.type == 1) {
                //liked
                var cardPush = {
                  storeName: $scope.reactStore[card.storeId].name,
                  photourl: $scope.reactStore[card.storeId].photourl,
                  storeId: card.storeId,
                  likeAt: card.createdAt,
                  jobStore: card.jobStore
                }
                $scope.reactList.liked.push(cardPush)

              }
              if (card.status == 0 && card.type == 2) {
                //like
                var cardPush = {
                  storeName: $scope.reactStore[card.storeId].name,
                  photourl: $scope.reactStore[card.storeId].photourl,
                  storeId: card.storeId,
                  likeAt: card.createdAt,
                  jobUser: card.jobUser
                }
                $scope.reactList.like.push(cardPush)

              }
            }

          });


        })
        console.log('$scope.reactList',$scope.reactList)
      })
    }
  };
    $scope.swiperto = function (index) {
      $scope.swiper.slideTo(index);
    };
    $scope.swiper = {};
    $scope.onReadySwiper = function (swiper) {
      console.log('ready');
      $scope.swiper = swiper;
      console.log($scope.swiper)

    };

    $scope.timeAgo = function (timestamp) {
      var time;
      var now = new Date().getTime()
      var a = now - timestamp

      var minute = (a - a % 60000) / 60000
      if (minute < 60) {
        time = minute + " phút trước"
      } else {
        var hour = (minute - minute % 60) / 60 + 1
        if (hour < 24) {
          time = hour + " giờ trước"
        } else {
          var day = (hour - hour % 24) / 24 + 1
          if (hour < 24) {
            time = day + " ngày trước"
          } else {
            var month = (day - day % 30) / 30 + 1
            if (hour < 24) {
              time = month + " tháng trước"
            } else {
              var year = (month - month % 12) / 12 + 1
              time = year + " năm  trước"
            }
          }
        }
      }

      return time;
    }


    $scope.slideIndex = 0

    $scope.slideHasChanged = function (index) {
      console.log('slideHasChanged')
      $scope.slideIndex = index
    }
    $scope.slideTo = function (index) {
      $ionicSlideBoxDelegate.slide(index);

    }


  }
)

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
