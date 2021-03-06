angular.module('UserApp')
.controller('profilePaintingsController', ['$scope',
    '$state',
    'userModel',
    'bookmarkModel',
    'bookService',
    'admireService',
    'progress',
    'alert',
    'usermodalService',
    'bucketmodalService',
    'shareModalService',
    function ($scope,
        $state,
        userModel,
        bookmarkModel,
        bookService,
        admireService,
        progress,
        alert,
        usermodalService,
        bucketmodalService,
        shareModalService) {
    $scope.arts = [];
    $scope.math = window.Math;
    $scope.artsMeta = {pageVal: 1, disableGetMore: false, busy: false, next:'', previous:'', noWorks: false};

    var mq = window.matchMedia( "(max-width: 800px)" );
    if (mq.matches) {
        $scope.onMobile = true;
    }
    else {
        $scope.onMobile = false;
    }

    var artFetcher = function () {
        var listType = $state.current.data.listType

        if (listType == 'paintings'){
            return userModel.getCompositions;
        } else if (listType == 'uploads') {
            return userModel.getUploads;
        } else if (listType == 'bookmarks') {
            return bookmarkModel.getBookMarks
        }
    }();

    var getCompositions = function () {

        if (!$scope.artsMeta.disableGetMore) {
            var pageVal = $scope.artsMeta.pageVal;
            progress.showProgress();
            artFetcher($scope.artist.id, pageVal).then(function (response) {
                $scope.artsMeta.next = response.next;
                $scope.artsMeta.previous = response.previous;

                for (var i = 0; i < response.results.length; i++) {
                    $scope.arts.push(response.results[i]);
                }

                if (response.next == null){
                    $scope.artsMeta.disableGetMore = true;
                }

                if ($scope.arts.length == 0){
                    $scope.artsMeta.noWorks = true;
                }

                progress.hideProgress();
                $scope.artsMeta.busy = false;
            }, function () {
                alert.showAlert('We are facing some problems fetching data');
                progress.hideProgress();
            });
        }

        $scope.artsMeta.pageVal += 1;
    };

    $scope.loadMoreCompositions = function () {
        if ($scope.artsMeta.busy) {
            return;
        }

        $scope.artsMeta.busy = true;
        getCompositions();
    }

    $scope.handleBookMark = function (event, index) {
        event.stopPropagation();

        var art = $scope.arts[index];
        if (art.is_bookmarked) {
            bookService.unmarkArt(art).then(function () {
                art.is_bookmarked = false;
            });
        } else {
            bookService.bookmarkArt(art).then(function () {
                art.is_bookmarked = true;
            });;
        }
    };

    $scope.handleAdmireArt = function (event, index) {
        event.stopPropagation();

        var art = $scope.arts[index];

        if (art.is_admired) {
            admireService.unadmireArt(art).then(function () {
                art.is_admired = false;
            });
        } else {
            admireService.admireArt(art).then(function () {
                art.is_admired = true;
            });;
        }
    };

    $scope.showArtBuckets = function (index) {
        var art = $scope.arts[index];
        bucketmodalService.showArtBuckets(art);
    }

    $scope.showAddToBucket = function (event, index) {
        event.stopPropagation();

        var art = $scope.arts[index];
        bucketmodalService.showAddToBucket(art);
    };

    $scope.toggleNsfw = function (index) {
        var art = $scope.arts[index];
        art.nsfw = false;
    };

    $scope.shareArt = function (event, index) {
        event.stopPropagation();

        var art = $scope.arts[index];
        var base_url = "http://thirddime.com";
        var share_url = base_url + "/arts/" + art.slug;
        var title = 'Artwork: "' + art.title + '" by: ' + art.artist.name;
        var description = 'Find thoughts about artwork "' + art.title+
            '" at ' + share_url;
        var media = 'http://thirddime.com' + art.matter;
        shareModalService.shareThisPage(share_url, title, description, media);
    };

}]);