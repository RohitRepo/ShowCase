angular.module('module.bucketmodal')
.controller('bucketmodalContentController', ['$scope',
    '$window',
    'auth',
    'bucketModel',
    'bucketmodalService',
    'close',
    'bucket',
    'progress',
    'alert',
    function ($scope, $window, auth, bucketModel, bucketmodalService, close, bucket, progress, alert) {

        progress.showProgress();
        $scope.bucket = bucket;
        $scope.math = window.Math;
        var currentShowIndex = 0;

        bucketModel.bucketArts(bucket.id).then(function (arts) {
            $scope.bucketArts = arts;

            $scope.bucketArts[currentShowIndex].show = true;

            progress.hideProgress();
        }, function () {
            alert.showAlert('We are unable to art for this series');
            progress.hideProgress();
        });


        $scope.toggleNsfw = function (index) {
            var art = $scope.bucketArts[index];
            art.nsfw = false;
        }

        $scope.nextArt = function () {

            if ($scope.bucketArts.length > currentShowIndex + 1){
                $scope.bucketArts[currentShowIndex].show = false;
                currentShowIndex = currentShowIndex + 1;
                $scope.bucketArts[currentShowIndex].show = true;
            }
        }

        $scope.prevArt = function () {

            if (currentShowIndex > 0){
                $scope.bucketArts[currentShowIndex].show = false;
                currentShowIndex = currentShowIndex - 1;
                $scope.bucketArts[currentShowIndex].show = true;
            }
        }

        $scope.back = function () {
            $window.history.back();
        };

        $scope.close = function () {
            close();
        };

        $scope.watchBucket = function () {
            auth.runWithAuth(function () {
                progress.showProgress();

                bucketModel.watch($scope.bucket.id).then(function (response) {
                    $scope.bucket.is_watched = true;
                    progress.hideProgress();
                }, function () {
                    progress.hideProgress();
                    alert.showAlert("Unable to complete action");
                });
            });
        };

        $scope.unwatchBucket = function () {
            auth.runWithAuth(function () {
                progress.showProgress();

                bucketModel.unwatch($scope.bucket.id).then(function (response) {
                    $scope.bucket.is_watched = false;
                    progress.hideProgress();
                }, function () {
                    progress.hideProgress();
                    alert.showAlert("Unable to complete action");
                });
            });
        };

    }
])
.directive('keyEventBinderContent', ['$window', function ($window) {
    return function (scope, element, attrs) {
        element.focus();
        element.bind('keydown', function (evt) {

            if (evt.keyCode == 27) {
                console.log("catching events");
                $window.history.back();
                return false;
            }

            scope.slyCallBack(evt);

        });

        scope.$on('$destroy', function () {
            element.unbind('keydown');
        })
    }
}])
.directive('horizontalSly', ['$timeout', function ($timeout) {
    return function (scope, element, attrs) {

        scope.$on('slyLastElement', function () {

            var sly;

            // Call Sly on frame
            $timeout(function () {

                var $slidee = element.children().eq(0);
                var $wrap   = element.parent();

                sly = new Sly(element, {
                    horizontal: 1,
                    itemNav: 'forceCentered',
                    smart: 1,
                    activateOn: 'click',
                    mouseDragging: 1,
                    touchDragging: 1,
                    releaseSwing: 1,
                    startAt: 0,
                    scrollBar: $wrap.find('.scrollbar'),
                    scrollBy: 1,
                    activatePageOn: 'click',
                    speed: 300,
                    elasticBounds: 1,
                    easing: 'easeOutExpo',
                    dragHandle: 1,
                    dynamicHandle: 1,
                    clickBar: 1,

                    // Buttons
                    prev: $wrap.find('.prev'),
                    next: $wrap.find('.next')
                }).init();
            }, 0);

            scope.slyCallBack = function (evt) {

                if (evt.keyCode == 37) {
                    sly.prev();
                }

                if (evt.keyCode == 39) {
                    sly.next();
                }
            };

            scope.slyInitComplete = true;

        });


    };

}])
.directive('checkLast', [function () {

    return function (scope, element, attrs) {
        if (scope.$last) {
            scope.$emit('slyLastElement')
        }
    };
}])
.directive('swipeEffect', ['$swipe', function ($swipe) {
    return function (scope, element, attrs) {
        $swipe.bind(element, {
            'move' : function () {
                element.addClass('swiping');
            },
            'end' : function () {
                element.removeClass('swiping');
            }
        })
    };
}]);