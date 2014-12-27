'use strict';

/**
 * @ngdoc function
 * @name iPhotoApp.controller:UserPrintAlbumCtrl
 * @description
 * # UserPrintAlbumCtrl
 * Controller of the iPhotoApp
 */
angular.module('iPhotoApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/user/:id/print_album/create', {templateUrl: 'views/user/print_album_form.html', controller: 'UserPrintAlbumCtrl' })
  })
  .controller('UserPrintAlbumCtrl', function ($scope) {
    $scope.print_albums = [
      {
        "id": 1,
        "theme": "Férias",
        "title": "Melhores das férias",
        "message": "I will get a Triforce, like I said",
        "photos": [
          {
            "id": 1,
            "albumId": 1,
            "photo": "photos/41kjb2h4bkb.jpg",
            "date": 1418066023321
          },
          {
            "id": 2,
            "albumId": 1,
            "photo": "photos/d89sad798sd.jpg",
            "date": 1418066023321
          }
        ]
      },
      {
        "title": "cenas"
      }
    ];
  });
