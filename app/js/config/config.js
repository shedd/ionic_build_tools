/* disable warnings about duplicate hash keys for this file */
/*jshint -W075 */

angular.module('BuildTools.config', [])
  .constant( 'Config', {
    // @if BUILD_TARGET='development'
    'API_BASEURL':            'http://localhost:8080/api/v1',
    // @endif
    // @if BUILD_TARGET='staging'
    'API_BASEURL':            'http://staging.domain.com/api/v1',
    // @endif
    // @if BUILD_TARGET='production'
    'API_BASEURL':            'http://production.domain.com/api/v1',
    // @endif
  }
);

/* jshint +W075 */