

/**
 * googleplus module
 */
angular.module('googleplus', []).

  /**
   * GooglePlus provider
   */
  provider('GooglePlus', [function() {

        /**
     * Options object available for module
     * options/services definition.
     * @type {Object}
     */
    var options = {};

    /**
     * clientId
     * @type {Number}
     */
    options.clientId = null;

    /**
     * ignoreAuto
     * If true ignore auto logins
     * @type {Boolean}
     */
    options.ignoreAuto = false;

    /**
     * cookiepolicy
     * Cookie policy for sign in
     * @type {Boolean}
     */
    options.cookiepolicy = 'single_host_origin';

    /**
     * apiKey
     * @type {String}
     */
    options.apiKey = null;

    /**
     * Scopes
     * @default 'https://www.googleapis.com/auth/plus.login'
     * @type {Boolean}
     */
    options.scopes = 'https://www.googleapis.com/auth/plus.login';

    this.setClientId = function(clientId) {
      options.clientId = clientId;
      return this;
    };

    this.getClientId = function() {
      return options.clientId;
    };

    this.setApiKey = function(apiKey) {
      options.apiKey = apiKey;
      return this;
    };

    this.getApiKey = function() {
      return options.apiKey;
    };


    this.setScopes = function(scopes) {
      options.scopes = scopes;
      return this;
    };

    this.getScopes = function() {
      return options.scopes;
    };

    /**
     * Init Google Plus API
     */
    this.init = function(customOptions) {
      angular.extend(options, customOptions);
    };

    /**
     * This defines the Google Plus Service on run.
     */
    this.$get = ['$q', '$rootScope', '$timeout', '$window', function($q, $rootScope, $timeout, $window) {

      /**
       * Define a deferred instance that will implement asynchronous calls
       * @type {Object}
       */
      var deferred;

      /**
       * NgGooglePlus Class
       * @type {Class}
       */
      var NgGooglePlus = function () {};

      $window.googlePlusHandleAuthResult = function(authResult){
        $timeout(function(){
          if (authResult && !authResult.error) {
              if ( options.ignoreAuto && authResult.status.method === 'AUTO') {
                  gapi.auth.signOut();
                  return; //Ignore and don't resolve the promise.
              }
            deferred.resolve(authResult);
          } else {
            if (authResult.error !== 'user_signed_out') {
              deferred.reject('error');
            }
          }
        });
      };

      /**
       * Set to true when the Google script has been loaded.
       * @type {boolean}
       */
      var isReadyFlag = false;
      NgGooglePlus.prototype.isReady = function(){
        return isReadyFlag;
      };
      NgGooglePlus.prototype.setReady = function(ready){
        isReadyFlag = ready ? true: false;
      };

      NgGooglePlus.prototype.login =  function () {
        deferred  = $q.defer();
        gapi.auth.signIn({
          clientid: options.clientId,
          scope: options.scopes,
          cookiepolicy: options.cookiepolicy,
          callback: 'googlePlusHandleAuthResult'
        });
        return deferred.promise;
      };

      NgGooglePlus.prototype.checkAuth = function() {
        deferred  = $q.defer();
        gapi.auth.authorize({
          client_id: options.clientId,
          scope: options.scopes,
          immediate: true
        }, $window.googlePlusHandleAuthResult);
        return deferred.promise;
      };

      NgGooglePlus.prototype.handleClientLoad = function () {
        gapi.client.setApiKey(options.apiKey);
        gapi.auth.init(function () { });
        $timeout(this.checkAuth, 1);
      };

      NgGooglePlus.prototype.getUser = function() {
          var deferred = $q.defer();

          gapi.client.load('oauth2', 'v2', function () {
            gapi.client.oauth2.userinfo.get().execute(function (resp) {
              deferred.resolve(resp);
              $rootScope.$apply();
            });
          });

          return deferred.promise;
      };

      NgGooglePlus.prototype.getToken = function() {
        return gapi.auth.getToken();
      };

      NgGooglePlus.prototype.setToken = function(token) {
        return gapi.auth.setToken(token);
      };

      NgGooglePlus.prototype.logout =  function () {
        deferred  = $q.defer();
        gapi.auth.signOut();
        return deferred.promise;
      };

      return new NgGooglePlus();
    }];
}])

// Initialization of module
.run(['$window', '$timeout', 'GooglePlus', function($window, $timeout, GooglePlus) {

  $window.ngGooglePlusLoaded = function() {
    $timeout(function() {
      GooglePlus.setReady(true);
    });
  };

  var po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = 'https://apis.google.com/js/client.js?onload=ngGooglePlusLoaded';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);
}]);
