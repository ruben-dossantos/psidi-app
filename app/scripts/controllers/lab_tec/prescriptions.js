'use strict';

angular.module('iPhotoApp')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/lab_tec', {templateUrl: 'views/lab_tec/prescriptions.html', controller: 'LabTecPrescriptionsCtrl' })
            .when('/lab_tec/prescriptions', {redirectTo: '/lab_tec'})
    })
    .controller('LabTecPrescriptionsCtrl', function ($scope, $modal, $cookieStore, $location, Labprotshare, Prescription, PrescriptionLog) {
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
                $scope.prescriptions = Prescription.query({'phase':'LT'}, function(data){
                    $scope.f.stop();
                }, function(error){
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = Labprotshare.getError();
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
                    prescription.phase = 'LC';

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
                        $scope.notification = "Prescrição completa com sucesso.";
                    }, function(error){
                        $scope.show_error = true;
                        $scope.error = "Ocurreu um erro ao alterar o estado da prescrição.";
                        $scope.prescriptions.push(prescription);
                    });
                }, function () {
                    //on cancel
                });
            },
            edit_prescription: function(object){
                var modal = $modal.open({
                    templateUrl: 'views/modals/external_code.html',
                    controller: ModalEditPrescriptionLabTec,
                    size: 'sm',
                    resolve: {
                        object: function () {
                            return object;
                        }
                    }
                });

                modal.result.then(function (prescription) {
                    //on ok
                    prescription.external_code = prescription.temp_external_code;
                    var temp_prescriber = prescription.prescriber;
                    prescription.prescriber = prescription.prescriber.id;
                    Prescription.update({id: prescription.id}, prescription, function(resource){
                        prescription.prescriber = temp_prescriber;
                        $scope.show_info = true;
                        $scope.notification = "Nº de obra da prescrição alterado com sucesso.";
                    }, function(error) {
                        $scope.show_error = true;
                        $scope.error = "Ocurreu um erro ao alterar o nº de obra da prescrição.";
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


var ModalEditPrescriptionLabTec = function ($cookieStore, $scope, $modalInstance, PrescriptionLog, object) {

    $scope.object = object;

    $scope.ok = function () {
        $modalInstance.close($scope.object);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};


