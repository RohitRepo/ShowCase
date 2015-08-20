angular.module("module.model")
.factory('bucketModel', ['$http', '$log', '$q', function ($http, $log, $q) {
    "use strict";

    var service = {};

    service.artBuckets = function (compositionId) {
        return $http.get('/compositions/' + compositionId + '/buckets').then(function (response) {
            return response.data;
        }, function (error) {
            return $q.reject(error);
        });
    };

    service.userBuckets = function (userId) {
        return $http.get('/users/' + userId + '/buckets').then(function (response) {
            return response.data;
        }, function (error) {
            return $q.reject(error);
        });
    };

    service.addToBucket = function (bucketId, compositionId) {
        return $http.put('/buckets/' + bucketId, {'composition_id': compositionId}).then(function (response) {
            return response.data;
        }, function (error) {
            return $q.reject(error);
        });
    };

    service.create = function (bucket) {
        return $http.post('/buckets', bucket).then(function (response) {
            return response.data;
        }, function (error) {
            return $q.reject(error);
        });
    };

    service.bucketArts = function (bucketId) {
        return $http.get('/buckets/' + bucketId).then(function (response) {
            return response.data;
        }, function (error) {
            return $q.reject(error);
        });
    };

    service.updateBackground = function (bucket_id, bucket_background) {
        return $http.post('/buckets/' + bucket_id + '/background', bucket_background).then(function (response) {
            return response.data;
        }, function (error) {
            return $q.reject(error);
        });
    };

    return service;
}]);