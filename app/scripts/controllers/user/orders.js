'use strict';

/**
 * @ngdoc function
 * @name iPhotoApp.controller:UserOrdersCtrl
 * @description
 * # UserOrdersCtrl
 * Controller of the iPhotoApp
 */
angular.module('iPhotoApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/orders', {templateUrl: 'views/user/orders.html', controller: 'UserOrdersCtrl' })
      .when('/user/:id/order', {redirectTo: '/orders'})
  })
  .controller('UserOrdersCtrl', function ($scope, $location, Order) {

    console.log('UserAlbumsCtrl');

    var search = $location.search();

    $scope.f = {
      get: function() {
        Order.query({'user': search.id}, function(data){
          $scope.orders = data;
          console.log($scope.orders);
        }, function(error){
          console.log('error getting orders');
        });
      }
    };

    $scope.f.get();
  });
