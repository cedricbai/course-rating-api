'use strict';

function CourseDetailController(dataService, errorHandlerService, sessionService,
  $anchorScroll, $location, $log, $routeParams) {

  var _this = this;

  _this.courseId = $routeParams.id;
  _this.course = {};
  _this.userReview = {};
  _this.numberOfReviewsDisplayText = 0;
  _this.userReviewValidationErrors = {};
  _this.hasUserReviewValidationErrors = false;
  _this.userIsAuthenticated = sessionService.currentUser.isAuthenticated;
  _this.currentUserId = sessionService.currentUser._id;
  _this.userCanEdit = false;

  init();

  _this.postReview = function() {
    dataService.createReview(_this.courseId, _this.userReview).then(
      function() {
        getCourse();
        resetUserReview();
        resetUserReviewValidationErrors();
      },
      function(response) {
        errorHandlerService.handleError(response, displayUserReviewValidationErrors);
      });
  };

  _this.canPostReview = function() {
    return (_this.userIsAuthenticated && this.course && this.course.user && 
      _this.course.user._id !== _this.currentUserId);
  };

  _this.canDeleteReview = function(review) {
    return (_this.userIsAuthenticated &&
      (review.user._id === _this.currentUserId || _this.course.user._id === _this.currentUserId));
  };

  _this.deleteReview = function(reviewId) {
    dataService.deleteReview(_this.courseId, reviewId).then(
      function() {
        getCourse();
      },
      function(response) {
        errorHandlerService.handleError(response);        
      });
  };

  _this.scrollTo = function(id) {
    $location.hash(id);
    $anchorScroll();
  };

  function init() {
    getCourse();
    resetUserReview();
  }

  function getCourse() {
    dataService.getCourse(_this.courseId).then(
      function(response) {
        var course = response.data;
        _this.course = course;
        var currentUser = sessionService.currentUser;
        _this.userCanEdit = (currentUser.isAuthenticated && course.user._id === currentUser._id);

        updateNumberOfReviewsDisplayText(course.reviews);
      },
      function(response) {
        errorHandlerService.handleError(response);
      });
  }

  function updateNumberOfReviewsDisplayText(reviews) {
    _this.numberOfReviewsDisplayText = (reviews.length === 1) ?
      '1 Review' : reviews.length + ' Reviews';
  }

  function resetUserReview() {
    _this.userReview = {
      rating: 0,
      review: ''
    };
  }

  function displayUserReviewValidationErrors(validationErrors) {
    _this.userReviewValidationErrors = validationErrors.errors;
    _this.hasUserReviewValidationErrors = true;
  }

  function resetUserReviewValidationErrors() {
    _this.userReviewValidationErrors = {};
    _this.hasUserReviewValidationErrors = false;
  }

}

module.exports = CourseDetailController;