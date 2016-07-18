/* 
 * See controllers/ for the individual Controller definitions
 */

module.exports = angular.module('BuildTools.controllers', ['ionic', 'BuildTools.config'])
  .controller('ApplicationCtrl', require('./controllers/ApplicationCtrl'))
  .controller('LoginCtrl', require('./controllers/LoginCtrl'))
