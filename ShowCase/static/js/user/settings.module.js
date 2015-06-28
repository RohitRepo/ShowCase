angular.module("UserSettingsApp", [
    'infinite-scroll',
    "lr.upload",
    'ngAnimate',
    "module.auth",
    "module.curtainRight",
    "module.curtainLeft",
    "module.topbar",
    "module.model",
    'module.titlecase',
    'module.scrollTo',
    'module.alert'])
.config(['$httpProvider', '$interpolateProvider', function ($httpProvider, $interpolateProvider) {
    "use strict";

    // Changing angular template tag to prevent conflict with django
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]')

    //Http Intercpetor to check auth failures for xhr requests
    $httpProvider.interceptors.push('authHttpResponseInterceptor');

    // csrf for django
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';

}]).factory('authHttpResponseInterceptor', ['$q', '$window', function ($q, $window) {
    'use strict';
    return {
        responseError: function (response) {
            if (response.status === 403) {
                $window.location.href = "/login#?next=" + $window.location.pathname;
            }
            return $q.reject(response);
        }
    };
}]).run(['auth', '$window', function (auth, $window) {
    auth.getCurrentUser().then(function () {}, function () {
        $window.location.href = "/login#?next=" + $window.location.pathname;
    });
}]);