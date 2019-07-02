(function(angular){

    var app=angular.module("app");

    angular.module('app').controller("loginController",loginController);

    loginController.$inject=['$scope','$http','$rootScope','getData'];


    function loginController($scope,$http,$rootScope,getData){


        $scope.password="";
        $scope.email="";
        $scope.errorMessage="";

        $scope.errorMessageEmail="this is test";




        $scope.login=function(){

        
            getData.login($scope,$scope.email,$scope.password).then(function(data){

                if(data){

                    var getUrl = window.location;
                    var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
                    window.location.href=baseUrl+"/setup.html?key="+data.callbackId+"&name="+data.name;
                }
                else
                {
                        alert("something went wrong please try after sometime");
                        $scope.errorMessage="Emaild or Password is not matched, please try again";
                }


            }).catch(e=>{
                $scope.errorMessage="something went wrong please try after sometime";
                alert("something went wrong please try after sometime");
            });

        }

      


    }


})(angular);