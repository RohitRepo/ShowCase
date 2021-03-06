angular.module('module.bookmark', ['module.model', 'module.util'])
.factory('bookService', ['$q', 'auth', 'bookmarkModel', 'progress', 'alert', function ($q, auth, bookmarkModel, progress, alert) {
	var service = {};

	var bookmark = function (object_id, content_type) {
		return auth.runWithAuth(function () {
			progress.showProgress();
			return bookmarkModel.bookmark(object_id, content_type).then(function (response) {
				progress.hideProgress();
				return $q.when();
			}, function () {
				progress.hideProgress();
				alert.showAlert('Unable to complete your request');
				return $q.reject();
			});
		});
	};

    service.bookmarkArt = function (art) {
        return bookmark(art.id, bookmarkModel.TypeArt);
    };

    service.bookmarkBucket = function (bucket) {
        return bookmark(bucket.id, bookmarkModel.TypeBucket);
    };

    service.bookmarkInterpret = function (interpret) {
        return bookmark(interpret.id, bookmarkModel.TypeInterpret);
    };

	var unmark = function (object_id, content_type) {
		return auth.runWithAuth(function () {
			progress.showProgress();
			return bookmarkModel.unmark(object_id, content_type).then(function (response) {
				progress.hideProgress();
				return $q.when();
			}, function () {
				progress.hideProgress();
				alert.showAlert('Unable to complete your request');
				return $q.reject();
			});
		});
	};

    service.unmarkArt = function (art) {
        return unmark(art.id, bookmarkModel.TypeArt);
    };

    service.unmarkBucket = function (bucket) {
        return unmark(bucket.id, bookmarkModel.TypeBucket);
    };

    service.unmarkInterpret = function (interpret) {
        return unmark(interpret.id, bookmarkModel.TypeInterpret);
    };

	return service;
}]);