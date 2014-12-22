'use strict';

angular.module('iPhotoApp')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/lab_admin/users', {templateUrl: 'views/lab_admin/users.html', controller: 'LabAdminUsersCtrl' })
    })
    .controller('LabAdminUsersCtrl', function ($scope, $location, $modal, $cookieStore, User, Labprotshare) {

        $scope.spinner = true;

        $scope.user = Labprotshare.getUser();

        $scope.notification = $cookieStore.get('labprot-notification');

        $scope.show_info = false;

        if($scope.notification){
            $scope.show_info = true;
            $cookieStore.remove('labprot-notification');
        }

        $scope.is_clinic = $location.search()['clinic'];

        $scope.f = {
            stop: function(){
                $scope.spinner = false;
            },
            get: function(clinic){
                if(clinic){
                    $scope.users = User.query({"clinic":clinic}, function(data){

                        $scope.f.stop();
                    }, function(error){
                        $scope.f.stop();
                        $scope.show_error = true;
                        $scope.error = Labprotshare.getError();
                    });
                } else {
                    $scope.users = User.query(function (data) {
                        $scope.f.stop();
                    }, function (error) {
                        $scope.f.stop();
                        $scope.show_error = true;
                        $scope.error = Labprotshare.getError();
                    });
                }
            },
            delete_user: function(user){
                User.delete({id: user.username}, function(resource){
                    var oldUsers = $scope.users;
                    $scope.users = [];

                    angular.forEach(oldUsers, function(u){
                        if(u.id != user.id) $scope.users.push(u);
                    });
                    $scope.show_info = true;
                    $scope.notification = "Utilizador apagado com sucesso.";
                }, function(response){
                    $scope.show_error = true;
                    $scope.error = "É impossível apagar um utilizador que tenha contribuído para a aplicação.";
                });
            },
            open: function(object){
                var modal = $modal.open({
                    templateUrl: 'views/modals/delete.html',
                    controller: ModalDeleteUser,
                    size: 'sm',
                    resolve: {
                        object: function () {
                            return object;
                        }
                    }
                });

                modal.result.then(function (user) {
                    //on delete
                    $scope.delete_user(user);
                }, function () {
                    //on cancel
                });
            }
        };

        if($scope.is_clinic){
            $scope.title = "Pessoal da Clínica";
        } else {
            $scope.title = "Pessoal do Laboratório";
        }

        $scope.f.get($scope.is_clinic);
    });

var ModalDeleteUser = function ($scope, $modalInstance, object) {

    $scope.object = object;

    $scope.object.name = object.first_name + " " + object.last_name;

    $scope.delete = function () {
        $modalInstance.close($scope.object);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
