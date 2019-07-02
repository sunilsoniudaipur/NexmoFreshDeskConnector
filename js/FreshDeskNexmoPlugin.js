var freshDesk=require('./freshdesk');
var nexmo=require('./nexmoManager');
//var Store=require('data-store');
var jsonFile=require('jsonfile');
//var store=new Store({path:'data/sessions.json'});
var dbHelper=require("./dbhelper");
var currentSessions={};
var showDebugMessage=true;
var MAX_OPTIONS=3;




//these states are only used for retry purpose
var STATE_CONFIRMATION=2;
var STATE_OPTIONS=3;
var STATE_DEFAULT=1;

var CMD_YES="yes";
var CMD_NO="no";
var CMD_A="a";
var CMD_B="b";
var CMD_C="c";
var CMD_D="d";
var CMD_N="n";
var CMD_M="m";
var CMD_x="x";
var CMD_NEW="new";
var CMD_OPEN="open";
var CMD_REPLY="reply";
var CMD_STATUS="status";
var CMD_HELP="help";
var CMD_CANCEL="cancel";


var FLOW_CMD_STATUS="status";
var FLOW_CMD_NEW="new";
var FLOW_CMD_OPTION="option";
var FLOW_CMD_CONFIRMATION="confirmation";
var FLOW_CMD_REPLY="confirmation";
var FLOW_CMD_HELP="help";
var FLOW_CMD_OPEN="open";


var MESSAGE_TYPE_SMS="phone";
var MESSAGE_TYPE_WHATSAPP="messanger";
var MESSAGE_TYPE_FACEBOOK="messanger";
var MESSAGE_TYPE_VIBER="messanger";
var MESSAGE_TYPE_MMS="mms";
var init=(sessions)=>{

    currentSessions=sessions;
    //freshDesk.InitConfig();
    //nexmo.InitConfig();

}

/**
 * 
 * @param {*The message to be format} message 
 * @param {*the ticket object which information to be replaced} ticket 
 */
var ProcessMessageTemplate=(message,ticket)=>{


    console.log("This is ticket processing");
    console.log(ticket);
   
    if(ticket==null||ticket==undefined){
        return message;
    }
    message=message.replace(/{ticket.id}/g,ticket.id);
    message=message.replace(/{ticket.status}/g,getStatusText(ticket.status));
    message=message.replace(/{ticket.subject}/g,ticket.subject);
    message=message.replace(/{ticket.created_at}/g,ticket.created_at);

   return message;
}


/**
 * 
 * @param {*status in integer} status
 * @description this fuctions will convert status from numerical value to human readable format 
 */
var getStatusText=(status)=>{



    if(status==undefined){
        return "Open";
    }
    switch(status){


        case 2:return "Open";
        case 3: return "Pending";
        case 4: return "Resolved";
        case 5: return "Closed";
        case 6: return "Waiting on customer";
        case 7: return "Waiting on third party";
        default :return "Open";
        
        


    }


}

/**
 * 
 * @param {*message to be print on console} message 
 * @param {*type is string type values like error, info, debug} type 
 */
var DebugMessage=(message,type)=>{


    if(type==null||type==undefined){
        type="error";
    }
    if(showDebugMessage==false)
    return;
    
    switch(type.toLowerCase()){

    case "info":console.info(message);break;
    case "error":console.error(message);break;
    case "debug":console.debug(message);break;
    default: console.log(message);



    }
   
   
}



/**
 * 
 * @param {User object} user 
 * @param {*message received from any channel} message 
 * @param {*callback which will be used to send information back in case of testing} callback 
 * @param {*its a channel name} replyVia 
 */
var onReceived=(user,message,callback,replyVia)=>{


    try{

    user.lastState.replyVia=replyVia;
    var AppConfig=user.serverConfig.AppSettings;
    if(message==undefined||message==null||message==""){
        callback("Message text cannot be empty");
        return;
    }
  
  

    var m=message.toLowerCase();

    if(m=="cancel"||m=="exit"){
        //callback("Reset the user state");
        user.lastState.status=STATE_DEFAULT;
        user.lastState.retry=0;
        SendToUser(user,"cancelled, you can start new converstation.",function(err,data){

            callback(err,data);

        })
        return;
    }
     if(user.lastState.status==STATE_CONFIRMATION){


        if((m==CMD_YES||m==CMD_NO)){

            user.lastState.retry=0;
            user.currentState=FLOW_CMD_CONFIRMATION;
            ProcessConfirmation(user,message,callback);
      
      
        }
        else
        {
            user.lastState.status=STATE_DEFAULT;
            onReceived(user,message,callback,replyVia);
        // 
        //     if(user.lastState.retry==null||user.lastState.retry==undefined){
        //         user.lastState.retry=1;
        //         SendToUser(user,"Please try agian \n"+user.lastState.lastMessage,function(err,data){

        //             callback(err,data);
        //         });
        //       //  callback(null,"Please try agian \n"+user.lastState.lastMessage);
             
               
        //     }
        //     else
        //     {
        //         user.lastState.retry++;
            
        //         if(user.lastState.retry>=AppConfig.MaxOptionRetry)
        //         {
    
        //             var message=AppConfig.Messages.ExceedRetry.replace("{count}",user.lastState.retry);
        //             SendToUser(user,message,function(err,data){

        //                 callback(err,data);

        //             });
        //             user.lastState.status=STATE_DEFAULT;
        //             user.lastState.retry=0;
                   
        //         }
        //         else
        //         {
        //             SendToUser(user,"Please try agian \n"+user.lastState.lastMessage,function(err,data){

        //                 callback(err,data);
        //             });
        //             //callback(null,"Please try agian \n"+user.lastState.lastMessage);
        //         }
               
        //     }
            

          

        }
        DebugMessage("confirmation received: "+m,"info");
      
    }
    else
    if(user.lastState.status==STATE_OPTIONS){


        if((m==CMD_A||m==CMD_B||m==CMD_C||m==CMD_D||m==CMD_M||m==CMD_N)){

            DebugMessage("Option received: "+m,"info");
            user.currentState=FLOW_CMD_OPTION;
            user.lastState.retry=0;
            ProcessOptions(user,m,callback);
        }
        else
        {
          
            user.lastState.status=STATE_DEFAULT;
            onReceived(user,message,callback,replyVia);
            return;
        }
     

    }

    else 
    {
        var arr=message.split(" ");

        if(arr[0].toLowerCase()=="help"){


            user.currentState=FLOW_CMD_HELP;
            SendToUser(user,AppConfig.Messages.Help,function(err,data){
                callback(err,data);
            });
          

            return;

        }
        else
        if(arr[0].toLowerCase()=="open"){


            user.currentState=FLOW_CMD_OPEN;
            checkOpenTickets(user,callback);
            return;

        }
        else
        if(arr[0].toLowerCase()=='status'){

           // user.currentState=FLOW_CMD_OPEN;
           // checkOpenTickets(user,callback);
            
            if(message=='status'){

                //need to show open tickts

                user.currentState=FLOW_CMD_STATUS;
                if(user.lastState.ticket==undefined){
                    console.log("last ticket not found");
                    checkOpenTickets(user,callback);
                    return;
                }
                else
                {

                    var ticketId=user.lastState.ticket.id;
                    user.lastState.statusOf=user.lastState.ticket.id;
                    console.log(user.lastState.ticket);
                    freshDesk.GetAllTickets("requester_id="+user.profile.id,user.serverConfig.freshdesk,function(err,ticketsRaw){


                        var tickets=JSON.parse(ticketsRaw);
                        if(tickets.length==0){
                           
                            SendToUser(user,AppConfig.Messages.NoTicketsFound+AppConfig.Messages.FixedMessage,function(err,data){
                                callback(null,AppConfig.Messages.NoTicketsFound);
                            });
                        }

                        var currentTicket=null;
                        for(var i=0;i<tickets.length;i++){


                            if(ticketId==tickets[i].id){
                                currentTicket=tickets[i];
                                break;
                            }

                        }
                       
                        if(currentTicket==null||currentTicket==undefined){
                            SendToUser(user,"No tickets were found for the given Ticket Id",function(err,data){
                                callback(null,"No tickets were found for the given Ticket Id");
                            }); 
                            return;
                        }
                        user.lastState.ticket=currentTicket;
                      //  store.set(user.id+"",user);
                        var message=ProcessMessageTemplate(AppConfig.Messages.TicketStatus,user.lastState.ticket);//"your ticket titled as "+currentTicket.subject+" and status is "+getStatusText(currentTicket.status)+" ";
                        SendToUser(user,message+AppConfig.Messages.FixedMessage,function(err,data){
                            callback(null,message);
                        });
                      
                        //here we need to check the ticket with id



                });
                
                
                    //check the status of the last ticket
                
                }

            }
            else
            {

                var arr=message.split(" ");

                var ticketId=arr[1];
                if(ticketId==undefined)
                {
                    checkOpenTickets(user,callback);
                    return;
                }
                ticketId=ticketId.replace("#",'');
                user.lastState.statusOf=ticketId;

                freshDesk.GetAllTickets("requester_id="+user.profile.id,user.serverConfig.freshdesk,function(err,ticketsRaw){


                        var tickets=JSON.parse(ticketsRaw);
                        if(tickets.length==0){
                           
                            SendToUser(user,AppConfig.Messages.NoTicketsFound+AppConfig.Messages.FixedMessage,function(err,data){
                                callback(null,AppConfig.Messages.NoTicketsFound);
                            });
                        }

                        var currentTicket=null;
                        for(var i=0;i<tickets.length;i++){


                            if(ticketId==tickets[i].id){
                                currentTicket=tickets[i];
                                break;
                            }

                        }
                       
                        if(currentTicket==null||currentTicket==undefined){
                            SendToUser(user,"No tickets were found for the given Ticket Id",function(err,data){
                                callback(null,"No tickets were found for the given Ticket Id");
                            }); 
                            return;
                        }
                        user.lastState.ticket=currentTicket;
                      //  store.set(user.id+"",user);
                        var message=ProcessMessageTemplate(AppConfig.Messages.TicketStatus,user.lastState.ticket);//"your ticket titled as "+currentTicket.subject+" and status is "+getStatusText(currentTicket.status)+" ";
                        SendToUser(user,message+AppConfig.Messages.FixedMessage,function(err,data){
                            callback(null,message);
                        });
                      
                        //here we need to check the ticket with id



                });

                return;

                //ticket might contains the ticket id


            

        }
    }
        else
        if(arr[0].toLowerCase()=='reply'){

            //here we only add the reply to last ticket
            message=message.replace(arr[0].toLowerCase(),'');


            user.currentState=FLOW_CMD_REPLY;

            if(message==""||message==undefined){
            SendToUser(user,"Please send reply <your message> to add reply on last ticket",function(err,data){

                callback(null,message);
            

            });
            return;
            }

            freshDesk.AddReplyToTicket(user.lastState.ticket.id,message,user.profile.id,user.serverConfig.freshdesk,function(err,data){


                if(err){

                    callback(err);
                    return;

                }
                else
                {

                    var message=AppConfig.Messages.CommentAdded;
                    message=ProcessMessageTemplate(message,user.lastState.ticket)
                   // var message="your reply is added to ticket id #"+user.lastState.ticket.id+" titled as "+user.lastState.ticket.subject
                    SendToUser(user,message+AppConfig.Messages.FixedMessage,function(err,data){

                        callback(null,message);
                    

                    });
                }




            });

            return;
           
        }
        
        else {


            console.log("New Command "+message);
            //this is the default case
            if(arr[0].toLowerCase()=='new')
            {
               message= message.replace(arr[0],"");
               user.currentState=FLOW_CMD_NEW;
               var subject="";
               var Description=message;

               if(arr.length>=5){
                subject+=arr[0]+" "+arr[1]+" "+arr[2]+" "+arr[3]+" "+arr[4];
                }
                else
                {
                    Description=message;
                    subject=message;
                }
                user.lastState.message=Description;
                user.lastState.subject=subject;
                CreateNewTicket(user,callback);
               
            }
            else
            {
              
                var subject="";
                var Description=message;
                if(arr.length>=5){
                    subject+=arr[0]+" "+arr[1]+" "+arr[2]+" "+arr[3]+" "+arr[4];
                }
                else
                {
                    Description=message;
                    subject=message;
                }
               user.lastState.message=Description;
                user.lastState.subject=subject;
             ProcessMessage(user,subject,Description,callback,replyVia);
            }
    

           
           
         
          
            
         
           
          
            DebugMessage(subject,"info");

        }
        
        

    }
    

    //check message

}
    catch(err){
            console.error(err);
        }
    return;


}
var onReceiveWhatsappMessage=(contactno,message,callbackId,callback)=>{


    getUser(contactno,"phone",callbackId,function(err,user){


        if(err){
            DebugMessage("Error in onWhatsapp Receive","error");
            DebugMessage(err,"error");
            callback(err);
            return;
        }

        user.lastMessageReceivedOn=new Date();

        onReceived(user,message,callback,"whatsapp");


    });

   

}

var onReceiveFacebookMessage=(userid,message,callbackId,callback)=>{


    getUser(userid,"facebook",callbackId,function(err,user){


        if(err){
            DebugMessage("Error in Facebook Receive","error");
            DebugMessage(err,"error");
            callback(err);
            return;
        }


        onReceived(user,message,callback,"facebook");


    });

   

}



/**
 * 
 * @param {Phone number of the customer} contactno 
 * @param {*incoming message text} message 
 * @param {*a callback to send confirmation back to nexmo that message is successfully deliverd or not} callback 
 */
var onReceiveSMS=(contactno,message,callbackId,callback)=>{
 

    getUser(contactno,"phone",callbackId,function(err,user){


        if(err){
            DebugMessage("Error in onWhatsapp Receive","error");
            DebugMessage(err,"error");
            callback(err);
            return;
        }
        

        onReceived(user,message,callback,"sms");


    });

   
   
}


//**
 
 /* @param {*} key 
 * @param {*} keyType 
 * @param {*} callbackId 
 * @param {*} callback 
 * Test status:Pending
 */
var getUser=(key,keyType,callbackId,callback)=>{



    dbHelper.readConfiguration(callbackId,function(err,config){

        if(err){

            console.log("Could not able to read the configuration");
            return;
        }

        var user={};
       
        var queryParam=keyType;
        if(keyType=="facebook"){
         queryParam="unique_external_id"
        }


        freshDesk.GetContacts(queryParam+"="+key,config.freshdesk,function(err,data){

        
            if(err){
                DebugMessage(err,"error");
                callback(err,data);
                return;
            }
        
            else
            {
                users=JSON.parse(data);
                if(users.length==0){
                    DebugMessage("Contact does not exists, need to create a new contact");
                    if(keyType!="facebook"){
                    freshDesk.CreateContactByMobile(key,"",config.freshdesk,function(err,data){
        
        
                        
                        var newUser=JSON.parse(data);
                        if(err)
                        {
                            DebugMessage(err,"error");
                            callback(err,data);
                            return;
                        }

                        ///if customer already exists then update the profile  and continue

                        dbHelper.isCustomerExists(newUser.id,callbackId,function(err,oldUser){

                            if(oldUser){

                                oldUser.profile=newUser;
                                oldUser.serverConfig=config;
                                //update the customer details
                                callback(null,oldUser);

                            }
                            else
                            {
                                //add the customer to db
                                user.profile=newUser;   
                                dbHelper.CreateNewCustomer(user,callbackId,function(err,insertedUser){

                                    insertedUser.serverConfig=config;
                                    if(err){
                                        //error in save operation but user is exists so continue with workflow
                                        callback(null,insertedUser);
                                    }
                                    else
                                    callback(null,insertedUser);


                                });
                             //   store.set(newUser.id+"",user);
                               
            

                            }



                        });

                      
        
                    });
                    }
                    else
                    {
                        freshDesk.CreateContactByFacebook(key,"",config.freshdesk,function(err,data){
        
                            var newUser=JSON.parse(data);
        
                            if(err)
                            {
                                DebugMessage(err),"error";
                                return;
                            }
                           
                            dbHelper.isCustomerExists(newUser.id,callbackId,function(err,oldUser){

                                if(oldUser){
                                    oldUser.profile=newUser;
                                    //update the customer details
                                    oldUser.serverConfig=config;
                                    callback(null,oldUser);
    
                                }
                                else
                                {
                                    //add the customer to db
                                    user.profile=newUser;   
                                    dbHelper.CreateNewCustomer(user,callbackId,function(err,insertedUser){
    
                                        insertedUser.serverConfig=config;
                                        if(err){
                                            //error in save operation but user is exists so continue with workflow
                                            callback(null,insertedUser);
                                        }
                                        else
                                        callback(null,insertedUser);
    
    
                                    });
                                 //   store.set(newUser.id+"",user);
                                   
                
    
                                }
    
    
    
                            });
                            
        
                        });
                    }
                }
                else
                {
        


                    dbHelper.isCustomerExists(users[0].id,callbackId,function(err,oldUser){

                        if(oldUser){
                            oldUser.profile={};
                            oldUser.profile=users[0];
                            oldUser.serverConfig=config;
                            //update the customer details
                            callback(null,oldUser);

                        }
                        else
                        {
                            //add the customer to db
                            if(oldUser==null){
                                oldUser={};
                                
                            }
                            oldUser.profile=users[0];   
                            dbHelper.CreateNewCustomer(oldUser,callbackId,function(err,insertedUser){

                                insertedUser.serverConfig=config;
                                if(err){
                                    //error in save operation but user is exists so continue with workflow
                                    callback(null,insertedUser);
                                    return;
                                }
                                else
                                callback(null,insertedUser);


                            });
                      
        

                        }



                    });
        
                   
                }
              
        
            }
        
        
            });




    });

   //user=store.get(key+"");
  

  


  



   
    


}


var ProcessOptions=(user,Option,callback)=>{


    if(user.lastState==undefined){
            

        callback("Invalid state");
        return;
        

    } 


    switch(Option.toLowerCase()){
        case 'm':
        user.lastState.offset+=MAX_OPTIONS;
        checkOpenTickets(user,callback)
        //show more options, need to check the last status offset and then update as per
        break;
        case 'n':
        CreateNewTicket(user,callback);
        break;
        
        default:showTicketByOptions(Option,user,callback); break;
    }



}

var showTicketByOptions=(Option,User,callback)=>{


    freshDesk.GetAllTickets("filter=new_and_my_open&requester_id="+User.profile.id,User.serverConfig.freshdesk,function(err,data){

        var  AppConfig=User.serverConfig.AppSettings;
        if(err){

            callback(err);
            return;
        }

        var openTickets=JSON.parse(data);
        var ticketIndex=User.lastState.offset;
        if(Option.toLowerCase()=='a'){

            ticketIndex+=0;

        }
        if(Option.toLowerCase()=='b'){

            ticketIndex+=1;

        }
        if(Option.toLowerCase()=='c'){

            ticketIndex+=2;

        }


        var ticket=openTickets[ticketIndex];
        User.lastState.ticket=ticket;
        User.lastState.status=STATE_DEFAULT;
        AddReply(User,function(err,data){


            if(err){
                DebugMessage(err,"error");
                callback(err,data);
                return;
            }
            var message=AppConfig.Messages.CommentAdded;
            message=ProcessMessageTemplate(message,ticket);
           // var  message="Ticket with ID #"+ticket.id+""+" titled as "+ticket.subject+" is active and will be processed shortly, thanks for cooperation";
            //callback(null,ticket);
            SendToUser(User,message+AppConfig.Messages.FixedMessage,callback);
        },false);
      


    });
    

}





var ProcessMessage=(user,subject,desc,callback,type)=>{


        try{

        
        if(user.lastState==undefined){

            user.lastState={};
            user.lastState.status=1;
            user.lastState.subject=subject;
            user.lastState.message=desc;
            user.lastState.offset=0;
            user.lastState.replyVia=type;

        }
        else
        {  
            user.lastState.subject=subject;
            user.lastState.message=desc;
            user.lastState.offset=0;
            user.lastState.replyVia=type;
        }
    
        checkOpenTickets(user,callback);
    }
    catch(e){

    }

}

var checkOpenTickets=(User,callback)=>{


    // this function will be used to read the open tickets.
    freshDesk.GetAllTickets("filter=new_and_my_open&requester_id="+User.profile.id,User.serverConfig.freshdesk,function(err,data){

       var  AppConfig=User.serverConfig.AppSettings;
        if(err){

            callback(err,data);
            return;

        }
        var openTickets=JSON.parse(data);

        if(openTickets.length==0){
            // there is no open ticket;
            // we need to create new ticket here
            User.lastState.status=STATE_DEFAULT;
           // 
            if(User.currentState==FLOW_CMD_NEW){
                CreateNewTicket(User,callback);
            }
            else
            {
                User.currentState==FLOW_CMD_NEW;
               // store.set(User.id+"",User);
                //callback(null,AppConfig.Messages.NoTicketsFound);

                SendToUser(User,AppConfig.Messages.NoTicketsFound+AppConfig.Messages.FixedMessage,function(err,data){

                    callback(err,data);

                });
            }
           

        }
        else if (openTickets.length==1){

            // there is one active ticket found share detals and ask user that this is the ticket he requested (in yes or no)
            // if user say yes then add the message text to conversation
            // if user say no then add new ticket and share the information with user
            var ticket=openTickets[0];
            User.lastState.ticket=ticket;
            User.lastState.status=STATE_CONFIRMATION;;//two belongs to confirmations state
            
            var message=AppConfig.Messages.ConfirmationMessage;

            message=ProcessMessageTemplate(message,ticket);
            User.lastState.lastMessage=message;
           // var message ="you have one ticket with id #"+ticket.id+"  Titled as: ("+ticket.subject+") you are talking about this ticket, type yes for correct ticket, or type no to create new ticket";
          //  callback(message);
           message+=AppConfig.Messages.FixedMessage;
           SendToUser(User,message,function(err,data){
            callback(err,data);
          });

        }
        else{


           var limit=openTickets.length<(User.lastState.offset+MAX_OPTIONS)?openTickets.length:(User.lastState.offset+MAX_OPTIONS);
           var message="";
           var counter=0;
           User.lastState.status=STATE_OPTIONS;
            for(var i=User.lastState.offset;i<limit;i++){

                message+=String.fromCharCode(counter+65)+".#"+openTickets[i].id+"  "+openTickets[i].subject+"  ";
                counter++;

            }
            var hasOptions=openTickets.length-User.lastState.offset;
         
            if(hasOptions<=0){
                
                User.lastState.status=STATE_DEFAULT;

                SendToUser(User,AppConfig.Messages.FixedMessage,function(err,data){

                    callback(err,data);

                });
                User.lastState.offset=0;
                return;
            }
            if(hasOptions>3){

                message+="M. More Options  ";
                message+="N. Create New Ticket  ";
            }
           
            else
            {
                message+="N. Create New Ticket  ";
            }

            
            var templateM=AppConfig.Messages.Options;
            message=templateM.replace("{options}",message);
            // in case tickets are more than one, we will set a offset to user profile and then like 3 for first time and then next 3 will have 6 if open tickets are there
            //callback(message);
            User.lastState.lastMessage=message;
            message+=AppConfig.Messages.FixedMessage;
            SendToUser(User,message,function(err,data){

                callback(err,data);

            });
        }





    });


}



var CreateNewTicket=(User,callback)=>{

    freshDesk.CreateNewTicket(User.profile,User.lastState.subject,User.lastState.message,User.serverConfig.freshdesk,function(err,data){


        var AppConfig=User.serverConfig.AppSettings;
          if(err){
              DebugMessage(err,"error");
              callback(err);
              return;
          }
          User.lastState.status=STATE_DEFAULT;
          var ticketDetails=JSON.parse(data);
           User.lastState.ticket=ticketDetails; 
          var  message=ProcessMessageTemplate(AppConfig.Messages.NewTicket,ticketDetails);
           message+= AppConfig.Messages.FixedMessage
          SendToUser(User,message,function(err,data){
            callback(err,data);
          });
         // callback(ticketDetails);
          return;

    });

}


var ProcessConfirmation=(user,message,callback)=>{

   

       

        if(user.lastState==undefined){
            

            callback("Invalid state");
            return;
            

        }        

        if(user.lastState.status==2){

            if(message.toLowerCase()=='yes'){
  
              /// share more details
              user.lastState.status=0;
              user.lastState.offset=0;
  
              AddReply(user,callback);
  
  
  
            }
            else if(message.toLowerCase()=="no"){
  
              // create new ticket and share the details
              
                user.lastState.status=0;
                user.lastState.offset=0;
                CreateNewTicket(user,callback);
  
            }
            else
            {
  
              callback("invalid request, please try one more time");
            }
      


      


        }

}


var AddReply=(User,callback,reply)=>{


    try{

    
    freshDesk.AddReplyToTicket(User.lastState.ticket.id,User.lastState.message,User.profile.id,User.serverConfig.freshdesk,function(err,data){

        if(err){

            callback(err);
            return;

        }

        else{

            var AppConfig=User.serverConfig.AppSettings;
            var replyMessage=AppConfig.Messages.CommentAdded;
            replyMessage=ProcessMessageTemplate(replyMessage,User.lastState.ticket);
            replyMessage+=AppConfig.Messages.FixedMessage;
            if(reply==false){
                callback(null,replyMessage);
            }
           else
           {
               SendToUser(User,replyMessage,function(err,data){
                callback(err,data);
               });
           }
            return;

        }



    });

}
catch(e){
    DebugMessage(e,"error");
    callback(e);
}


}



/////below we will use nexmo apis to send reply to user here you go



var SendToUser=(User,message,callback)=>
{

    //store.set(User.id+"",User);
    //message+=AppConfig.Messages.FixedMessage;
    var receiverId="";



    //here we have two possible scenerio.
    //1. user profile might have more than one channel conversation.
    //like facebook, whatsapp, and sms/mms o



    try{

    console.log("Reply Via"+ User.lastState.replyVia);
    if(User.lastState.replyVia.toLowerCase()=='sms'){

        receiverId=User.profile.phone==undefined?User.profile.mobile:User.profile.phone;

        nexmo.InitConfig(User.serverConfig.NexmoConfig,User.serverConfig.callbackId,function(err,token,app){


            User.serverConfig.NexmoConfig.token=token;
            User.serverConfig.NexmoConfig.NexmoApp=app;

            nexmo.sendMessage(User.lastState.replyVia,receiverId,message,true,User.serverConfig.NexmoConfig,function(err,data){




                User.profile=null;
                User.serverConfig=null;
                dbHelper.UpdateCustomer(User,User.callbackId,function(err,status){
                    console.log("User Upserted");
                });
    
                if(err){
                 callback(err);
                 DebugMessage("Issue with sending message"+err,"error");
                }
                else
                {
                    DebugMessage("Message sent "+data,"log");
                    callback(null,message);
                }
                
            
                
        
            });


        })
        
        }
    else if (User.lastState.replyVia.toLowerCase()=='whatsapp')
    {


        //here we need to check the last message received from user date and time
        // if time is greater than 24 then we will send template and then send message
        //if time is less than 24 send the message directly..
        console.log("init config");
        nexmo.InitConfig(User.serverConfig.NexmoConfig,User.serverConfig.callbackId,function(err,token,app){

         
            if(err){
                console.error(err);
                return;
            }
            console.log("found config");
            User.serverConfig.NexmoConfig.token=token;
            User.serverConfig.NexmoConfig.NexmoApp=app;
            receiverId=User.profile.phone==undefined?User.profile.mobile:User.profile.phone;
            nexmo.sendWhatsAppMessage("",message,receiverId,true,User.isTemplateRequired==undefined?false:User.isTemplateRequired,User.serverConfig.NexmoConfig,function(err,data){
    


                User.profile=null;
                User.serverConfig=null;
                dbHelper.UpdateCustomer(User,User.callbackId,function(err,status){
                    console.log("User Upserted");
                });
                console.log("found err"+err);
                try{
                    callback(err,data);
                }
    
                catch(e){}

               
               
    
            });

        })
       
    }
    else if(User.lastState.replyVia.toLowerCase()=='facebook')
    {

        nexmo.InitConfig(User.serverConfig.NexmoConfig,User.serverConfig.callbackId,function(err,token,app){

            User.serverConfig.NexmoConfig.token=token;
            User.serverConfig.NexmoConfig.NexmoApp=app;
            User.serverConfig.NexmoConfig.retries=0;
            receiverId=User.profile.unique_external_id==undefined?User.profile.phone:User.profile.unique_external_id;
            nexmo.sendFacebookMessage(receiverId,message,true, User.serverConfig.NexmoConfig,function(err,data){
    
                User.profile=null;
                User.serverConfig=null;
                dbHelper.UpdateCustomer(User,User.callbackId,function(err,status){
                    console.log("User Upserted");
                });
                if(err){
                    callback(err);
                    return;
                }
                
            });

        });
        
    }
   }
catch(err){
    DebugMessage(err,"error");

    try{
        callback(err,data);
    }

    catch(e){}
}
    //callback(null,message);
    //1. Format, Apply and share with user using the given callback, you can also intorduce any template if you want
    //this function will be used to share the ticket details with users
}

var PrepateAgentMessage=(WebhookData)=>{

    try{

    
    if(WebhookData.triggered_event.includes("note_type")==true){

        var message="Support:Agent Replyed on ticket "+WebhookData.ticket_id+" as ("+WebhookData.ticket_subject+") "+strip_html_tags(WebhookData.ticket_latest_private_comment);
        return message;
        
      
    }
    
    if(WebhookData.triggered_event.includes("responder_id")==true){

        
        var message="Support: ticket "+WebhookData.ticket_id+"("+WebhookData.ticket_subject+"), has assigned to "+WebhookData.ticket_agent_name;
        return message;
    
  
    }
    
    if(WebhookData.triggered_event.includes("priority")==true){

        
        var message="Support: ticket "+WebhookData.ticket_id+"("+WebhookData.ticket_subject+"), its priority has changed to "+WebhookData.ticket_priority;
        return message;
    
  
    }
    if(WebhookData.triggered_event.includes("{ticket_type")==true){

        
        var message="Support: ticket "+WebhookData.ticket_id+"("+WebhookData.ticket_subject+"), its type has changed to "+WebhookData.ticket_type;
        return message;
    
  
    }

    var message="Support: ticket "+WebhookData.ticket_id+"("+WebhookData.ticket_subject+") status has changed to "+(WebhookData.ticket_status);
    return message;
   
}
catch(e){
    return "your ticket is updated.";
} 
        
    
  
   

}

function strip_html_tags(str)
{
   if ((str===null) || (str===''))
       return false;
  else
   str = str.toString();
  return str.replace(/<[^>]*>/g, '');
}
var MessageReceivedFromFreshdesk=(WebhookData,callbackId,Rootcallback)=>{

    WebhookData=WebhookData.freshdesk_webhook;

    dbHelper.readConfiguration(callbackId,function(err,configuration){


            if(err){
                Rootcallback(err);
                return;
            }


            nexmo.InitConfig(configuration.NexmoConfig,callbackId,function(err,token,app){



                configuration.NexmoConfig.token=token;
                configuration.NexmoConfig.NexmoApp=app;

                if(WebhookData.ticket_requester_phone==null||WebhookData.ticket_requester_phone==undefined){

                    console.log("User Phone Number is not exists");
                    //unable to find phone number, check the unique external id is exists or not
                    if(WebhookData.unique_external_id==null||WebhookData.unique_external_id==undefined){
            
                        console.log("User Phone Number is not exists");
                        Rootcallback("Phone no not exists");
                        return;
                    }
                    console.log("User reading from facebook");
                    getUser(WebhookData.unique_external_id,"facebook",callbackId,function(err,data){
            
            
                        if(err){
                            Rootcallback("User Not found");
                            return;
                        }
                        console.log("User found from facebook");
            
                       
                        SendToUser(data,PrepateAgentMessage(WebhookData),function(err,data){
            
                        
                            Rootcallback(err,data);
            
                        
                        });
            
            
            
            
            
            
                    });
            
                }
                else
                {
                    console.log("reading user from phone");
                    getUser(WebhookData.ticket_requester_phone,"phone",callbackId,function(err,data){
            
            
                        if(err){
                            Rootcallback("User Not found");
                            console.log("User Not found");
                            return;
                        }
                        //console.log("found from pheon");
                      //  console.log(data);
                        if(data.lastState.replyVia=='whatsapp'){
            
            
                             //FIND LAST MESSAGE RECEIVED FROM USER
                        //FIND THE DIFFERENCE BETWEEN CURRENT TIME AND LAST RECEIVED TIME
                        // IF THE DIFFERENCE IS GREATER THAN 24 NEED TO SEND TEMPLATE AGAIN
                        //ELSE SYSTEM CAN SEND DIRECT UPDATES TO WHATSAPP CHANNEL
                            var last= data.lastMessageReceivedOn;
                            var current=new Date();
                            var DIFFERENCE=current-last;
                           
                            DIFFERENCE=((DIFFERENCE/1000)/60)/60;
                           
                            if(DIFFERENCE>24){
            
            
                                //need to send template first and then we can send the other messages
                
                                data.isTemplateRequired=true;
                                SendToUser(data,PrepateAgentMessage(WebhookData),function(err,data){
            
                        
                                    Rootcallback(err,data);
                    
                                
                                });
                
                            }
                            else
                            {
                                data.isTemplateRequired=false;
                                SendToUser(data,PrepateAgentMessage(WebhookData),function(err,data){
            
                        
                                    Rootcallback(err,data);
                    
                                
                                });
                                //can send message direclty
                            }
                        }
                        else
            
                        {
            
                            
                           // callback("User only phone case");
                            SendToUser(data,PrepateAgentMessage(WebhookData),function(err,data){
            
                        
                                Rootcallback(err,data);
                
                            
                            });
                        }
            
                       
                      
                       
                        
                       
            
                        
            
                    
            
            
            
            
            
            
                    });
            
                }



            })



    })
   





}

module.exports={


    onReceiveSMS,
    onReceiveWhatsappMessage,
    onReceiveFacebookMessage,
    init,
    MessageReceivedFromFreshdesk,
    SendToUser

}


/**
 * 1. after message received check what it containts
 * 2. in case it only contains the Chat, like A,B,C,D,E then perfrom action acoordingly else process like
 * 3. check user is exists or not
 * 4. is not exists then, we need to create a new user account,
 * 5. in case of facebook_id, send new ticket request and pass external unique id as facebook id by which user will be created automatically, 
 * 6, in case of what's app,sms send new ticket request and pass phone as contact no and name as contact no so new ticket and user will be created 
 * 7. if ticket is create then send ticket infromation to user
 * 8. if issue in creating a tickek log the issue in log files for later use
 * 9. if user is already exists, then
 * 10. find the open tickets for the user
 * 11. if the ticket count is 1
 * 12. reply the the ticket information to user. and add message text to converstation
 * 13. if the ticket count is greater than 1 then take top 3 and send to user as options
 * 14. as per the option selection perfrom the actions 
 * 15. in case user selected A,B,C, then retrun the requested ticket details, and add reply to ticket
 * 16. id option will be only available if there are more than 3 tickets opened,
 * 17. if there are more than 3 tickets are opened and user enters D then find next 3 questions and set offsets to session and send question to user by ABC
 * 18. add additional q
 */
