
(function(angular){

  

    angular.module('app').controller("setupcontroller",setupcontroller);

    setupcontroller.$inject=['$scope','$http','$rootScope','getData','setupservice'];

    function setupcontroller($scope,$http,$rootScope,getData,setupservice){



        sc=this;
        let searchParams = new URLSearchParams(window.location.search);

        let param = searchParams.get('key');
        sc.username=searchParams.get('name');
        sc.message="";
        sc.heading="";
        sc.class="";

        sc.data={};
   



       setupservice.getConfiguration($scope,param).then(function(data){


        if(data.error){
        
            sc.message="No Configuration found";
            sc.heading="Error";
            sc.class="alert-danger";
            return;
        }


                sc.data=data.config;
                sc.data.webhooks={};


                var url=window.location;
        
                sc.data.webhooks.inbound=url.origin+"/webhook/inbound-message/"+sc.data.callbackId;
                sc.data.webhooks.event=url.origin+"/webhook/inbound-status/"+sc.data.callbackId;
                sc.data.webhooks.outbound=url.origin+"/webhook/outbound/"+sc.data.callbackId;
                $scope.$apply();



       }).catch(function(err){

        sc.message=err;
        sc.heading="Error";
        sc.class="alert-danger";
           
       })

     
      
       sc.savefreshdesk=function(){

      
        if(sc.data.freshDesk.User==undefined||sc.data.freshDesk.User==""){

         
            return;
        }
      


        if(sc.data.freshDesk.BaseUrl==undefined||sc.data.freshDesk.BaseUrl==""){

         
            return;
        }
        setupservice.saveFreshdesk($scope,sc.data.freshDesk,param).then(function(data){

            if(data.status==200){
                sc.message="Configuration is saved successfully";
                sc.heading="Saved";
            sc.class="alert-success";
            }

        }).catch(function(err){

            alert(err);

        })

       }
       sc.saveNexmo=function(){
       
        if(sc.data.nexmo.API_KEY==undefined||sc.data.nexmo.API_KEY==""){

         
            return;
        }
    
        if(sc.data.nexmo.API_SECRET==undefined||sc.data.nexmo.API_SECRET==""){

         
            return;
        }
       
        if(sc.data.nexmo.APP_ID==undefined||sc.data.nexmo.APP_ID==""){

         
            return;
        }
      

        
        if(sc.data.nexmo.APP_ID==undefined||sc.data.nexmo.APP_ID==""){

         
            return;
        }

        
        if(sc.data.nexmo.PRIVATE_KEY_PATH==undefined||sc.data.nexmo.PRIVATE_KEY_PATH==""){

         
            return;
        }

        if(sc.data.nexmo.VIRTUAL_NUMBER==undefined||sc.data.nexmo.VIRTUAL_NUMBER==""){

         
            return;
        }


        setupservice.saveNexmo($scope,sc.data.nexmo,param).then(function(data){

            if(data.status==200){
                alert("Nexmo Configuration saved")
            }

        }).catch(function(err){

            alert(err);

        });
        


       }
       sc.saveAppConfig=function(){
      
        setupservice.saveAppConfig($scope,sc.data.appconfig,param).then(function(data){

            if(data.status==200){
                alert("App Configuration saved")
            }

        }).catch(function(err){

            alert(err);

        });
        


       }



       sc.saveAll=function(){


        if(sc.data.freshdesk.User==undefined||sc.data.freshdesk.User==""){

         
            return;
        }
      


        if(sc.data.freshdesk.BaseUrl==undefined||sc.data.freshdesk.BaseUrl==""){

         
            return;
        }


        if(sc.data.NexmoConfig.API_KEY==undefined||sc.data.NexmoConfig.API_KEY==""){

         
            return;
        }
    
        if(sc.data.NexmoConfig.API_SECRET==undefined||sc.data.NexmoConfig.API_SECRET==""){

         
            return;
        }
       
        if(sc.data.NexmoConfig.APP_ID==undefined||sc.data.NexmoConfig.APP_ID==""){

         
            return;
        }
      

        
        if(sc.data.NexmoConfig.APP_ID==undefined||sc.data.NexmoConfig.APP_ID==""){

         
            return;
        }

        
        if(sc.data.NexmoConfig.PRIVATE_KEY_PATH==undefined||sc.data.NexmoConfig.PRIVATE_KEY_PATH==""){

         
            return;
        }

        if(sc.data.NexmoConfig.VIRTUAL_NUMBER==undefined||sc.data.NexmoConfig.VIRTUAL_NUMBER==""){

         
            return;
        }


        setupservice.saveConfig($scope,sc.data).then(function(data){

            if(data.message==1){
                sc.message="Configuration is saved successfully";
                sc.heading="Saved";
                sc.class="alert-success";
            }
            else
            {
                sc.message="Failed to save configuration";
                sc.heading="Error";
                sc.class="alert-danger";
            }

            $scope.$apply();

        }).catch(function(err){

                 sc.message=err;
                sc.heading="Error";
                sc.class="alert-danger";

        });
        


       }


    }


})(angular);