(function(angular){

    var app=angular.module("app");

    angular.module('app').controller("helpController",helpController);

    helpController.$inject=['$scope','$http','$rootScope','helpservice'];
    function helpController($scope,$http,$rootScope,helpservice){

        $scope.faqs=new Array();
        $scope.troubleshoot=new Array();
       


        $scope.getData=function(){

            helpservice.helpdata($scope,$scope.email).then(function(data){

               $scope.faqs=data.faqs;
               $scope.troubleshoot=data.troubleshoot;
               $scope.$apply();
    
              
    
            }).catch(function(e){
    
                $scope.errorMessage="";
              
    
            });

        }

      

       $scope.getData();
        




       
        
     }

})(angular);