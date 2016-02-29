// Sorry
(function(){
    'use strict';

    var app = angular.module('cg', [
        'ui.router',
    ]);

    app.filter('rawhtml', ['$sce', function($sce){
        // It's good thing that we can trust our API provider, right?
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    }]);

    app.filter('targetblank', function(){
        // Add target="_black" to all links
        return function(val) {
            if (typeof val === "string") {
                return val.replace(/<a /, "<a target='_blank'"); // sorry
            }
            return val;
        };
    });

    app.service('searchService', ["$http", function($http){
        // DDG API wrapper
        var self = this;
        self.searchstr = "";
        this.search = function(s, cb) {
            if (s === self.searchstr) {
                // "cache": return old result
                cb(self.data);
                return;
            }
            if (s === "") {
                // reset
                cb({});
                return;
            }
            self.searchstr = s;
            $http.jsonp("//api.duckduckgo.com", {
                params: {
                    callback: "JSON_CALLBACK",
                    q: self.searchstr,
                    format: "json",
                    no_redirect: 1,
                    skip_disambig: 1,
                    t: "TestApp"
                }
            }).success(function(data) {
                self.data = data;
                cb(self.data);
            });
        };
    }]);
    app.service('kludgeService', function(){
        // fix application using "experimental code"
        var self = this;
        self.options = {
            related: {name: "related", text: "Show related topics", value: true}
        };
        self.text = "";
    });

    app.config(function($stateProvider, $urlRouterProvider) {
        // For any unmatched url, redirect to /main
        $urlRouterProvider.otherwise("/main");

        // Set up the states
        $stateProvider
        .state('main', {
            url: "/main",
            templateUrl: "html/main.html"
        })
        .state('text', {
            url: "/text",
            templateUrl: "html/text.html"
        })
        .state('settings', {
            url: "/settings",
            templateUrl: "html/settings.html"
        });
    });

    app.controller("ResultController", ["$scope", "searchService", "kludgeService", function($scope, $ss, $settings) {
        // Controller for search results
        var self = this;
        self.data = {}; // current search result
        self.resultOK = false; // is result ok
        self.set = function(data) {
            self.resultOK = Object.keys(data).length !== 0;
            self.data = data;
        }
        self.update = function() {
            var text = getSelectedText().trim();
            if (text) {
                $ss.search(text, self.set); // search
            }
            else {
                self.set({}); // clear
            }
            $("#result").scrollTop(0);
        }
        self.options = $settings.options; // stupid and kludgy "sync"
    }]);

    app.controller("TextController", ["$scope", "kludgeService", function($scope, $ks) {
        // Controller for user text insertion
        var self = this;
        self.insert = "";
        self.text = $ks.text || "";
        self.insert = function() {
            self.text = $scope.insert.replace(/\b([a-zA-Z0-9-_]+)\b/g, function(q) {
                return "<span word='"+q.toLowerCase()+"'>"+q+"</span>"
            });
            $scope.insert = ""; // clear text field
            $ks.text = self.text;
        }
        self.clear = function() {
            self.text = "";
            $ks.text = self.text;
        }
    }]);

    app.controller("SettingsController", ["kludgeService", function($settings) {
        // Settings controller (ks wrapper)
        var self = this;
        self.options = {};
        self.pull = function() {
            for (var key in $settings.options) {
                if ($settings.options.hasOwnProperty(key)) {
                    self.options[key] = $settings.options[key];
                }
            }
        }
        self.push = function() {
            $settings.options = self.options;
        }
        self.pull();
    }]);
})();
