angular.module('ExploreApp')
.controller('exploreController', ['$scope',
    '$rootScope',
    '$document',
    'compositionModel',
    '$timeout',
    'userModel',
    'alert',
    'progress',
    'auth',
    'bookService',
    'bucketmodalService',
    'usermodalService',
	function ($scope, $rootScope, $document, compositionModel, $timeout, userModel, alert, progress, auth, bookService, bucketmodalService, usermodalService) {

    $scope.math = window.Math
	$scope.arts = [];
	$scope.artsMeta = {pageVal: 1, disableGetMore: false, busy: false, next:'', previous:''};

    // Disable scroll on parent page
    $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
        var body = $document.find('body');
        if (fromState.name == 'arts') {
            body.addClass('modal-open');
        } else if (toState.name == 'arts') {
            body.removeClass('modal-open');
        }
    })

	var getArts = function () {

	    if (!$scope.artsMeta.disableGetMore) {
            progress.showProgress();

	        var pageVal = $scope.artsMeta.pageVal;
	        compositionModel.getExplores(pageVal).then(function (response) {
	            $scope.artsMeta.next = response.next;
	            $scope.artsMeta.previous = response.previous;

	            for (var i = 0; i < response.results.length; i++) {
	                $scope.arts.push(response.results[i]);
	            }

	            if (response.next == null){
	                $scope.artsMeta.disableGetMore = true;
	            }

	            $timeout(function () {
    			    $scope.artsMeta.pageVal += 1;
    	            $scope.artsMeta.busy = false;
	            }, 500);

                progress.hideProgress();

	        });
	    }

	};

	$scope.loadMoreArts = function () {
	    if ($scope.artsMeta.busy) {
	        return;
	    }

	    $scope.artsMeta.busy = true;
	    getArts();
	}

	$scope.loadMoreArts();

    $scope.handleBookMark = function (index) {
        art = $scope.arts[index]
        if (art.is_bookmarked) {
            bookService.unmark(art).then(function () {
            	art.is_bookmarked = false;
            });
        } else {
            bookService.bookmark(art).then(function () {
            	art.is_bookmarked = true;
            });;
        }
    };

    $scope.showBookMarkers = function (index) {
        var art = $scope.arts[index];

        usermodalService.showBookMarkers(art).then(function (bookStatus) {
        	if (bookStatus == 'bookmarked') {
        		art.is_bookmarked = true;
        	}
        });
    };

    $scope.showArtBuckets = function (index) {
        var art = $scope.arts[index];
        bucketmodalService.showArtBuckets(art);
    }

    $scope.showAddToBucket = function (index) {
        var art = $scope.arts[index];
        bucketmodalService.showAddToBucket(art);
    };

}]);