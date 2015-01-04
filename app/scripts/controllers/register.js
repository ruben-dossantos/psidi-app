'use strict';

angular.module('iPhotoApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/signup', { templateUrl: 'views/register.html', controller: 'RegisterCtrl' })
  })
  .controller('RegisterCtrl', function ($scope, $http, Iphotoshare) {

    $scope.user_data = {};

    console.log('RegisterCtrl');

    console.log(Iphotoshare.getUrl_Prefix());

    $scope.f = {
      submit: function(){
        $http.post(Iphotoshare.getUrl_Prefix() + '/signup', $scope.user_data
          //,{
          //  transformRequest: angular.identity,
          //  headers: {
          //    'Content-Type' : 'application/json',
          //    'Access-Control-Allow-Origin': '*'
          //  }
          //}
        )
          .success(function(data){
            console.log("user created", data);
          })
          .error(function(error){
            console.log("error creating user", error);

          });
      }
    }
  });
