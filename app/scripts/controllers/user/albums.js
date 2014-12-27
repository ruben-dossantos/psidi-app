'use strict';

/**
 * @ngdoc function
 * @name iPhotoApp.controller:UserAlbumsCtrl
 * @description
 * # UserAlbumsCtrl
 * Controller of the iPhotoApp
 */
angular.module('iPhotoApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/user', {templateUrl: 'views/user/albums.html', controller: 'UserAlbumsCtrl' })
      .when('/user/:id/album', {redirectTo: '/user'})
  })
  .controller('UserAlbumsCtrl', function ($scope, $location, Album) {

    console.log('UserAlbumsCtrl');

    var search = $location.search();

    $scope.f = {
      get: function() {
        Album.query({'user': search.id}, function(data){
          $scope.albums = data;
          console.log($scope.albums);
        }, function(error){
          console.log('error getting albums');
        });
      }
    };

    $scope.f.get();

  });
