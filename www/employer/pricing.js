'user strict';

app.controller('pricingCtrl', function ($scope, $ionicModal,$rootScope) {
  $scope.vip = {month: 12};
  $scope.point = {point: 200};
  $scope.point.pricePoint = 6;
  $scope.vip.priceMonth = 300;

  $scope.buy = function (data) {
    $ionicModal.fromTemplateUrl('employer/modals/invoice.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalProfile = modal;
      $scope.modalProfile.show();
      $scope.data = data;
      console.log($scope.data, $rootScope.userid)

      $scope.totalprice = function () {
        if ($scope.data.month) {
          $scope.total = $scope.data.month * $scope.data.priceMonth
        }
        if ($scope.data.point) {
          $scope.total = $scope.data.point * $scope.data.pricePoint
        }
        return $scope.total
      }
      $scope.submit = function () {
        if ($scope.data && !$scope.data.method) {
          $scope.unMethod = "Vui lòng chọn"
        } else {
          $scope.unMethod = "";
          var activityBuykey = firebase.database().ref('activity/buy/').push().key;
          var activityBuyRef = firebase.database().ref('activity/buy/' + activityBuykey);
          activityBuyRef.update({
            key: activityBuykey,
            userid: $rootScope.userid,
            data: $scope.data,
            createAt: firebase.database.ServerValue.TIMESTAMP,
            status: 0
          })
          console.log($scope.data);
          $scope.done = true
        }

      }

      $scope.cancel = function () {
        $scope.modalProfile.hide();

      }
    })
  }
  $scope.pricepoint = function (point) {

    if (point < 100) {
      $scope.point.pricePoint = 10
    }
    if (point >= 100 && point <= 150) {
      $scope.point.pricePoint = 8
    }
    if (point > 150) {
      $scope.point.pricePoint = 6
    }
  }

  $scope.priceMonth = function (month) {
    if (month == 0) {
      $scope.vip.month = 1
    }
    if (month == 3) {
      $scope.vip.priceMonth = 500
    }
    if (month == 6) {
      $scope.vip.priceMonth = 400
    }
    if (month == 9) {
      $scope.vip.priceMonth = 350
    }
    if (month == 12) {
      $scope.vip.priceMonth = 300
    }
  }
});
