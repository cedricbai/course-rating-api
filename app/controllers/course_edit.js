'use strict';

var angular = require('angular');

function CourseEditController(dataService, errorHandlerService, sessionService, 
  $location, $log, $routeParams) {

  var _this = this;

  _this.courseId = $routeParams.id;
  _this.course = {};
  _this.courseTitle = '';
  _this.validationErrors = {};
  _this.hasValidationErrors = false;

  _this.saveCourse = function() {
    var course = _this.course;

    if (_this.courseId) {
      dataService.updateCourse(course).then(
        function() {
          $location.path('/detail/' + _this.courseId);
        },
        function(response) {
          errorHandlerService.handleError(response, displayValidationErrors);
        });
    } else {
      dataService.createCourse(course).then(
        function() {
          $location.path('/');
        },
        function(response) {
          errorHandlerService.handleError(response, displayValidationErrors);
        });
    }
  };

  _this.addStep = function(index) {
    var newStepNumber = index + 1;
    var steps = _this.course.steps;
    steps.forEach(function(step) {
      if (step.stepNumber >= newStepNumber) {
        step.stepNumber++;
      }
    });
    steps.splice(index, 0, {
      stepNumber: newStepNumber,
      title: '',
      description: ''
    });
  };

  _this.removeStep = function(indexToRemove) {
    var steps = _this.course.steps;
    steps.forEach(function(step, index) {
      if (index > indexToRemove) {
        step.stepNumber--;
      }
    });
    steps.splice(indexToRemove, 1);
  };

  init();

  function init() {
    if (_this.courseId) {
      getCourse();
    } else {
      resetCourse();
    }
  }

  function getCourse() {
    dataService.getCourse(_this.courseId).then(
      function(response) {
        

        var course = response.data || response.data.data[0];
        _this.course = angular.copy(course);
        _this.courseTitle = course.title;
      },
      function(response) {
        errorHandlerService.handleError(response);
      });
  }

  function resetCourse() {
    var currentUser = sessionService.currentUser;

    _this.course = {
      user: {
        _id: currentUser._id,
        fullName: currentUser.fullName
      },
      title: '',
      description: '',
      estimatedTime: '',
      materialsNeeded: '',
      steps: [
        {
          stepNumber: 1,
          title: '',
          description: ''
        }
      ],
      overallRating: 0,
      reviews: []
    };
  }

  function displayValidationErrors(validationErrors) {
    _this.validationErrors = validationErrors.errors;
    _this.hasValidationErrors = true;
  }

  function resetValidationErrors() {
    _this.validationErrors = {};
    _this.hasValidationErrors = false;
  }

}

module.exports = CourseEditController;