'use strict';

angular.module('iPhotoApp')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/clinic_prescriber/prescription/add', {templateUrl: 'views/clinic_prescriber/prescription_form.html', controller: 'ClinicPrescriberPrescriptionCtrl' })
    })
    .controller('ClinicPrescriberPrescriptionCtrl', function ($scope, $http, $cookieStore, $window, $location, Labprotshare, Product, Prescription, PrescriptionLog, Helpers) {
        $scope.spinner = true;

        $scope.user = Labprotshare.getUser();

        $scope.notification = $cookieStore.get('labprot-notification');

        $scope.show_info = false;

        if($scope.notification){
            $scope.show_info = true;
            $cookieStore.remove('labprot-notification');
        }

        $scope.product = {};
        $scope.product.quantity = 1;
        $scope.selected_products = [];

        $scope.teeth = {};
        $scope.colors = {};

        $scope.prescriber = $cookieStore.get("labprot-user").first_name + " " + $cookieStore.get("labprot-user").last_name;
        $scope.clinic = $cookieStore.get("labprot-user").clinic;
        $scope.prescription = {
            "prescription_date": new Date().toISOString(),
            "prescriber": $cookieStore.get("labprot-user").id
        };

        $("#prescription_patient_name").focus();

        $scope.objective_phases = [
            {
                "id": 1,
                "name": "Prova 1"
            },
            {
                "id": 2,
                "name": "Prova Biscuit"
            },
            {
                "id": 3,
                "name": "Prova de Estrutura"
            },
            {
                "id": 4,
                "name": "Pronto"
            }
        ];

        $scope.patient_info = true;
        $scope.btn_state = "Seguinte";

        $scope.f = {
            stop: function () {
                $scope.spinner = false;
            },
            get: function () {

                $scope.products = Product.query(function (data) {
                    $scope.f.stop();
                }, function (error) {
                    $scope.f.stop();
                    $scope.show_error = true;
                    $scope.error = Labprotshare.getError();
                });
            },
            reset_prescription_fields: function(index){
                $scope["prescription_" + index] = false;
            },
            validate_prescription_fields: function(index){
                if(!$scope.prescription[index]){
                    $scope.valid = false;
                    $scope["prescription_" + index] = true;
                }
            },
            reset_product_fields: function(index){
                $scope["product_" + index] = false;
            },
            validate_product_fields: function(index){
                if(!$scope.product[index]){
                    $scope.valid = false;
                    $scope["product_" + index] = true;
                }
            },
            evaluate: function(index){
                $scope.valid = true;

                var fields = ["patient_name"];

                angular.forEach(fields, $scope.f.reset_prescription_fields);
                angular.forEach(fields, $scope.f.validate_prescription_fields);
            },
            next: function(value){
                $scope.valid = true;

                var fields = ["patient_name", "delivery_date", "objective_phase"];


                angular.forEach(fields, $scope.f.reset_prescription_fields);
                angular.forEach(fields, $scope.f.validate_prescription_fields);

                if($scope.valid){
                    if($scope.prescription.delivery_date < new Date().toISOString()){
                        $scope.prescription_delivery_date_valid = true;
                    } else {
                        $scope.prescription_delivery_date_valid = false;
                        $scope.patient_info = value;
                        switch(value){
                            case false: $scope.btn_state = "Anterior";
                                break;
                            case true: $scope.btn_state = "Seguinte";
                                break;
                        }
                        $scope.last_page = !value;
                    }
                }
            },
            go_back: function(){
                $window.onbeforeunload = null;
                $location.path('/');
            },
            add_product: function(){
                $scope.valid = true;

                var fields = ["id", "quantity"];


                angular.forEach(fields, $scope.f.reset_product_fields);
                angular.forEach(fields, $scope.f.validate_product_fields);

                if($scope.valid){
                    angular.forEach($scope.products, function(product){
                        if(product.id == $scope.product.id){
                            $scope.product.code = product.code;
                            $scope.product.name = product.name;
                        }
                    });
                    $scope.selected_products.push($scope.product);
                    $scope.product = {};
                    $scope.product.quantity = 1;

                    $("html, body").animate({ scrollTop: $(document).height() });

                }
            },
            delete_product: function(product){
                var oldProducts = $scope.selected_products ;
                $scope.selected_products  = [];
                angular.forEach(oldProducts, function(old_product){
                    if(old_product != product) $scope.selected_products .push(old_product);
                });
            },
            submit: function(){
                $scope.prescription.arch = {};
                $scope.prescription.arch.arch_teeth = JSON.stringify($scope.teeth);
                $scope.prescription.arch.arch_colors= JSON.stringify($scope.colors);

                $scope.prescription.phase = "PI";

                Prescription.save($scope.prescription, function(prescription){
                    angular.forEach($scope.selected_products , function(product){
                        product.prescription = prescription.id;
                        product.product = product.id;
                        product.id = undefined;
                        product.arch_json = JSON.stringify($scope.prescription.arch);
                        $http.post(Labprotshare.getUrl_Prefix() + "/api/prescription_products", product).success(function(data){

                        });
                    });
                    $scope.log = {};
                    $scope.log.date = new Date().toISOString();
                    $scope.log.user = $cookieStore.get("labprot-user").id;
                    $scope.log.phase = $scope.prescription.phase;
                    $scope.log.objective_phase = $scope.prescription.objective_phase;
                    $scope.log.prescription = prescription.id;
                    $scope.log.comment = "Prescrição criada";
                    PrescriptionLog.save($scope.log, function(log){

                    });
                    $location.path("/");
                });
                $window.onbeforeunload = null;
            }
        };

        $scope.$watch('prescription_form.$dirty', function(value) {
            if(value) {
                $window.onbeforeunload = function(){
                    return 'Tem a certeza que pretende voltar a página anterior? Vai perder a informação que não foi gravada.';
                };
            }
        });

        $scope.superior_small = [18, 17, 16, 15, 14, 13];
        $scope.superior_middle = [12, 11, 21, 22, 23, 24];
        $scope.superior_big = [25, 26, 27, 28];

        $scope.inferior_small = [48, 47, 46, 45, 44, 43];
        $scope.inferior_middle = [42, 41, 31, 32, 33, 34];
        $scope.inferior_big = [35, 36, 37, 38];


        $scope.$watchCollection('prescription.delivery_date_pretty', function(newVal, oldVal){
            if(newVal){
                var d = new Date($scope.prescription.delivery_date_pretty);
                $scope.prescription.delivery_date = d.toISOString();
                var year = d.getFullYear();
                var month = add_zero(d.getMonth() + 1);
                var day = add_zero(d.getDate());
                $scope.prescription.delivery_date_pretty = date_string(year, month, day);
                $scope["prescription_delivery_date"] = false;
                $scope.prescription_delivery_date_valid = $scope.prescription.delivery_date < new Date().toISOString();
            }
        });

        $scope.$watch('prescription.objective_phase', function(newVal, oldVal){
            if(newVal!=oldVal){
                $scope["prescription_objective_phase"] = false;
            }
        });

        $scope.chosen_product = {};

        $scope.$watch('product.id', function(newVal, oldVal){
            if(newVal!=oldVal){
                angular.forEach($scope.products, function(product){
                    if(product.id == $scope.product.id) {
//                    $scope.chosen_product = p;

                        $scope.product.lower = product.lower;
                        $scope.product.upper = product.upper;
                        $scope.product.bite = product.bite;
                        $scope.product.color = product.color;
                        $scope.productx = {};
                        $scope.productx.lower = product.lower;
                        $scope.productx.upper = product.upper;
                        $scope.productx.bite = product.bite;
                        $scope.productx.color = product.color;
                    }
                });
            }
        });

        $scope.f.get();
    });
