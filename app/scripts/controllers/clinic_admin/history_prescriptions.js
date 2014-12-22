'use strict';

angular.module('iPhotoApp')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/clinic_admin/prescriptions/old', {templateUrl: 'views/clinic_admin/prescriptions.html', controller: 'ClinicAdminHistoryPrescriptionsCtrl' })
    })
    .controller('ClinicAdminHistoryPrescriptionsCtrl', function ($scope, $modal, $cookieStore, $location, Labprotshare, Prescription) {

        $scope.spinner = true;

        $scope.user = Labprotshare.getUser();

        $scope.old = true;

        $scope.notification = $cookieStore.get('labprot-notification');

        $scope.show_info = false;

        if($scope.notification){
            $scope.show_info = true;
            $cookieStore.remove('labprot-notification');
        }

        $scope.search = {};

        $scope.f = {
            stop: function(){
                $scope.spinner = false;
            },
            get: function(){
                $scope.prescriptions =  Prescription.query({'phase':'PC'}, function(data){
                    $scope.f.stop();
                }, function(error){
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = Labprotshare.getError();
                });

            },
            expand: function(size, object){
                var modal = $modal.open({
                    templateUrl: 'views/modals/expand.html',
                    controller: ModalExpandPrescription,
                    windowClass: 'big-modal',
                    resolve: {
                        object: function () {
                            return object;
                        }
                    }
                });

                modal.result.then(function (id) {
                    //on ok
                }, function () {
                    //on cancel
                });
            },
            logs: function(size, object) {
                var modal = $modal.open({
                    templateUrl: 'views/modals/logs.html',
                    controller: ModalLogs,
                    windowClass: 'big-modal',
                    resolve: {
                        object: function () {
                            return object;
                        }
                    }
                });

                modal.result.then(function (id) {
                    //on ok

                }, function () {
                    //on cancel
                });
            }
        };

        $scope.f.get();
    });
