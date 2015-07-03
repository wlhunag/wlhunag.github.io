"use strict";
angular.module("yapp", ["firebase", "ui.router", "ngAnimate", "ngResource", "xeditable", "ui.bootstrap", "viewhead"])

    .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when("/dashboard", "/dashboard/job"),
            $urlRouterProvider.otherwise("/dashboard/job"),
            $stateProvider
                .state("login", {
                    url: "/login",
                    templateUrl: "views/login.html",
                    controller: "LoginCtrl"
                })
                .state("dashboard", {
                    url: "/dashboard",
                    templateUrl: "views/dashboard.html",
                    controller: "DashboardCtrl"
                })
                .state("profile", {
                    url: "/profile",
                    parent: "dashboard",
                    templateUrl: "views/profile.html",
                    controller: "ProfileCtrl"
                })

                .state("profileDetail", {
                    url: "/profiledetail/:proId",
                    parent: "dashboard",
                    templateUrl: "views/profileDetail.html",
                    controller: "ProfileDetailCtrl"
                })

                .state("editprofile", {
                    url: "/editprofile",
                    parent: "dashboard",
                    templateUrl: "views/editprofile.html",
                    controller: "ProfileCtrl"
                })

                .state("job", {
                    url: "/job",
                    parent: "dashboard",
                    templateUrl: "views/dashboard/job.html",
                    controller: "JobCtrl",
                    resolve: {
                        // controller will not be loaded until $waitForAuth resolves
                        // Auth refers to our $firebaseAuth wrapper in the example above
                        "currentAuth": ["Auth", function (Auth) {
                            // $waitForAuth returns a promise so the resolve waits for it to complete
                            return Auth.$waitForAuth();
                        }]
                    }
                })

                .state("newjob", {
                    url: "/newjob",
                    parent: "dashboard",
                    templateUrl: "views/dashboard/postnewjob.html",
                    controller: "newJobCtrl"
                })

                .state("jobDetail", {
                    url: "/jobdetail/:jobId",
                    parent: "dashboard",
                    templateUrl: "views/dashboard/jobDetail.html",
                    controller: "JobDetailCtrl"
                })

                .state("editjobDetail", {
                    url: "/editjobdetail/:jobId",
                    parent: "dashboard",
                    templateUrl: "views/dashboard/editjobDetail.html",
                    controller: "editJobDetailCtrl"
                })

                .state("education", {
                    url: "/education",
                    parent: "dashboard",
                    templateUrl: "views/dashboard/education.html",
                    controller: "EduCtrl"
                })
                .state("business", {
                    url: "/business",
                    parent: "dashboard",
                    templateUrl: "views/dashboard/business.html",
                    controller: "BusCtrl"
                })

                .state("newbusiness", {
                    url: "/newbusiness",
                    parent: "dashboard",
                    templateUrl: "views/dashboard/newbusiness.html",
                    controller: "newBusCtrl"
                })

                .state("businessDetail", {
                    url: "/businessDetail/:busId",
                    parent: "dashboard",
                    templateUrl: "views/dashboard/businessDetail.html",
                    controller: "BusDetailCtrl"
                })

                .state("editbusiness", {
                    url: "/editbusiness/:busId",
                    parent: "dashboard",
                    templateUrl: "views/dashboard/editbusiness.html",
                    controller: "editBusCtrl"
                })
    }])


    .factory('Entry', function ($resource) {
        return $resource('https://amber-heat-6612.firebaseio.com/:id.json'); // Note the full endpoint address
    })

    .factory("Auth", ["$firebaseAuth", function ($firebaseAuth) {
        var ref = new Firebase("https://amber-heat-6612.firebaseio.com");
        return $firebaseAuth(ref);
    }])


    .run(function (editableOptions) {
        editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
    })

    .controller("LoginCtrl", ["$scope", "$state", "Auth","$location", function ($scope, $state, Auth, $location) {
        $scope.$state = $state;

        // login with Facebook

        $scope.loginfb = function () {
            Auth.$authWithOAuthRedirect("facebook").then(function (authData) {
                console.log("Logged in as:", authData.uid);
                $state.go('job');
            }).catch(function (error) {
                console.log("Authentication failed:", error);
            });
        };

        // login anonymously
        $scope.loginAnonymously = function () {
            Auth.$authAnonymously().then(function (authData) {
                $scope.authData = authData;
                $state.go('job');
            }).catch(function (error) {
                $scope.error = error;
            });
        };

        // login using Google
        $scope.loginGoogle = function () {
            Auth.$authWithOAuthRedirect("google").then(function (authData) {
                console.log("Authenticated successfully with payload:", authData);
                $state.go('job');
            }).catch(function (error) {
                console.log("Authentication failed:", error);
            });
        };
    }])


    .controller("DashboardCtrl", ["$scope", "$rootScope", "$state", "$location", "Auth",
        function ($scope, $state, $rootScope, $location, Auth) {
            $scope.$state = $state;

            function getName(authData) {
                switch (authData.provider) {
                    case 'password':
                        return authData.password.email.replace(/@.*/, '');
                    case 'google':
                        return authData.google.displayName;
                    case 'facebook':
                        return authData.facebook.displayName;
                }
            };

            function addUserdata(authData) {
                //console.log(authData);

                if (authData && authData.provider == "facebook") {
                    console.log("User " + authData.uid + " is logged in with " + authData.provider);
                    //delete authData.expires;
                    delete authData.auth;
                    //delete authData.facebook.accessToken;
                    delete authData.facebook.cachedUserProfile.picture;
                    delete authData.token;
                    $scope.authdata = authData;

                    $scope.authdata.picture = 'https://graph.facebook.com/' + authData.facebook.id + '/picture?width=150&height=150';
                    //console.log($scope.authdata.picture);
                    var ref = new Firebase("https://amber-heat-6612.firebaseio.com");
                    ref.child("users").child(authData.uid).update({
                        authdata: authData,
                        name: getName(authData)
                    });
                    ref.child("users").child(authData.uid).child('logtime').push({
                        logtime: new Date().getTime()
                    });
                } else if (authData && authData.provider == "google") {
                    console.log("User " + authData.uid + " is logged in with " + authData.provider);
                    //delete authData.expires;
                    delete authData.auth;
                    //delete authData.google.accessToken;
                    delete authData.token;
                    $scope.authdata = authData;
                    $scope.authdata.picture = authData.google.cachedUserProfile.picture;
                    //console.log($scope.authdata.picture);
                    var ref = new Firebase("https://amber-heat-6612.firebaseio.com");
                    ref.child("users").child(authData.uid).update({
                        authdata: authData,
                        name: getName(authData)
                    });
                    ref.child("users").child(authData.uid).child('logtime').push({
                        logtime: new Date().getTime()
                    });

                }
                else {
                    console.log("User is logged out or anonymous");
                }
                ;
            };


            $scope.auth = Auth;
            $scope.auth.$onAuth(function (authData) {
                $scope.authData = authData;
                if ($scope.authData) {
                    addUserdata($scope.authData);
                    //console.log($scope.authData);
                } else {
                    console.log("Client unauthenticated.");
                    //$location.path('/login');
                }
            });
            $scope.login = function () {

                $location.path('/login');
            };

            $scope.logout = function () {
                Auth.$unauth();
                $(".navbar-toggle").click(); //bootstrap 3.x by Richard;
            };

        }])

    .controller("JobCtrl", ["$scope", "$firebaseArray", "$firebaseObject", "Auth", "$location",
        function ($scope, $firebaseArray, $firebaseObject, Auth, $location) {
            var ref = new Firebase("https://amber-heat-6612.firebaseio.com");
            $scope.jobs = $firebaseArray(ref.child('jobs'));
            $scope.auth = Auth;
            $scope.auth.$onAuth(function (authData) {
                $scope.authData = authData;
                if ($scope.authData) {
                    //這邊 onAuth 得到的資料是fb 來的，並不是firbase 裡面的資料
                    var nref = ref.child("users").child($scope.authData.uid);

                    // create a synchronized array
                    $scope.user = $firebaseObject(nref);

                } else {
                    console.log("Client unauthenticated.");
                    //$location.path('/login');
                }
            });

        }])


    .controller("ProfileCtrl", ["$scope", "$state", "$firebaseObject", "$firebaseArray", "$stateParams","$location",
        function ($scope, $state, $firebaseObject, $firebaseArray, $stateParams,$location) {
            $scope.$state = $state;

            $scope.ratingModel = [
                {id: 1, rating: '入門'},
                {id: 2, rating: '中級'},
                {id: 3, rating: '高級'}];

            var ref = new Firebase("https://amber-heat-6612.firebaseio.com");
            var authData = ref.getAuth();
            $scope.authData = authData;
            if (!$scope.authData){
                $state.go('login');
            }

            console.log(authData.uid);

            var nref = ref.child("users").child(authData.uid);
            $scope.rentry = $firebaseObject(nref);
            //已經three-way-binding 就不用再submit 資料了
            $scope.rentry.$bindTo($scope, "user");

            $scope.rentry.$loaded()
                .then(function() {
                    console.log($scope.user);
                })
                .catch(function(err) {
                    console.error(err);
                });

            // create a synchronized array
            var nnref = ref.child("users").child(authData.uid).child("talents");
            var unref = ref.child("users").child(authData.uid).child("urls");

            // create a synchronized array
            $scope.talents = $firebaseArray(nnref);
            $scope.urls = $firebaseArray(unref);

            console.log($scope.talents);
            $scope.addTalent = function () {
                console.log("Start to add talents");
                console.log($scope.talents);
                $scope.talents.$add({
                    talent: $scope.talentnew,
                    intro: $scope.intro, rating: $scope.rate.rating
                });
                $scope.talentnew = '';
                $scope.intro = '';
                $scope.rate = null;
            };

            //加入我的網站連結
            $scope.addUrl = function () {
                console.log("Start to add url");
                console.log($scope.urls);
                $scope.urls.$add({
                    name: $scope.urlname,
                    url: $scope.url
                });
                $scope.urlname = '';
                $scope.url = '';
            };

            $scope.updateTalent = function (data, index,select) {
                console.log(index,data);
                console.log("Start to update talents");
                console.log($scope.talents[index].$id);
                var item = $scope.talents.$getRecord($scope.talents[index].$id);
                item[select] = data;
                $scope.talents.$save(item).then(function(){});
            };
        }])

    .controller("ProfileDetailCtrl", ["$scope", "Entry", "$modal", "$stateParams",
        function ($scope, Entry, $modal, $stateParams) {
            console.log( $stateParams.proId);
            var users = Entry.get({id: "users/"+ $stateParams.proId}).$promise;
            users.then(function onSuccess(response) {
                $scope.user = response.toJSON();
                console.log( $stateParams.proId);
            });

        }])

    .directive('ckEditor', function() {
        return {
            require: '?ngModel',
            link: function(scope, elm, attr, ngModel) {
                var ck = CKEDITOR.replace(elm[0]);

                if (!ngModel) return;

                ck.on('pasteState', function() {
                    scope.$apply(function() {
                        ngModel.$setViewValue(ck.getData());
                    });
                });

                ngModel.$render = function(value) {
                    ck.setData(ngModel.$viewValue);
                };
            }
        };
    })

    .controller("EduCtrl", ["$scope", "Entry", "$modal",
        function ($scope, Entry, $modal) {
            var users = Entry.get({id: "users"}).$promise;
            users.then(function onSuccess(response) {
                $scope.users = response.toJSON();
            });
            //var bodyRef = angular.element( $document[0].body );
            var bodyRef = angular.element(document.querySelector('#myModalcontent'));
            $scope.open = function (user) {
                bodyRef.addClass('ovh');

                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'views/modal-profile.html',
                    controller: 'ModalInstanceCtrl',
                    size: 'lg',
                    resolve: {
                        user: function () {
                            return user;
                        }
                    }
                });

                modalInstance.result.then(function (user) {
                    bodyRef.removeClass('ovh');
                    $scope.user = user;
                }, function () {
                    bodyRef.removeClass('ovh');
                    //console.info('Modal dismissed at: ' + new Date());
                });
            };

        }])

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, user) {

        $scope.user = user;
        $scope.ok = function () {
            $modalInstance.close();
        };
    })

    .controller("JobDetailCtrl", ["$scope", "$stateParams", "$firebaseObject", "$firebaseArray","Auth",
        function ($scope, $stateParams, $firebaseObject,$firebaseArray, Auth) {
            console.log( $stateParams.jobId);
            var ref = new Firebase("https://amber-heat-6612.firebaseio.com/jobs");
            var nref = ref.child( $stateParams.jobId);
            $scope.rentry = $firebaseObject(nref);
            $scope.rentry.$bindTo($scope, "entry");


            //Handling Asynchronous Operations
            $scope.rentry.$loaded()
                .then(function() {
                    //console.log($scope.entry);
                    try {if ($scope.authData.uid == $scope.entry.posterId)  {
                        $scope.isPoster = true;
                        console.log("isPoster: "+$scope.isPoster);
                    }}
                    catch (err){
                        console.log("Not login");
                        $scope.isPoster = false;
                    }

                })
                .catch(function(err) {
                    console.error(err);
                });
            $scope.jobId = $stateParams.jobId;

            function getName(authData) {
                switch (authData.provider) {
                    case 'google':
                        return authData.google.displayName;
                    case 'facebook':
                        return authData.facebook.displayName;
                }
            }

            function getPicture(authData) {
                switch (authData.provider) {
                    case 'google':
                        return authData.google.cachedUserProfile.picture;
                    case 'facebook':
                        return 'https://graph.facebook.com/' + authData.facebook.id + '/picture?width=150&height=150';
                }
            }




            var cref = nref.child('comments');

            // GET MESSAGES AS AN ARRAY
            $scope.comments = $firebaseArray(cref);
            $scope.auth = Auth;
            $scope.auth.$onAuth(function (authData) {
                $scope.authData = authData;
                if ($scope.authData) {
                    $scope.comments.poster = getName(authData);
                    $scope.comments.posterPicture = getPicture(authData);
                    $scope.comments.posterId = authData.uid;

                    console.log($scope.comments.posterId);
                }
            });
            //ADD MESSAGE METHOD
            $scope.addComments = function(e) {
                console.log($scope.newcomment);
                console.log(e.keyCode);

                //LISTEN FOR RETURN KEY
                if (e.keyCode === 13 && $scope.newcomment) {
                    $scope.comments.$add({
                        from: $scope.comments.poster,
                        picture:$scope.comments.posterPicture,
                        posterId:$scope.comments.posterId,
                        time: new Date().getTime(),
                        body: $scope.newcomment
                    });

                    //RESET MESSAGE
                    $scope.comment = "";
                }
            };

            $scope.updateComment = function (data, index,select) {
                console.log(index,data);
                console.log("Start to update comment");
                //console.log($scope.comments[index].$id);
                var item = $scope.comments.$getRecord($scope.comments[index].$id);
                item[select] = data;
                $scope.comments.$save(item).then(function(){});
            };

            $scope.removeJob = function(){
                nref.remove();
            }
        }])

    .controller("editJobDetailCtrl", ["$scope", "$stateParams", "$firebaseObject", "$location",
        function ($scope, $stateParams, $firebaseObject,$location) {
            console.log( $stateParams.jobId);
            var ref = new Firebase("https://amber-heat-6612.firebaseio.com/jobs");
            var nref = ref.child( $stateParams.jobId);
            $scope.rentry = $firebaseObject(nref);
            //已經three-way-binding 就不用再submit 資料了
            $scope.rentry.$bindTo($scope, "entry");
            var authData = ref.getAuth();
            $scope.authData = authData.uid;

            //Handling Asynchronous Operations
            $scope.rentry.$loaded()
                .then(function() {
                    console.log($scope.entry);
                    if ($scope.authData == $scope.entry.posterId)  {
                        $scope.isPoster = true;
                    }
                })
                .catch(function(err) {
                    console.error(err);
                });
            console.log($scope.authData);
            $scope.submit = function () {
                var now = new Date().getTime();
                $scope.entry.edittime = now;
                console.log("job edited");
                return $location.path("/job"), !1
            };
        }])

    .controller("newJobCtrl", ["$scope", "$firebaseArray", "$location", "Auth", function ($scope, $firebaseArray, $location,Auth) {
        var ref = new Firebase("https://amber-heat-6612.firebaseio.com/jobs");
        $scope.jobtypes = jobtypes;
        //$scope.needfix = false;
        $scope.newjob = {};
        //$scope.user = null;
        $scope.jobtype = "";
        $scope.jobs = [];
        $scope.$watch('newjob.jobtype', function (v) {
            if ($scope.newjob.jobtype) {
                $scope.jobs = $scope.newjob.jobtype.jobs;
                return console.log($scope.newjob.jobtype.jobs);
            }
        });
        $scope.njobs = $firebaseArray(ref);

        function getName(authData) {
            switch (authData.provider) {
                case 'google':
                    return authData.google.displayName;
                case 'facebook':
                    return authData.facebook.displayName;
            }
        };

        function getPicture(authData) {
            switch (authData.provider) {
                case 'google':
                    return authData.google.cachedUserProfile.picture;
                case 'facebook':
                    return 'https://graph.facebook.com/' + authData.facebook.id + '/picture?width=150&height=150';
            }
        };


        $scope.auth = Auth;
        $scope.auth.$onAuth(function (authData) {
            $scope.authData = authData;
            if ($scope.authData) {
                $scope.newjob.poster = getName(authData);
                $scope.newjob.posterPicture = getPicture(authData);
                $scope.newjob.posterId = authData.uid;

                console.log($scope.newjob.posterId);
            }
            else {
                $location.path('/login');
            }
        });

        $scope.submit = function () {
            var now = new Date().getTime();
            $scope.newjob.time = now;
            //console.log($scope.newjob);
            //console.log($scope.newjob.jobtype);
            delete $scope.newjob.jobtype.jobs;
            //console.log($scope.newjob.jobtype);
            $scope.njobs.$add($scope.newjob);
            console.log("job added");
            return $location.path("/job"), !1
        };

    }])



    .controller('newBusCtrl', ["$scope", "$firebaseArray", "$location", "Auth", function ($scope, $firebaseArray, $location,Auth) {
        var ref = new Firebase("https://amber-heat-6612.firebaseio.com/businesses");
        $scope.bus = $firebaseArray(ref);
        $scope.newbus= new Object;

        function getName(authData) {
            switch (authData.provider) {
                case 'google':
                    return authData.google.displayName;
                case 'facebook':
                    return authData.facebook.displayName;
            }
        };

        function getPicture(authData) {
            switch (authData.provider) {
                case 'google':
                    return authData.google.cachedUserProfile.picture;
                case 'facebook':
                    return 'https://graph.facebook.com/' + authData.facebook.id + '/picture?width=150&height=150';
            }
        };

        $scope.auth = Auth;
        $scope.auth.$onAuth(function (authData) {
            $scope.authData = authData;
            if ($scope.authData) {
                $scope.newbus.poster = getName(authData);
                $scope.newbus.posterPicture = getPicture(authData);
                $scope.newbus.posterId = authData.uid;

                console.log($scope.newbus.posterId);
            }
            else{
                $location.path('/login');
            }
        });

        $scope.submit = function () {
            var now = new Date().getTime();
            $scope.newbus.time = now;
            console.dir($scope.newbus)

            $scope.bus.$add($scope.newbus);
            console.log("New business added");
            return $location.path("/business"), !1
        };

    }])

    .controller('BusCtrl', ["$scope", "$firebaseArray", "$firebaseObject", "$location", "Auth",
        function ($scope, $firebaseArray,$firebaseObject, $location,Auth) {
        var ref = new Firebase("https://amber-heat-6612.firebaseio.com/businesses");
        $scope.buses = $firebaseArray(ref);

        $scope.auth = Auth;
        $scope.auth.$onAuth(function (authData) {
            $scope.authData = authData;
            if ($scope.authData) {
                //這邊 onAuth 得到的資料是fb 來的，並不是firbase 裡面的資料
                var nref = ref.parent().child("users").child($scope.authData.uid);

                // create a synchronized array
                $scope.user = $firebaseObject(nref);

            } else {
                console.log("Client unauthenticated.");
                //$location.path('/login');
            }
        });

    }])

    .controller("BusDetailCtrl", ["$scope", "$stateParams", "$firebaseObject", "$firebaseArray","Auth",
        function ($scope, $stateParams, $firebaseObject,$firebaseArray,Auth) {
            console.log( $stateParams.busId);
            var ref = new Firebase("https://amber-heat-6612.firebaseio.com/businesses");
            var nref = ref.child( $stateParams.busId);
            $scope.rentry = $firebaseObject(nref);
            $scope.rentry.$bindTo($scope, "entry");
            var authData = ref.getAuth();
            try {$scope.authData = authData.uid}
            catch (err){
                console.log("Not login");
            };


            //Handling Asynchronous Operations
            $scope.rentry.$loaded()
                .then(function() {
                    console.log($scope.entry);
                    console.warn($scope.authData);
                    console.warn($scope.entry.posterId);
                    if ($scope.authData === $scope.entry.posterId)  {
                        console.log("$scope.authData === $scope.entry.posterId");
                        $scope.isPoster = true;
                    }
                })
                .catch(function(err) {
                    console.error(err);
                });
            console.log($scope.authData);
            $scope.busId = $stateParams.busId;
            console.log($scope);
            //console.log($scope.entry.poster);


            function getName(authData) {
                switch (authData.provider) {
                    case 'google':
                        return authData.google.displayName;
                    case 'facebook':
                        return authData.facebook.displayName;
                }
            }

            function getPicture(authData) {
                switch (authData.provider) {
                    case 'google':
                        return authData.google.cachedUserProfile.picture;
                    case 'facebook':
                        return 'https://graph.facebook.com/' + authData.facebook.id + '/picture?width=150&height=150';
                }
            }




            var cref = nref.child('comments');

            // GET MESSAGES AS AN ARRAY
            $scope.comments = $firebaseArray(cref);
            $scope.auth = Auth;
            $scope.auth.$onAuth(function (authData) {
                $scope.authData = authData;
                if ($scope.authData) {
                    $scope.comments.poster = getName(authData);
                    $scope.comments.posterPicture = getPicture(authData);
                    $scope.comments.posterId = authData.uid;

                    console.log($scope.comments.posterId);
                }
            });
            //ADD MESSAGE METHOD
            $scope.addComments = function(e) {
                //LISTEN FOR RETURN KEY
                if (e.keyCode === 13 && $scope.comment) {
                    $scope.comments.$add({
                        from: $scope.comments.poster,
                        picture:$scope.comments.posterPicture,
                        posterId:$scope.comments.posterId,
                        time: new Date().getTime(),
                        body: $scope.comment
                    });

                    //RESET MESSAGE
                    $scope.comment = "";
                }
            };

            $scope.updateComment = function (data, index,select) {
                console.log(index,data);
                console.log("Start to update comment");
                //console.log($scope.comments[index].$id);
                var item = $scope.comments.$getRecord($scope.comments[index].$id);
                item[select] = data;
                $scope.comments.$save(item).then(function(){});
            };


            $scope.removeBus = function(){
                nref.remove();

            }
        }])

    .controller("editBusCtrl", ["$scope", "$stateParams", "$firebaseObject", "$location",
        function ($scope, $stateParams, $firebaseObject,$location) {
            console.log( $stateParams.busId);
            var ref = new Firebase("https://amber-heat-6612.firebaseio.com/businesses");
            var nref = ref.child( $stateParams.busId);
            $scope.rentry = $firebaseObject(nref);
            //已經three-way-binding 就不用再submit 資料了
            $scope.rentry.$bindTo($scope, "entry");
            var authData = ref.getAuth();
            $scope.authData = authData.uid;

            //Handling Asynchronous Operations
            $scope.rentry.$loaded()
                .then(function() {
                    console.log($scope.entry);
                    if ($scope.authData == $scope.entry.posterId)  {
                        $scope.isPoster = true;
                    }
                })
                .catch(function(err) {
                    console.error(err);
                });
            console.log($scope.authData);
            $scope.submit = function () {
                var now = new Date().getTime();
                $scope.entry.edittime = now;
                console.log("bus edited");
                return $location.path("/business"), !1
            };
        }])

    .filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }])

    .filter('nl2br', function ($sce) {
        return function (text) {
            return text ? $sce.trustAsHtml(text.replace(/\n/g, '<br/>')) : '';
        };
    })

    .filter('toArray', function () {
        return function (obj, addKey) {
            if (!(obj instanceof Object)) {
                return obj;
            }

            if (addKey === false) {
                return Object.values(obj);
            } else {
                return Object.keys(obj).map(function (key) {
                    return Object.defineProperty(obj[key], '$key', {enumerable: false, value: key});
                });
            }
        };
    })

    .filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';
            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;
            value = value.replace(/<[^>]+>/gm, '').substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    value = value.substr(0, lastspace);
                }
            }
            return value + (tail || ' …');
        };
    });
