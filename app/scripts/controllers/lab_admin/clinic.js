'use strict';

angular.module('iPhotoApp')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/lab_admin/clinic/add', {templateUrl: 'views/admin/clinic_form.html', controller: 'LabAdminClinicCtrl' })
    })
    .controller('LabAdminClinicCtrl', function ($scope, $location, $http, $cookieStore, Clinic, Labprotshare) {

        $scope.user = Labprotshare.getUser();

        $scope.clinic = {};

        $scope.submit_once = false;

        $("#clinic_name").focus();

        if($location.search()['clinic']){
            $http.get(Labprotshare.getUrl_Prefix() + "/api/clinics/"+$location.search()['clinic']).success(function(data){
                $scope.clinic = data;
            });
        }

        $scope.f = {
            stop: function() {
                $scope.spinner = false;
            },
            go_back : function(){
                $location.path("/lab_admin");
            },
            reset : function(index){
                $scope["clinic_" + index] = false;
            },
            validate : function(index) {
                if(!$scope.clinic[index]){
                    $scope.valid = false;
                    $scope["clinic_" + index] = true;
                }
            },
            evaluate: function(){
                if($scope.submited){
                    $scope.valid = true;
                    var fields = ["name", "address", "zipcode1", "zipcode2", "city"];

                    angular.forEach(fields, $scope.f.reset);
                    angular.forEach(fields, $scope.f.validate);
                }
            },
            submit : function(){
                $scope.submited = true;

                $scope.valid = true;
                var fields = ["name", "address", "zipcode1", "zipcode2", "city"];

                angular.forEach(fields, $scope.f.reset);
                angular.forEach(fields, $scope.f.validate);

                if($scope.valid){
                    if($location.search()['clinic']){
                        if(!$scope.submit_once) {
                            Clinic.update({id: $scope.clinic.id}, $scope.clinic, function (resource) {
                                var notification = "Clínica " + resource.name + " actualizada com successo.";
                                $cookieStore.put('labprot-notification', notification);
                                $location.path("/lab_admin");
                            });
                            $scope.submit_once = true;
                        }
                    } else {
                        if(!$scope.submit_once) {
                            $scope.clinic.laboratory = $cookieStore.get('labprot-user').laboratory.id;
                            Clinic.save($scope.clinic, function (resource) {
                                var notification = "Clínica " + resource.name + " criada com successo.";
                                $cookieStore.put('labprot-notification', notification);
                                $location.path("/lab_admin");
                            }, function (error) {
                                //TODO: errors
                                $scope.show_error = true;
                                $scope.error = error;
                            });
                            $scope.submit_once = true;
                        }
                    }
                }
            }
        };

    });
