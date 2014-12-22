'use strict';

angular.module('iPhotoApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/signup', { templateUrl: 'views/register.html', controller: 'RegisterCtrl' })
  })
  .controller('RegisterCtrl', function ($scope) {
    console.log('RegisterCtrl');
  });
