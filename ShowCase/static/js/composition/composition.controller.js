angular.module("CompositionApp").
controller("compositionController", [
	"$window",
	"$scope",
	"posts",
	"contentManager",
	"interpretationModel",
	'$location',
	'$timeout',
	'analytics',
	'progress',
	function ($window,
		$scope,
		posts,
		contentManager,
		interpretationModel,
		$location,
		$timeout,
		analytics,
		progress)
	{

	$scope.composition = {};
	$scope.interpretations = [];
	$scope.hideName = true;
	$scope.interpretationModalshown = false;

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
		interpretationModel.getInterpretations($scope.composition.id).then(function (interpretations) {
			$scope.interpretations = interpretations;
			checkForScroll(500);
		});
	});

	$scope.vote = function (index, vote) {
		analytics.logEvent('Composition', 'Vote', $scope.composition.url);
		interpretation = $scope.interpretations[index];
		interpretationModel.vote($scope.composition.id, interpretation.id, vote).then(function (response) {
			interpretation.vote.total = response.total;
			interpretation.voting_status = vote ? "Positive" : "Negative";
		});
	};

	$scope.toggleShowComments = function (index) {
		var interpretation = $scope.interpretations[index];
		interpretation.showComments = !interpretation.showComments;
		if (interpretation.showComments) {
			getComments(index);
		};
		analytics.logEvent('Composition', 'ShowComments: ' + interpretation.showComments, $scope.composition.url);
	};

	$scope.addComment = function (index, comment) {
		interpretation = $scope.interpretations[index];
		interpretationModel.addComment($scope.composition.id, interpretation.id, comment).then(function (res) {
			interpretation.comments.push(res);
			interpretation.comment = "";
		});
		analytics.logEvent('Composition', 'Add Comment', $scope.composition.url);
	};

	var getComments = function (index) {
		interpretation = $scope.interpretations[index];
		interpretationModel.getComments($scope.composition.id, interpretation.id).then(function (res) {
			interpretation.comments = res;
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
			showAlert('Flagging this content. The content is under review now.');
			$scope.showMoreOptions = false;
		});
		analytics.logEvent('Composition', 'ToolBar - Report Content', $scope.composition.url);
	};

	$scope.getNextPosts = function () {
		$scope.disableNextPost = true;
		var feed = $location.search()['feed'];
		var postId = $location.search()['post'];
		posts.nextPosts(feed, postId, $scope.composition.id).then(function (posts) {
			$scope.nextPosts = posts;
		});
	};

	$scope.alerts = {'show': false, 'content': ''};

	var showAlert = function (content) {
		$scope.alerts.content = content;
		$scope.alerts.show = true;

		$timeout(function () {
			$scope.alerts.show = false;
		}, 4000);
	};

	$scope.showInterpretationModal = function () {
		$scope.interpretationModalshown = true;
	};

	$scope.hideInterpretationModal = function () {
		$scope.interpretationModalshown = false;
	};

	var uploading;
	$scope.saveInterpretation = function () {
		
		analytics.logEvent('Composition', 'Add Interpretation', $scope.composition.url);

		progress.showProgress();

		if (!uploading){
			uploading = true;
			interpretationModel.addInterpretation($scope.composition.id, $('.new-interpretation').html())
			.then(function () {
				$scope.hideInterpretationModal();
				showAlert("Your submission is under review.");
				 $('.new-interpretation').html('');
				 $('.new-interpretation').addClass('medium-editor-placeholder');
				 uploading = false;
				 progress.hideProgress();
			}, function () {
				progress.hideProgress();
				showAlert("This is not a valid submission.");
			});
		}
	};

}]);