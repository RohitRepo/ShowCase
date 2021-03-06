angular.module('UserApp')
.controller('profileArtifactsController', ['$scope',
    '$state',
    'userModel',
    'bookmarkModel',
    'admirationModel',
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
        admirationModel,
        bookService,
        admireService,
        progress,
        alert,
        usermodalService,
        bucketmodalService,
        shareModalService) {
    $scope.artifacts = [];
    $scope.math = window.Math;
    $scope.artifactsMeta = {pageVal: 1, disableGetMore: false, busy: false, next:'', previous:'', noWorks: false};

    var mq = window.matchMedia( "(max-width: 800px)" );
    if (mq.matches) {
        $scope.onMobile = true;
    }
    else {
        $scope.onMobile = false;
    }

    var artifactFetcher = function () {
        var listType = $state.current.data.listType;


        if (listType == 'admirations') {
            return admirationModel.getUserAdmirations;
        } else if (listType == 'bookmarks') {
            return bookmarkModel.getBookMarks;
        } else if (listType == 'drafts') {
            return userModel.drafts;
        }
    }();

    var getCompositions = function () {

        if (!$scope.artifactsMeta.disableGetMore) {
            var pageVal = $scope.artifactsMeta.pageVal;
            progress.showProgress();
            artifactFetcher($scope.artist.id, pageVal).then(function (response) {

                if (response instanceof Array) {
                    $scope.artifactsMeta.disableGetMore = true;

                    if (response.length > 0) {
                        $scope.artifacts = response;
                    } else {
                        $scope.artifactsMeta.noWorks = true;
                    }

                } else {

                    $scope.artifactsMeta.next = response.next;
                    $scope.artifactsMeta.previous = response.previous;

                    for (var i = 0; i < response.results.length; i++) {
                        $scope.artifacts.push(response.results[i]);
                    }

                    if (response.next == null){
                        $scope.artifactsMeta.disableGetMore = true;
                    }

                    if ($scope.artifacts.length == 0){
                        $scope.artifactsMeta.noWorks = true;
                    }

                }

                progress.hideProgress();
                $scope.artifactsMeta.busy = false;
            }, function () {
                alert.showAlert('We are facing some problems fetching data');
                progress.hideProgress();
            });
        }

        $scope.artifactsMeta.pageVal += 1;
    };

    $scope.loadMoreArtifacts = function () {
        if ($scope.artifactsMeta.busy) {
            return;
        }

        $scope.artifactsMeta.busy = true;
        getCompositions();
    }

    $scope.handleBookMark = function (event, index) {
        event.stopPropagation();
        var art = $scope.artifacts[index].content;
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

    $scope.handleBookMarkBucket = function (event, index) {
        event.stopPropagation();

        var bucket = $scope.artifacts[index].content;
        if (bucket.is_bookmarked) {
            bookService.unmarkBucket(bucket).then(function () {
                bucket.is_bookmarked = false;
            });
        } else {
            bookService.bookmarkBucket(bucket).then(function () {
                bucket.is_bookmarked = true;
            });;
        }
    };

    $scope.handleAdmireArt = function (event, index) {
        event.stopPropagation();
        var art = $scope.artifacts[index].content;

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

    $scope.handleAdmireBucket = function (event, index) {
        event.stopPropagation();

        var bucket = $scope.artifacts[index].content;
        if (bucket.is_admired) {
            admireService.unadmireBucket(bucket).then(function () {
                bucket.is_admired = false;
            });
        } else {
            admireService.admireBucket(bucket).then(function () {
                bucket.is_admired = true;
            });;
        }
    };

    $scope.handleBookmarkInterpret = function (index) {
        var interpret = $scope.artifacts[index].content;

        if (interpret.is_bookmarked) {
            bookService.unmarkInterpret(interpret).then(function () {
                interpret.is_bookmarked = false;
            });
        } else {
            bookService.bookmarkInterpret(interpret).then(function () {
                interpret.is_bookmarked = true;
            });;
        }
    };

    $scope.getTextColor = function (color) {
        var red = parseInt(color.substring(1,3), 16);
        var green = parseInt(color.substring(3,5), 16);
        var blue = parseInt(color.substring(5), 16);

        var lum = 1 - ( 0.299 * red + 0.587 * green + 0.114 * blue)/255;

        if (lum > 0.5){
            return 'white';
        }

        return 'black';
    }

    $scope.showArtBuckets = function (index) {
        var art = $scope.artifacts[index].content;
        bucketmodalService.showArtBuckets(art);
    }

    $scope.showAddToBucket = function (event, index) {
        event.stopPropagation();
        var art = $scope.artifacts[index].content;
        bucketmodalService.showAddToBucket(art);
    };

    $scope.toggleNsfw = function (index) {
        var art = $scope.artifacts[index].content;
        art.nsfw = false;
    };

    $scope.shareArt = function (event, index) {
        event.stopPropagation();
        var art = $scope.artifacts[index].content;
        var base_url = "http://thirddime.com";
        var share_url = base_url + "/arts/" + art.slug;
        var title = 'Artwork: "' + art.title + '" by: ' + art.artist.name;
        var description = 'Find thoughts about artwork "' + art.title+
            '" at ' + share_url;
        var media = 'http://thirddime.com' + art.matter;
        shareModalService.shareThisPage(share_url, title, description, media);
    };

    $scope.shareBucket = function (event, index) {
        // Stop route change on click
        event.stopPropagation();

        var bucket = $scope.artifacts[index].content;
        var base_url = "http://thirddime.com";
        var share_url = base_url + "/@" + bucket.owner.slug + '/series/' + bucket.slug;
        var title = 'Series: "' + bucket.name + '" by: ' + bucket.owner.name;
        var description = bucket.description + '...Complete series can be found at: ' + share_url;
        var media = 'http://thirddime.com' + bucket.picture;
        shareModalService.shareThisPage(share_url, title, description, media);
    };

}]);