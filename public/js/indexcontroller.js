(function(angular){

    var app=angular.module("app");

    angular.module('app').controller("indexController",indexController);

    indexController.$inject=['$scope','$http','$rootScope','getData'];
    function indexController($scope,$http,$rootScope,getData){

        $scope.name="";
        $scope.email="";
        $scope.password="";
        $scope.cpassword="";
        $scope.errorMessage="";
        $scope.isValid=false;
        var ic=this;


        $scope.isUnique=function(){

            getData.emailIdIsUnique($scope,$scope.email).then(function(data){

                if(data.isexists==false){
                    $scope.isValid=true;
                    $("#email").removeClass("is-invalid");
                    $("#email").addClass("is-valid");
                    $scope.errorMessage="";
                    //var getUrl = window.location;
                    //var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
                    //window.location.href=baseUrl+"/login.html"
                }
                else
                {    
                    $scope.isValid=false;
                    $scope.errorMessage="EmailId is already taken";
                    $("#email").addClass("is-invalid");
                    $("#email").removeClass("is-valid");
                
                    $("#email").focus();
                   
                }
    
              
    
            }).catch(function(e){
    
                $scope.errorMessage="";
               $("#email").focus();
    
            });

        }

      

       
        // $scope.signup=function(){


        //     if($scope.password==""){

        //         $scope.errorMessage="Password required";
        //         $("#password").focus();
        //         return;
        //     }
        //     else
        //     if($scope.password!=$scope.cpassword){
        //         $scope.errorMessage="Password not matched";
        //         $("#cpassword").focus();
        //         return;
        //     }
        //     else
        //     {

        //         getData.newpassword($scope,$scope.password).then(function(data){

        //             if(data.status==201){

        //               //  var getUrl = window.location;
        //                // var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
        //               //  window.location.href=baseUrl+"/login.html"

        //             }
        //             else
        //             {

        //             }
        //             $scope.errorMessage="Could not able to create password, please try again";
                   
                    

        //         }).catch(function(err){

        //             $scope.errorMessage=err;

        //         });

        //     }

          
        // }





        $scope.signup=function(){


          
          
            if($scope.password!=$scope.cpassword){
                $scope.errorMessage="Password not matched";
                $("#cpassword").focus();
                return;
            }
            else
            {

                getData.newAccount($scope).then(function(data){

                    if(data.message>0){


                       var getUrl = window.location;
                       var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
                       window.location.href=baseUrl+"/login.html?message=new account is created,please login to continue&name="+$scope.name;
                    

                    }
                    else
                    {
                        $scope.errorMessage="Could not able to create password, please try again";
                    }
                  
                   
                    

                }).catch(function(err){

                    $scope.errorMessage=err;

                });

            }

          
        }
        
     }

})(angular);