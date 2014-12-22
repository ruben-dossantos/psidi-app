'use strict';

angular.module('iPhotoApp')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/clinic_prescriber', {templateUrl: 'views/clinic_prescriber/prescriptions.html', controller: 'ClinicPrescriberPrescriptionsCtrl' })
            .when('/clinic_prescriber/prescriptions', {redirectTo: '/clinic_prescriber'})
    })
    .controller('ClinicPrescriberPrescriptionsCtrl', function ($scope, $location, $http, $modal, $cookieStore, Prescription, PrescriptionLog, Labprotshare) {
        $scope.spinner = true;

        $scope.user = Labprotshare.getUser();

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
                $scope.prescriptions = [];
                Prescription.query(function(data){
                    $scope.f.stop();
                    angular.forEach(data, function(p){
                        if(p.phase!='PC')
                            $scope.prescriptions.push(p);
                    });
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
            },
            edit_prescription: function(object){
                var modal = $modal.open({
                    templateUrl: 'views/modals/objective_phase.html',
                    controller: ModalUpdatePhase,
                    size: 'sm',
                    resolve: {
                        object: function () {
                            return object;
                        }
                    }
                });

                modal.result.then(function (prescription) {
                    //on ok
                    prescription.phase = "PI";

                    PrescriptionLog.save(prescription.log, function(log){

                    });

                    var temp_prescriber = prescription.prescriber;
                    prescription.prescriber = prescription.prescriber.id;
                    Prescription.update({id: prescription.id}, prescription, function(resource){
                        prescription.prescriber = temp_prescriber;
                        $scope.show_info = true;
                        $scope.notification = "Prescrição actualizada com sucesso.";
                    }, function(error){
                        $scope.show_error = true;
                        $scope.error = "Ocurreu um erro ao alterar o estado da prescrição.";
                        $scope.prescriptions.push(prescription);
                    });

                }, function () {
                    //on cancel
                });
            },
            complete: function(object){
                var modal = $modal.open({
                    templateUrl: 'views/modals/confirm.html',
                    controller: ModalSendPrescription,
                    size: 'sm',
                    resolve: {
                        object: function () {
                            return object;
                        }
                    }
                });

                modal.result.then(function (prescription) {
                    //on ok
                    prescription.phase = 'PC';

                    var old_prescriptions = $scope.prescriptions;
                    $scope.prescriptions = [];
                    angular.forEach(old_prescriptions, function(p){
                        if(p.id != prescription.id) $scope.prescriptions.push(p);
                    });

                    PrescriptionLog.save(prescription.log, function(log){
                    });

                    prescription.prescriber = prescription.prescriber.id;
                    Prescription.update({id: prescription.id}, prescription, function(resource){
                        $scope.show_info = true;
                        $scope.notification = "Prescrição finalizada com sucesso.";
                    }, function(error){
                        $scope.show_error = true;
                        $scope.error = "Ocurreu um erro ao alterar o estado da prescrição.";
                        $scope.prescriptions.push(prescription);
                    });
                }, function () {
                    //on cancel
                });
            }
        };

        $scope.f.get();
    });
