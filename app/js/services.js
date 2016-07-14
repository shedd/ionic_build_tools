/*
 * See services/ for the individual Service definitions.
 */

module.exports = angular.module('BuildTools.services', ['BuildTools.config'])
  .service('SessionService', require('./services/Session'))
