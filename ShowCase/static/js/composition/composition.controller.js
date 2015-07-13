angular.module("CompositionApp").
controller("compositionController", [
	"$window",
	"$scope",
	"feedModel",
	"postModel",
	"contentManager",
	'$location',
	'$timeout',
	'analytics',
	'progress',
	'alert',
	'userModel',
	function ($window,
		$scope,
		feedModel,
		postModel,
		contentManager,
		$location,
		$timeout,
		analytics,
		progress,
		alert,
		userModel)
	{

	$scope.composition = {};
	$scope.interpretations = [];
	$scope.hideName = true;
	$scope.interpretationModalshown = false;
	$scope.collectedNow = false;
	$scope.removedNow = false;

	$scope.init = function (id, url) {
		$scope.composition.id = id;
		$scope.composition.url = url;
		if (url) {
			analytics.logEvent('Composition', 'Init: ' + url);
		}
	};

	var checkForScroll = function (interval) {
		$timeout (function () {
			var scrollTo = $location.search()['scrollTo'];
			if (scrollTo) {
				var elementTop = $('#'+scrollTo).offset().top;
				$('html,body').animate({
			        'scrollTop': elementTop
			    }, 750);
				analytics.logEvent('Composition', 'scroll-to: ' + scrollTo, $scope.composition.url);
			}
		}, interval);
		
	};

	$scope.$watch($scope.composition.Id, function () {
		postModel.getCompositionPosts($scope.composition.id).then(function (posts) {
			$scope.posts = posts;
			checkForScroll(500);
		});
	});

	$scope.vote = function (index, vote) {
		analytics.logEvent('Composition', 'Vote', $scope.composition.url);
		post = $scope.posts[index];
		postModel.vote(post.id, vote).then(function (response) {
			post.vote.total = response.total;
			post.voting_status = vote ? "Positive" : "Negative";
		});
	};

	$scope.toggleShowComments = function (index) {
		var post = $scope.posts[index];
		post.showComments = !post.showComments;
		if (post.showComments) {
			getComments(index);
		};
		analytics.logEvent('Composition', 'ShowComments: ' + post.showComments, $scope.composition.url);
	};

	$scope.addComment = function (index, comment) {
		post = $scope.posts[index];
		postModel.addComment(post.id, comment).then(function (res) {
			post.comments.push(res);
			post.comment = "";
		});
		analytics.logEvent('Composition', 'Add Comment', $scope.composition.url);
	};

	var getComments = function (index) {
		post = $scope.posts[index];
		postModel.getComments(post.id).then(function (res) {
			post.comments = res;
		});
	};

	$scope.isOutlineActive = "inactive";
	$scope.isGrayScaleActive = "inactive";

	$scope.showOutline = function () {
		if ($scope.isOutlineDisable && !$scope.isOutlineActive) {
			return;
		}

		analytics.logEvent('Composition', 'ToolBar - Outline: ' + $scope.isOutlineActive, $scope.composition.url);
		
		if($scope.isOutlineActive!="active"){
			$scope.isOutlineActive = '';
			$scope.isGrayScaleDisable = true;
			$timeout(function() {
				$scope.isOutlineActive = 'active';
			}, 600);
		} else {
			$scope.isOutlineActive = '';
			$scope.isGrayScaleDisable = false;
			$timeout(function() {
				$scope.isOutlineActive = 'inactive';
			}, 400);
		}
	};

	$scope.showGrayscale = function () {
		if ($scope.isGrayScaleDisable && !$scope.isGrayScaleActive) {
			return;
		}
		analytics.logEvent('Composition', 'ToolBar - GrayScale: ' + $scope.isGrayScaleActive, $scope.composition.url);

		if($scope.isGrayScaleActive!="active"){
			$scope.isGrayScaleActive = '';
			$scope.isOutlineDisable = true;
			$timeout(function() {
				$scope.isGrayScaleActive = 'active';
			}, 600);
		} else {
			$scope.isGrayScaleActive = '';
			$scope.isOutlineDisable = false;
			$timeout(function() {
				$scope.isGrayScaleActive = 'inactive';
			}, 400);
		}
	};

	$scope.reportContent = function () {
		contentManager.reportComposition($scope.composition.id).then(function () {
			alert.showAlert('Flagging this content. The content is under review now.');
			$scope.showMoreOptions = false;
		});
		analytics.logEvent('Composition', 'ToolBar - Report Content', $scope.composition.url);
	};

	$scope.getNextPosts = function () {
		$scope.disableNextPost = true;
		var feed = $location.search()['feed'];
		var postId = $location.search()['post'];
		feedModel.nextPosts(feed, postId, $scope.composition.id).then(function (posts) {
			$scope.nextPosts = posts;
		});
	};

	$scope.addToCollection = function () {
		progress.showProgress();
		userModel.addToCollection($scope.composition.id).then(function (response) {
			$scope.removedNow = true;
			$scope.collectedNow = false;
			progress.hideProgress();
		}, function () {
			progress.hideProgress();
			alert.showAlert('We are unable to process your response');
		});
	};

	$scope.removeFromCollection = function () {
		progress.showProgress();
		userModel.removeFromCollection($scope.composition.id).then(function (response) {
			$scope.collectedNow = true;
			$scope.removedNow = false;
			progress.hideProgress();
		}, function () {
			progress.hideProgress();
			alert.showAlert('We are unable to process your response');
		});
	};
}]);