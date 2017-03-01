"use strict";

app.controller('eDashCtrl', function ($scope, $state, $firebaseArray, $http
  , CONFIG
  , $window
  , $cordovaToast
  , $cordovaLocalNotification
  , $cordovaSocialSharing
  , $ionicLoading
  , $ionicPlatform
  , $ionicPopover
  , $log
  , $rootScope
  , $ionicModal
  , $ionicSlideBoxDelegate
  , $ionicPopup
  , TDCardDelegate
  , $timeout) {



  angular.element($window).bind('resize', function () {

    $scope.width = $window.innerWidth;
    if ($scope.width <= 1920 && $scope.width > 1024) {
      var mySwiper = new Swiper('.swiper-container', {
        slidesPerView: 3
      })
    }

    if ($scope.width <= 1024 && $scope.width > 767) {
      var mySwiper = new Swiper('.swiper-container', {
        slidesPerView: 2
      })
    }

    if ($scope.width <= 767) {
      var mySwiper = new Swiper('.swiper-container', {
        slidesPerView: 1
      })
    }
    console.log($scope.width);
    // manuall $digest required as resize event
    // is outside of angular
    $scope.$digest();
  });
  $scope.initSlide = function () {
    var slidesPerView;
    $scope.width = $window.innerWidth;
    if ($scope.width > 1024) {
      slidesPerView = 3
    }
    if ($scope.width <= 1024 && $scope.width > 767) {
      slidesPerView = 2
    }

    if ($scope.width <= 767) {
      slidesPerView = 1

    }
    return slidesPerView
  }

  $scope.init = function () {

    $ionicPlatform.registerBackButtonAction(function (event) {
      event.preventDefault();
    }, 100);
    $rootScope.registering = false;


    var user = firebase.auth().currentUser;

    if (user) {

      // User is signed in.
      $rootScope.userid = user.uid;
      console.log("i'm in " + $rootScope.userid);


      var tokenRef = firebase.database().ref("token/" + $rootScope.userid);
      if ($rootScope.tokenuser) {
        tokenRef.update({
          userid: $rootScope.userid,
          tokenId: $rootScope.tokenuser

        })
      }
      ;

      if (!$rootScope.usercurent) {
        var userRef = firebase.database().ref('user/' + $rootScope.userid);
        userRef.once('value', function (snapshot) {
          $rootScope.usercurent = snapshot.val();
          $rootScope.storeIdCurrent = $rootScope.usercurent.currentStore
          $rootScope.loadCurrentStore();
          console.log(" with " + $rootScope.storeIdCurrent)

          $scope.getUserFiltered()
        });
      } else {
        $scope.getUserFiltered()
      }
      $rootScope.loadCurrentStore = function () {
        var storeDataCurrent = firebase.database().ref('store/' + $rootScope.storeIdCurrent);
        storeDataCurrent.on('value', function (snap) {
          $rootScope.storeDataCurrent = snap.val()
          console.log($rootScope.storeDataCurrent);
        });
      }


    } else {
      // No user is signed in.
    }


    /*

     firebase.auth().onAuthStateChanged(function (user) {
     if (user) {

     console.log("i'm in", user.uid);

     $ionicLoading.show({
     template: '<p>Đang tải dữ liệu ứng viên...</p><ion-spinner></ion-spinner>'
     });


     $timeout(function () {
     $scope.userchat = $firebaseArray(cardRef);
     console.log("chat", $scope.userchat);
     }, 2000);

     var newmessagesRef = firebase.database().ref('newmessages/' + $scope.userid);
     newmessagesRef.on('value', function (snap) {
     $scope.newmessage = snap.val();
     });


     $scope.checknewmessage = function () {
     if ($scope.newmessage) {
     $scope.totalcount = 0;

     for (var obj in $scope.newmessage) {
     $scope.totalcount++;
     }
     return ($scope.totalcount > 0);
     }
     };
     // Get a database reference to our posts
     } else {
     // No user is signed in.
     $state.go("login");
     }

     });

     */
  }



  $scope.$back = function () {
    window.history.back();
  };


// //refresh swiper card
//   $scope.onReadySwiper = function (swiper) {
//
//     $scope.swiper = swiper;
//     $scope.swiper.update();
//
//     console.log($scope.swiper)
//
//
//   };


  $scope.$on('ngRepeatFinished', function () {
    $scope.mySwiper = new Swiper('.swiper-container', {
      //Your options here:
      slidesPerView: $scope.initSlide()
    })
    console.log($scope.mySwiper)
    });

//
// //Tinh khoang cach
// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//   var R = 6371; // Radius of the earth in km
//   var dLat = deg2rad(lat2 - lat1);  // deg2rad below
//   var dLon = deg2rad(lon2 - lon1);
//   var a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2)
//     ;
//   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   var x = R * c; // Distance in km
//   var n = parseFloat(x);
//   x = Math.round(n * 10) / 10;
//   return x;
// }
//
// function deg2rad(deg) {
//   return deg * (Math.PI / 180)
// }
//
// //end tinh khoang cach

  $scope.getUserFiltered = function () {
    // $ionicLoading.show({
    //   template: '<p>Đang tải dữ liệu ứng viên...</p><ion-spinner></ion-spinner>'
    // });
    var filtersRef = firebase.database().ref('filter/' + $rootScope.userid);
    filtersRef.on('value', function (snap) {
      $scope.newfilter = snap.val();

      if ($scope.newfilter) {
        $scope.newfilter.userid = $rootScope.storeIdCurrent;
        console.log($scope.newfilter);
        $http({
          method: 'GET',
          url: CONFIG.APIURL + '/api/users',
          params: $scope.newfilter
        }).then(function successCallback(response) {
          console.log("respond", response.data);
          $scope.usercard = response.data;
          $ionicLoading.hide();
        })

      } else {
        $ionicLoading.hide();
      }
    });


    // $scope.mylat = $scope.usercurent.location.location.lat;
    // $scope.mylng = $scope.usercurent.location.location.lng;
    // $scope.usercard = [];
    // angular.forEach($scope.Objcards, function (card) {
    //   if (card.location && card.location.location) {
    //     var yourlat = card.location.location.lat;
    //     var yourlng = card.location.location.lng;
    //     var distance = getDistanceFromLatLonInKm($scope.mylat, $scope.mylng, yourlat, yourlng);
    //
    //
    //     if ((card.stars && !card.stars[$scope.userid]) && (card.disstars && !card.disstars[$scope.userid]) && distance < $scope.userdistance) {
    //       card.distance = distance;
    //       if ($scope.newfilter && $scope.newfilter.onlydistance === true) {
    //         $scope.usercard.push(card)
    //
    //       } else {
    //         if (card.interest && card.interest.time && card.interest.time[$scope.newfilter.time] && card.interest.job && card.interest.job[$scope.newfilter.job]) {
    //           $scope.usercard.push(card)
    //
    //         }
    //       }
    //     }
    //   }
    // });
    // console.log("array", $scope.usercard);
  };

  $scope.ontouch = function () {
    console.log("touch")
    // $scope.swiper = swiper;
    // $scope.swiper.update();
    console.log($scope.mySwiper.activeIndex);

    console.log($scope.mySwiper.activeIndex);
    if ($scope.mySwiper.activeIndex == $scope.limit - 1) {
      $scope.limit = $scope.limit + 5;
    }
  };
  /*
   $scope.viewliked = function () {
   $ionicModal.fromTemplateUrl('templates/modals/liked/eliked.html', {
   scope: $scope,
   animation: 'slide-in-up',
   hideDelay: 920
   }).then(function (modal) {
   $scope.modalProfile = modal;
   $scope.modalProfile.show();
   var userlikeRef = firebase.database().ref('user/jobber').orderByChild('stars/' + $scope.userid).equalTo(true);
   userlikeRef.on('value', function (snap) {
   $scope.liked = snap.val();
   console.log('filter', snap.val())
   });
   $scope.hideliked = function () {
   $scope.modalProfile.hide();

   }

   })
   };*/
  $scope.changefilter = function () {

    $scope.newfilter.onlydistance = true;
    $scope.doRefresh();

  };

  $scope.editjob = function () {
    if (!$scope.newfilter) {
      $scope.newfilter = {};
    }
    $ionicModal.fromTemplateUrl('templates/modals/efilter.html', {
      scope: $scope,
      animation: 'animated _zoomOut',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalProfile = modal;
      $scope.modalProfile.show();
      $scope.cancel = function () {
        $scope.modalProfile.hide();

      };
      $scope.selectjob = function (selectedjob) {
        $scope.newfilter.job = selectedjob;
        console.log('select', $scope.newfilter)

      };
      $scope.showjob = function () {

        $ionicPopup.confirm({
          title: 'Vị trí bạn đang cần tuyển',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'employer/popup/select-job.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-dark bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            console.log('You are sure');
            console.log('select', $scope.newfilter)


          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.showtime = function () {
        $scope.selecttime = function (selectedtime) {
          $scope.newfilter.time = selectedtime;
          console.log('select', $scope.newfilter)
        };
        $ionicPopup.confirm({
          title: 'Ca làm việc',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/select-time.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-dark bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            console.log('You are sure');

          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.createHospital = function () {
        var uid = firebase.auth().currentUser.uid;
        var filtersRef = firebase.database().ref('filter/' + uid);

        console.log($scope.newfilter);
        filtersRef.update($scope.newfilter)
        $scope.modalProfile.hide();
        $scope.getUserFiltered();
      };
    });
  };
  $scope.gotosprofile = function (id) {
    window.location.href = "#/viewprofile/" + id
  };

  $scope.slideHasChanged = function (index) {
    console.log('slideHasChanged');
    $scope.slideIndex = index
  };

  $scope.slideTo = function (index) {
    $ionicSlideBoxDelegate.slide(index);
  };
  $scope.deviceHeight = window.innerHeight;


  $scope.slideIndex = 1;
// to logout


  $scope.share = function () {
    $cordovaSocialSharing
      .shareViaFacebook("Tuyển nhân viên nhanh chóng và hiệu quả!", "", 'https://www.facebook.com/jobovietnam')
      .then(function (result) {
        // Success!
      }, function (err) {
        // An error occurred. Show a message to the user
      });

  };


  $scope.matchlike = "";

  if (!$rootScope.userliked) {
    $rootScope.userliked = [];
  }
  if (!$rootScope.userdisliked) {
    $rootScope.userdisliked = [];
  }

  // $scope.newHospital = {};
  // $scope.applyJob = function () {
  //   $scope.userliked = $scope.usercard[$scope.swiper.activeIndex];
  //
  //   $ionicPopup.confirm({
  //     title: 'Vị trí bạn muốn offer ' + $scope.userliked.name,
  //     scope: $scope,
  //     // template: 'Are you sure you want to eat this ice cream?',
  //     templateUrl: 'employer/modals/offer-job.html',
  //     cssClass: 'animated bounceInUp dark-popup',
  //     okType: 'button-small button-calm bold',
  //     okText: 'Done',
  //     cancelType: 'button-small'
  //   }).then(function (res) {
  //     if (res) {
  //       for (var obj in $scope.newHospital.job) {
  //         $scope.keyjob = $scope.newHospital.job[obj];
  //         console.log('obj', $scope.keyjob);
  //         if ($scope.keyjob == false) {
  //           delete $scope.newHospital.job[obj];
  //         }
  //       }
  //       console.log('You are sure', $scope.newHospital);
  //       $scope.like($scope.newHospital.job)
  //       $scope.newHospital = {};
  //       console.log('Done', $scope.newHospital);
  //
  //
  //     } else {
  //       console.log('You are not sure');
  //     }
  //   });
  // };

  $scope.applyThis = function (id, key) {
    if ($scope.selectedJob && $scope.selectedJob[id] && $scope.selectedJob[id][key]) {
      delete $scope.selectedJob[id][key]
    } else {

      if (!$scope.selectedJob) {
        $scope.selectedJob = {}
      }
      if (!$scope.selectedJob[id]) {
        $scope.selectedJob[id] = {}
      }
      $scope.selectedJob[id][key] = true;
    }
  }


$scope.like = function (action) {
  var likedId = $scope.usercard[$scope.swiper.activeIndex].userid;
  var likeActivity = firebase.database().ref('activity/like/' + $rootScope.storeIdCurrent + ':' + likedId)
  likeActivity.once('value', function (snap) {
    var likeCurrent = snap.val();
    console.log(likeCurrent);
    if (!likeCurrent) {
      likeActivity.update({
        createdAt: new Date().getTime(),
        type: 1,
        status: action,
        job: $scope.selectedJob[likedId],
        employerId: $rootScope.userid,
        like: $rootScope.storeIdCurrent,
        liked: likedId
      })
    }
    if (likeCurrent && likeCurrent.liked == $rootScope.storeIdCurrent && likeCurrent.status == 0) {
      likeActivity.update({
        matchedAt: new Date().getTime(),
        status: 1
      })
    }
  });
}

/*

 $scope.like = function () {
 var likewithpost = $scope.usercard[$scope.swiper.activeIndex].userid;
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
 "body": $scope.usercurent.name + " đã thích hồ sơ của bạn, apply vào đây thôi! ",  //Any value
 "sound": "default", //If you want notification sound
 "click_action": "FCM_PLUGIN_ACTIVITY",  //Must be present for Android
 "icon": "fcm_push_icon"  //White icon Android resource
 },
 "data": {
 "param1": "#/eviewprofile/" + $scope.userid,  //Any data to be retrieved in the notification callback
 "param2": "fromEmployer",
 "param3": $scope.usercurent.name + " đã thích hồ sơ của bạn "

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
 console.log($scope.userliked);

 var globalPostRef = firebase.database().ref('/reactUser/' + likewithpost);


 toggleStar(globalPostRef, $rootScope.storeIdCurrent, job);
 console.log("toggleStar");

 }
 $timeout(function () {
 $scope.swiper.slideNext();
 }, 1000);
 };
 function toggleStar(postRef, uid, job) {
 postRef.transaction(function (post) {
 if (!post) {
 post = {}
 }
 console.log("sap like dc roi", post);
 if (post) {
 if (post.like && post.like[uid] && post.dislike && post.dislike[uid]) {

 } else {
 if (!post.like) {
 post.like = {};
 }
 post.like[uid] = {
 storeLike: uid,
 status: 0,
 createdAt: firebase.database.ServerValue.TIMESTAMP,
 job: job
 };


 console.log("done", uid);
 var obj = $scope.usercurent.stars;
 // Check if user has already liked me
 for (var prop in obj) {
 if (prop == $scope.matchlike) {
 itsAMatch();
 pushmatch(uid)
 }
 }

 }
 }
 return post;
 });
 }
 */

$scope.dislike = function () {
  var likewithpost = $scope.usercard[$scope.swiper.activeIndex].userid;
  $scope.matchlike = likewithpost;
  if (!$rootScope.userliked[likewithpost]) {
    $scope.userdisliked[likewithpost] = true;
    console.log($scope.userdisliked);
    var uid = firebase.auth().currentUser.uid;
    var globalPostRef = firebase.database().ref('/user/jobber/' + likewithpost);
    distoggleStar(globalPostRef, uid);
    console.log(likewithpost);
  }
  $timeout(function () {
    $scope.swiper.slideNext();
  }, 1000);

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

$scope.limit = 5;


$scope.onTouch = function () {
  $ionicSlideBoxDelegate.enableSlide(false);
  console.log('touched');

};
$scope.onRelease = function () {
  $ionicSlideBoxDelegate.enableSlide(true);
  console.log('released');
};

function pushmatch(uid) {
  var toTokenRef = firebase.database().ref('token/' + uid);
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
            "title": "Chúc mừng bạn đã matching ",  //Any value
            "body": $scope.usercurent.name + " và bạn đã matching với nhau, phỏng vấn đi làm thôi! ",  //Any value
            "sound": "default", //If you want notification sound
            "click_action": "FCM_PLUGIN_ACTIVITY",  //Must be present for Android
            "icon": "fcm_push_icon"  //White icon Android resource
          },
          "data": {
            "param1": "#/schats/" + $scope.userid,  //Any data to be retrieved in the notification callback
            "param2": "matching",
            "param3": $scope.usercurent.name + " và bạn đã matching với nhau, phỏng vấn đi làm thôi!"

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


}


function itsAMatch() {
  $ionicModal.fromTemplateUrl('templates/modals/ematch.html', {
    scope: $scope,
    animation: 'animated _fadeOut',
    hideDelay: 920
  }).then(function (modal) {
    $scope.modalMatch = modal;
    $scope.modalMatch.show();
    $scope.matched = $scope.Objcards[$scope.matchlike];

    var uid = firebase.auth().currentUser.uid;

    var matchedRef = firebase.database().ref('/user/jobber/' + $scope.matched.userid);
    matchStar(matchedRef, uid);
    var matchRef = firebase.database().ref('/user/employer/' + uid);
    matchStar(matchRef, $scope.matched.userid);


    function matchStar(matchRef, uid) {
      matchRef.transaction(function (post) {
        console.log("sap match dc roi", uid);

        if (post) {
          if (post.match && post.match[uid]) {
            post.match[uid] = null;
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


    $scope.chat = function () {
      $state.go("/chats/" + $scope.matched.userid)
    };

    $scope.hideMatch = function () {
      $scope.modalMatch.hide();
    }
  });
}
})
;
