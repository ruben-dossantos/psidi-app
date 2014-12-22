'use strict';

angular.module('iPhotoApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/login', { templateUrl: 'views/login.html', controller: 'LoginCtrl' })
  })
  .controller('LoginCtrl', function ($scope, $http, $location, $cookieStore, Labprotshare) {

    $scope.user_type = Labprotshare.getUserTypeMap();

    $scope.f = {
      login: function () {
        $http.post(Labprotshare.getUrl_Prefix() + '/api-token-auth/', $scope.user_data)
          .success($scope.f.login_success)
          .error($scope.f.login_error);
      },

      login_success: function(response) {
        $cookieStore.put('djangotoken', response.token);
        $http.defaults.headers.common['Authorization'] = 'Token ' + response.token;

        $http.get(Labprotshare.getUrl_Prefix() + '/api/users/' + $scope.user_data.username)
          .success(function(data, status){
            $cookieStore.put('labprot-user', data);
            try{
              $location.path('/' + $scope.user_type[data.user_type]);
            }   catch(error) {
              $location.path('/');
            }
          })
          .error(function(data, status){
            $cookieStore.remove('djangotoken');
            console.log('error getting things')
          });
      },

      login_error: function(r){
        var notifications = { 'error': r.non_field_errors[0]};
        $cookieStore.put('labprot-notifications', notifications);
        $location.path('/login');
        $scope.user_data = {};
      },

      register: function() {
        $location.path('/signup');
      }
    };

  });
