'use strict';

angular.module('iPhotoApp')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/clinic_rec', {templateUrl: 'views/clinic_rec/prescriptions.html', controller: 'ClinicRecPrescriptionCtrl' })
            .when('/clinic_rec/prescriptions', {redirectTo: '/clinic_rec'})
    })
    .controller('ClinicRecPrescriptionCtrl', function ($scope, $modal, $cookieStore, $location, Labprotshare, Prescription, PrescriptionLog) {

        $scope.spinner = true;

        $scope.user = Labprotshare.getUser();

        $scope.notification = $cookieStore.get('labprot-notification');

        $scope.show_info = false;

        if($scope.notification){
            $scope.show_info = true;
            $cookieStore.remove('labprot-notification');
        }

        $scope.f = {
            stop: function(){
                $scope.spinner = false;
            },
            get: function(){
                $scope.out_prescriptions = Prescription.query({'phase':'PI'}, function(data){
                    $scope.f.stop();
                }, function(error){
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = "Erro inesperado no servidor, tente novamente e contacte o administrador do sistema.";
                });

                $scope.in_prescriptions = Prescription.query({'phase':'LE'}, function(data){
                    $scope.f.stop();
                }, function(error){
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = "Erro inesperado no servidor, tente novamente e contacte o administrador do sistema.";
                });

            },
            arrived: function(object){
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
                    prescription.phase = 'CR';
                    prescription.prescriber = prescription.prescriber.id;
                    var old_prescriptions = $scope.in_prescriptions;
                    $scope.in_prescriptions = [];
                    angular.forEach(old_prescriptions, function(p){
                        if(p.id != prescription.id) $scope.in_prescriptions.push(p);
                    });
                    PrescriptionLog.save(prescription.log, function(log){
                        $scope.show_info = true;
                        $scope.notification = "Prescrição recebida com sucesso.";
                    }, function(error){
                        $scope.show_error = true;
                        $scope.error = "Ocurreu um erro ao alterar o estado da prescrição.";
                        $scope.in_prescriptions.push(prescription);
                    });
                    Prescription.update({id: prescription.id}, prescription, function(resource){
                    });
                }, function () {
                    //on cancel
                });
            },
            delivered : function(object){
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
                    prescription.phase = 'CE';
                    prescription.prescriber = prescription.prescriber.id;
                    var old_prescriptions = $scope.out_prescriptions;
                    $scope.out_prescriptions = [];
                    angular.forEach(old_prescriptions, function(p){
                        if(p.id != prescription.id) $scope.out_prescriptions.push(p);
                    });
                    PrescriptionLog.save(prescription.log, function(log){

                    });
                    prescription.log = undefined;
                    Prescription.update({id: prescription.id}, prescription, function(resource){
                        $scope.show_info = true;
                        $scope.notification = "Prescrição entregue com sucesso.";
                    }, function(error){
                        $scope.show_error = true;
                        $scope.error = "Ocurreu um erro ao alterar o estado da prescrição.";
                        $scope.out_prescriptions.push(prescription);
                    });
                }, function () {
                    //on cancel
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



