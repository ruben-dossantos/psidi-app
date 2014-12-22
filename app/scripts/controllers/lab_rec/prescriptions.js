'use strict';

angular.module('iPhotoApp')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/lab_rec', {templateUrl: 'views/lab_rec/prescriptions.html', controller: 'LabRecPrescriptionsCtrl' })
            .when('/lab_rec/prescriptions', {redirectTo: '/lab_rec'})
    })
    .controller('LabRecPrescriptionsCtrl', function ($scope, $cookieStore, $modal, $location, PrescriptionLog, Prescription, Labprotshare, Clinic, User) {

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
                $scope.in_prescriptions = Prescription.query({'phase':'CE'}, function(data){
                    $scope.f.stop();
                }, function(error){
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = Labprotshare.getError();
                });

                $scope.active_prescriptions = Prescription.query({'phase':'LT'}, function(data){
                    $scope.f.stop();
                }, function(error){
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = Labprotshare.getError();
                });

                $scope.out_prescriptions = Prescription.query({'phase':'LC'}, function(data){
                    $scope.f.stop();
                }, function(error){
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = Labprotshare.getError();
                });

                $scope.clinics = Clinic.query(function(data){
                    $scope.f.stop();
                }, function(error){
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = Labprotshare.getError();
                });

                $scope.users = User.query({user_type:"P"}, function(data){
                    $scope.f.stop();
                }, function(error){
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = Labprotshare.getError();
                });

            },
            history: function() {
                $scope.spinner = true;
                $scope.old_prescriptions = Prescription.query({'phase':'PC'}, function(data){
                    $scope.f.stop();
                }, function(error){
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = Labprotshare.getError();
                });
            },
            pending: function(){
                $scope.spinner = true;
                $scope.pending_prescriptions = Prescription.query(function(data){
                    $scope.f.stop();
                }, function(error){
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = Labprotshare.getError();
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
                    prescription.phase = 'LT';
                    var temp_prescriber = prescription.prescriber;
                    var old_prescriptions = $scope.in_prescriptions;
                    $scope.in_prescriptions = [];
                    angular.forEach(old_prescriptions, function(p){
                        if(p.id != prescription.id) {
                            $scope.in_prescriptions.push(p);
                        } else {
                            $scope.active_prescriptions.push(p);
                        }
                    });

                    PrescriptionLog.save(prescription.log, function(log){
                    });

                    prescription.prescriber = prescription.prescriber.id;
                    Prescription.update({id: prescription.id}, prescription, function(resource){
                        prescription.prescriber = temp_prescriber;
                        $scope.show_info = true;
                        $scope.notification = "Prescrição recebida com sucesso.";
                    }, function(error){
                        old_prescriptions = $scope.active_prescriptions;
                        $scope.active_prescriptions = [];
                        angular.forEach($scope.active_prescriptions, function(p){
                            if(p.id != prescription.id) {
                                $scope.active_prescriptions.push(p);
                            } else {
                                $scope.in_prescriptions.push(p);
                            }
                        });
                        $scope.show_error = true;
                        $scope.error = "Ocurreu um erro ao alterar o estado da prescrição.";
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
                    prescription.phase = 'LE';

                    var state = false;

                    var old_prescriptions = $scope.out_prescriptions;
                    $scope.out_prescriptions = [];
                    angular.forEach(old_prescriptions, function(p){
                        if(p.id != prescription.id) $scope.out_prescriptions.push(p);
                    });

                    var old_active_prescriptions = $scope.active_prescriptions;
                    $scope.active_prescriptions = [];
                    angular.forEach(old_active_prescriptions , function(p){
                        if(p.id != prescription.id) {
                            $scope.active_prescriptions.push(p);
                        } else {
                            state = true;
                        }
                    });

                    PrescriptionLog.save(prescription.log, function(log){
                    });

                    prescription.prescriber = prescription.prescriber.id;
                    Prescription.update({id: prescription.id}, prescription, function(resource){
                        $scope.show_info = true;
                        $scope.notification = "Prescrição entregue com sucesso.";
                    }, function(error){
                        $scope.show_error = true;
                        $scope.error = "Ocurreu um erro ao alterar o estado da prescrição.";
                        state ? $scope.out_prescriptions.push(prescription) : $scope.active_prescriptions.push(prescription);
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
            },
            edit_prescription: function(object){
                var modal = $modal.open({
                    templateUrl: 'views/modals/external_code.html',
                    controller: ModalConfirmObject,
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
            clinic: function(object){
                var modal = $modal.open({
                    templateUrl: 'views/modals/clinic.html',
                    controller: ModalConfirmObject,
                    size: 'sm',
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


        $scope.$watch('search.clinic', function(newVal, oldVal){
            if(newVal!=oldVal){
                $scope.search.prescriber = undefined;
            }
        });

        $scope.$watch('search.clinic2', function(newVal, oldVal){
            if(newVal!=oldVal){
                $scope.search.prescriber2 = undefined;
            }
        });

        $scope.$watch('search.clinic3', function(newVal, oldVal){
            if(newVal!=oldVal){
                $scope.search.prescriber3 = undefined;
            }
        });

        $scope.$watch('search.clinic4', function(newVal, oldVal){
            if(newVal!=oldVal){
                $scope.search.prescriber4 = undefined;
            }
        });

        $scope.$watch('search.clinic5', function(newVal, oldVal){
            if(newVal!=oldVal){
                $scope.search.prescriber5 = undefined;
            }
        });

        $scope.f.get();
    });
