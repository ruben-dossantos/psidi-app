'use strict';

var constants = {
    //'serverAddress': '.../',
    'serverAddress': 'http://localhost\\:8000/api/',
    'resources': {
        'Laboratory': {
            'endpoint': 'laboratories'
        },
        'Clinic': {
            'endpoint': 'clinics'
        },
        'User': {
            'endpoint': 'users'
        },
        'Prescription': {
            'endpoint': 'prescriptions'
        },
        'PrescriptionLog': {
            'endpoint': 'prescription_logs'
        },
        'Product': {
            'endpoint': 'products'
        }
    }
};

var service = angular.module('iPhotoApp.services', ['ngResource']);

var resourceObjects = constants.resources;

for (var resource in resourceObjects) {
    if (resourceObjects.hasOwnProperty(resource)) {
        addResourceFactoryToService(service, resource, resourceObjects[resource].endpoint);
    }
}

function addResourceFactoryToService(service, resource, resourceEndPoint){
    service.factory(resource, function ($resource, $http, $cookieStore) {

        $http.defaults.headers.common['Authorization'] = 'Token ' + $cookieStore.get('djangotoken');

        return $resource(
                constants.serverAddress + resourceEndPoint + '/:id',
            // Creates a PUT method defined as 'update'
            {	id: '@id'},
            {
                update: {
                    method: 'PUT',
                    params: {id: '@id'}
                }
            }
        );
    });
}

