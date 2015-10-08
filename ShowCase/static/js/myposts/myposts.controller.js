angular.module('MypostsApp')
.controller('mypostsController', ['$scope',
    '$rootScope',
    '$document',
    'auth',
    'activityModel',
    'bucketmodalService',
    'bookService',
    'admireService',
    'usermodalService',
    'shareModalService',
    'progress',
    'alert',
    function ($scope,
        $rootScope,
        $document,
        auth,
        activityModel,
        bucketmodalService,
        bookService,
        admireService,
        usermodalService,
        shareModalService,
        progress,
        alert) {

    $scope.userActivities = [];
    $scope.activitiesMeta = {next_token: '', disableGetMore: false, busy: false, noPosts: false};

    // Disable scroll on parent page
    $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
        var body = $document.find('body');
        body.addClass('modal-open');

        if (toState.name == 'posts') {
            body.removeClass('modal-open');
        }
    });

    var getActivities = function () {

        if (!$scope.activitiesMeta.disableGetMore) {
            var next_token = $scope.activitiesMeta.next_token;
            progress.showProgress();
            activityModel.newsActivities($scope.user.id, next_token).then(function (response) {
                $scope.activitiesMeta.next_token = response.next_token;

                for (var i = 0; i < response.results.length; i++) {
                    $scope.userActivities.push(response.results[i]);
                }

                if (response.next_token == ""){
                    $scope.activitiesMeta.disableGetMore = true;
                }

                if ($scope.userActivities.length == 0){
                    $scope.activitiesMeta.noPosts = true;
                }

                progress.hideProgress();
                $scope.activitiesMeta.busy = false;
            }, function () {
                alert.showAlert('We are unable to fetch data');
                progress.hideProgress();
            });
        }
    };

    $scope.loadMoreActivities = function () {
        if ($scope.activitiesMeta.busy) {
            return;
        }

        $scope.activitiesMeta.busy = true;

        auth.getCurrentUser().then(function (user) {
            $scope.user = user;
            getActivities();
        });
    };

    $scope.showBucketArts = function (index) {
        var activity = $scope.userActivities[index];
        bucketmodalService.showBucketArts(activity.content);
    };

    $scope.handleBookMark = function (art) {
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

    $scope.handleAdmireArt = function (art) {

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

    $scope.showArtBuckets = function (art) {
        bucketmodalService.showArtBuckets(art);
    }

    $scope.showAddToBucket = function (art) {
        bucketmodalService.showAddToBucket(art);
    };

    $scope.shareArt = function (art) {
        var base_url = "http://thirddime.com";
        var share_url = base_url + "/arts/" + art.slug;
        var title = 'Artwork: "' + art.title + '" by: ' + art.artist.name;
        var description = 'Find thoughts about artwork "' + art.title+
            '" at ' + share_url;
        var media = 'http://thirddime.com' + art.matter;
        shareModalService.shareThisPage(share_url, title, description, media);
    };

}]);