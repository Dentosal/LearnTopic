// Sorry
(function(){
    'use strict';

    var app = angular.module('cg', [
        'ui.router',
    ]);

    app.filter('rawhtml', ['$sce', function($sce){
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    }]);

    app.filter('targetblank', function(){
        return function(val) {
            if (typeof val === "string") {
                return val.replace(/<a /, "<a target='_blank'"); // sorry
            }
            return val;
        };
    });

    app.service('searchService', ["$http", function($http){
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

    app.config(function($stateProvider, $urlRouterProvider) {
        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("/text");

        // Set up the states
        $stateProvider
        .state('text', {
            url: "/text",
            templateUrl: "html/text.html"
        })
        .state('settings', {
            url: "/settings",
            templateUrl: "html/settings.html"
        });
    });

    app.controller("ResultController", ["$scope", "searchService", function($scope, $ss) {
        var self = this;
        self.data = {}; // current search result
        self.resultOK = false; // is result ok
        self.set = function(data) {
            self.resultOK = Object.keys(data).length !== 0;
            console.log(self.resultOK, data);
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
        self.scroll = function(a,b,c) {
            console.log($scope.resultpanel);
        }
    }]);

    app.controller("TextController", function($scope) {
        var self = this;
        self.insert = "";
        self.text = "";
        self.insert = function() {
            self.text = $scope.insert.replace(/\b([a-zA-Z0-9-_]+)\b/g, function(q) {
                return "<span word='"+q.toLowerCase()+"'>"+q+"</span>"
            });
            $scope.insert = ""; // clear text field
        }
        self.clear = function() {
            self.text = "";
        }
    });

})();
