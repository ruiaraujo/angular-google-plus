/*! angular-google-plus - v0.1.2 2015-03-13 */
/**
 * googleplus module
 */
angular.module("googleplus", []).provider("GooglePlus", [ function() {
    /**
     * Options object available for module
     * options/services definition.
     * @type {Object}
     */
    var a = {};
    /**
     * clientId
     * @type {Number}
     */
    a.clientId = null;
    /**
     * ignoreAuto
     * If true ignore auto logins
     * @type {Boolean}
     */
    a.ignoreAuto = false;
    /**
     * cookiepolicy
     * Cookie policy for sign in
     * @type {Boolean}
     */
    a.cookiepolicy = "single_host_origin";
    /**
     * apiKey
     * @type {String}
     */
    a.apiKey = null;
    /**
     * Scopes
     * @default 'https://www.googleapis.com/auth/plus.login'
     * @type {Boolean}
     */
    a.scopes = "https://www.googleapis.com/auth/plus.login";
    this.setClientId = function(b) {
        a.clientId = b;
        return this;
    };
    this.getClientId = function() {
        return a.clientId;
    };
    this.setApiKey = function(b) {
        a.apiKey = b;
        return this;
    };
    this.getApiKey = function() {
        return a.apiKey;
    };
    this.setScopes = function(b) {
        a.scopes = b;
        return this;
    };
    this.getScopes = function() {
        return a.scopes;
    };
    /**
     * Init Google Plus API
     */
    this.init = function(b) {
        angular.extend(a, b);
    };
    /**
     * This defines the Google Plus Service on run.
     */
    this.$get = [ "$q", "$rootScope", "$timeout", "$window", function(b, c, d, e) {
        /**
       * Define a deferred instance that will implement asynchronous calls
       * @type {Object}
       */
        var f;
        /**
       * NgGooglePlus Class
       * @type {Class}
       */
        var g = function() {};
        e.googlePlusHandleAuthResult = function(b) {
            d(function() {
                if (b && !b.error) {
                    if (a.ignoreAuto && b.status.method === "AUTO") {
                        gapi.auth.signOut();
                        return;
                    }
                    f.resolve(b);
                } else {
                    if (b.error !== "user_signed_out") {
                        f.reject("error");
                    }
                }
            });
        };
        /**
       * Set to true when the Google script has been loaded.
       * @type {boolean}
       */
        var h = false;
        g.prototype.isReady = function() {
            return h;
        };
        g.prototype.setReady = function(a) {
            h = a ? true : false;
        };
        g.prototype.login = function() {
            f = b.defer();
            gapi.auth.signIn({
                clientid: a.clientId,
                scope: a.scopes,
                cookiepolicy: a.cookiepolicy,
                callback: "googlePlusHandleAuthResult"
            });
            return f.promise;
        };
        g.prototype.checkAuth = function() {
            f = b.defer();
            gapi.auth.authorize({
                client_id: a.clientId,
                scope: a.scopes,
                immediate: true
            }, e.googlePlusHandleAuthResult);
            return f.promise;
        };
        g.prototype.handleClientLoad = function() {
            gapi.client.setApiKey(a.apiKey);
            gapi.auth.init(function() {});
            d(this.checkAuth, 1);
        };
        g.prototype.getUser = function() {
            var a = b.defer();
            gapi.client.load("oauth2", "v2", function() {
                gapi.client.oauth2.userinfo.get().execute(function(b) {
                    a.resolve(b);
                    c.$apply();
                });
            });
            return a.promise;
        };
        g.prototype.getToken = function() {
            return gapi.auth.getToken();
        };
        g.prototype.setToken = function(a) {
            return gapi.auth.setToken(a);
        };
        g.prototype.logout = function() {
            f = b.defer();
            gapi.auth.signOut();
            return f.promise;
        };
        return new g();
    } ];
} ]).run([ "$window", "$timeout", "GooglePlus", function(a, b, c) {
    a.ngGooglePlusLoaded = function() {
        b(function() {
            c.setReady(true);
        });
    };
    var d = document.createElement("script");
    d.type = "text/javascript";
    d.async = true;
    d.src = "https://apis.google.com/js/client.js?onload=ngGooglePlusLoaded";
    var e = document.getElementsByTagName("script")[0];
    e.parentNode.insertBefore(d, e);
} ]);