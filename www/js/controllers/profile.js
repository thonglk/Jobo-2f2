'use strict';
app.controller("eViewProfileCtrl", ['$scope', '$stateParams', '$sce', '$ionicModal', '$rootScope','$http', function ($scope, $stateParams, $sce, $ionicModal, $rootScope, $http) {
  $scope.deviceHeight = window.innerHeight;
  $scope.$back = function () {
    window.history.back();
  };
  $scope.trustSrc = function (src) {
    return $sce.trustAsResourceUrl(src);
  };

  $scope.calculatemonth = function calculatemonth(birthday) { // birthday is a date
    var birthdate = new Date(birthday);
    var month = birthdate.getMonth() + 1;
    var year = birthdate.getFullYear();
    var time = month + "/" + year;

    return time;
  };

  $scope.schats = function (id) {
    window.location.href = "#/schats/" + id
  };
  $scope.calculateAge = function calculateAge(birthday) { // birthday is a date
    var birthdate = new Date(birthday);
    var ageDifMs = Date.now() - birthdate;
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };
  var userid = firebase.auth().currentUser.uid;
  $scope.userid = userid;
  $scope.profileId = $stateParams.id;
  var db = firebase.database();
  var ref = db.ref("user/employer/" + $scope.profileId);

// Attach an asynchronous callback to read the data at our posts reference
  ref.on("value", function (snapshotc) {
    console.log(snapshotc.val());
    $scope.usercurent = snapshotc.val();
  });

  $scope.matchlike = "";

  function itsAMatch() {
    $ionicModal.fromTemplateUrl('templates/modals/smatch.html', {
      scope: $scope,
      animation: 'animated _fadeOut',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalMatch = modal;
      $scope.modalMatch.show();

      var uid = firebase.auth().currentUser.uid;
      var matchedRef = firebase.database().ref('/user/employer/' + $scope.profileId);
      matchedRef.on('value', function (snap) {
        $scope.matched = snap.val();
      });
      matchStar(matchedRef, uid);

      var matchRef = firebase.database().ref('/user/jobber/' + uid);
      matchRef.on('value', function (snap) {
        $scope.usercurent = snap.val();
      });
      matchStar(matchRef, $scope.profileId);

      function matchStar(matchRef, uid) {
        matchRef.transaction(function (post) {
          console.log("sap match dc roi", uid);

          if (post) {
            if (post.match && post.match[uid]) {
            } else {
              if (!post.match) {
                post.match = {};
              }
              post.match[uid] = true;
              console.log("done", uid);


            }
          }
          return post;
        });
      }


      $scope.hideMatch = function () {
        $scope.modalMatch.hide();
      }
    });
  }

  if (!$rootScope.userliked) {
    $rootScope.userliked = [];
  }
  if (!$rootScope.userdisliked) {
    $rootScope.userdisliked = [];
  }

  $scope.like = function (likewithpost) {
    $scope.matchlike = likewithpost;
    var toTokenRef = firebase.database().ref('token/' + likewithpost);
    toTokenRef.on('value', function (snap) {
      $scope.toToken = snap.val();
      console.log("token", $scope.toToken)
    });
    if ($scope.toToken) {
      var fcm_server_key = "AAAArk3qIB4:APA91bEWFyuKiFqLt4UIrjUxLbduQCWJB4ACptTtgAovz4CKrMdonsS3jt06cfD9gGOQr3qtymBmKrsHSzGhqyJ_UWrrEbA4YheznlqYjsCBp_12bNPFSBepqg_qrxwdYxX_IcT9ne5z6s02I2mu2boy3VTN3lGPYg";

      $http({
        method: "POST",
        dataType: 'jsonp',
        headers: {'Content-Type': 'application/json', 'Authorization': 'key=' + fcm_server_key},
        url: "https://fcm.googleapis.com/fcm/send",
        data: JSON.stringify(
          {
            "notification": {
              "title": "Lượt thích mới ",  //Any value
              "body": $rootScope.myuser.name + " muốn ứng tuyển vào công ty của bạn ",  //Any value
              "sound": "default", //If you want notification sound
              "click_action": "FCM_PLUGIN_ACTIVITY",  //Must be present for Android
              "icon": "fcm_push_icon"  //White icon Android resource
            },
            "data": {
              "param1": "#/sviewprofile/" + $scope.userid,  //Any data to be retrieved in the notification callback
              "param2": "fromSeeker",
              "param3": $rootScope.myuser.name + " muốn ứng tuyển vào công ty của bạn "

            },
            "to": $scope.toToken.tokenId, //Topic or single device
            "priority": "high", //If not set, notification won't be delivered on completely closed iOS app
            "restricted_package_name": "" //Optional. Set for application filtering
          }
        )
      }).success(function (data) {
        console.log("Success: " + JSON.stringify(data));
      }).error(function (data) {
        console.log("Error: " + JSON.stringify(data));
      });
    }
    if (!$rootScope.userdisliked[likewithpost]) {
      $scope.userliked[likewithpost] = true;
      var uid = firebase.auth().currentUser.uid;
      var globalPostRef = firebase.database().ref('/user/employer/' + likewithpost);
      toggleStar(globalPostRef, uid);
      console.log(likewithpost);
    }

    $scope.$back()


  };
  // [START post_stars_transaction]
  function toggleStar(postRef, uid) {
    postRef.transaction(function (post) {
      console.log("sap like dc roi", uid);

      if (post) {
        if (post.stars && post.stars[uid] && post.disstars && post.disstars[uid]) {

        } else {
          post.starCount++;
          if (!post.stars) {
            post.stars = {};
          }
          post.stars[uid] = true;
          console.log("done", uid);
          var mestarRef = firebase.database().ref('user/jobber/' + $scope.userid + '/stars');
          mestarRef.on('value', function (snap) {
            $scope.mestar = snap.val();
          });
          var obj = $scope.mestar;
          // Check if user has already liked me
          for (var prop in obj) {
            if (prop == $scope.matchlike) {
              itsAMatch();
            }
          }

        }
      }
      return post;
    });
  }


  $scope.dislike = function (likewithpost) {
    $scope.matchlike = likewithpost;
    if (!$rootScope.userliked[likewithpost]) {
      $scope.userdisliked[likewithpost] = true;
      var uid = firebase.auth().currentUser.uid;
      var globalPostRef = firebase.database().ref('/user/employer/' + likewithpost);
      distoggleStar(globalPostRef, uid);

      console.log(likewithpost);
    }
    $scope.$back()

  };
  // [START post_stars_transaction]
  function distoggleStar(postRef, uid) {
    postRef.transaction(function (post) {
      console.log("sap dislike dc roi", uid);

      if (post) {
        if (post.stars && post.stars[uid] && post.disstars && post.disstars[uid]) {

        } else {
          post.disstarCount++;
          if (!post.disstars) {
            post.disstars = {};
          }
          post.disstars[uid] = true;
          console.log("done", uid);


        }
      }
      return post;
    });
  }

}])

