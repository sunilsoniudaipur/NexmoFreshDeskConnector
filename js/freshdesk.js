var jsonFile=require('jsonfile');
var request=require('request');

var endPoints={
    "CreateContact":"/api/v2/contacts",
    "UpdateContactPut":"/api/v2/contacts",
    "ReadContacts":"/api/v2/contacts",
    "CreateTicket":"/api/v2/tickets",
    "UpdateTicketPut":"/api/v2/tickets/",
    "ReadAllTickets":"/api/v2/tickets",
    "CreateReply":"/api/v2/tickets/",
    "SearchTickets":"/api/v2/search/tickets"
};





var GetAllTickets=(query,FreshDeskConfig,callback)=>{

  
    var options={
        url:FreshDeskConfig.BaseUrl+endPoints.ReadAllTickets+"?"+query,
        headers:{
            'Content-Type':"application/json"
        }
    }
    request.get(options,function(err,resp,body){


        if(resp.statusCode==400){

            callback(body,null);
            return;
        }
        if(err){
            callback(err);
            return
        }
        if(body){
            callback(null,body);
            return;
        }

       
        // console.log(resp);

    }).auth(FreshDeskConfig.User,FreshDeskConfig.Password)
    
    //will create new user and deliver the data

}





/**
 * 
 * @param {*using facebook id as unique_external_id in the freshdesk} facebookid 
 * @param {*user name, if not provided then facebookid will be trated as name} name 
 * @param {*callback function, will return success/error} callback 
 * 
 * 
 */
var CreateContactByFacebook=(facebookid,name,FreshDeskConfig,callback)=>{

    if(facebookid==null||facebookid==""){

        callback("facebook id  cannot be null",null);
        return;
    }
    if(name==null||name==""){
        name=facebookid;
    }
    var bodyData={

        name:name,
      
        unique_external_id:facebookid

    }
    var options={
        url:FreshDeskConfig.BaseUrl+endPoints.ReadContacts,
        headers:{
            'Content-Type':"application/json"
        },
        body:JSON.stringify(bodyData)
    }
    
    request.post(options,function(err,resp,body){

        if(resp.statusCode!=200||resp.statusCode!=201){
            callback(err==undefined?"Error in creating user":err,null);
            return
        }
        if(body){

            var bodyJson=JSON.parse(body);
            if(bodyJson.length==0){
                console.log("facebookid does not exists");
            }
            callback(null,body);
            return;
        }

       
        //console.log(resp);

    }).auth(FreshDeskConfig.User,FreshDeskConfig.Password)


}

/**
 * 
 * @param {*Create Contact by user mobile no} contactNo 
 * @param {* Contact name, if not provided then contactNo will be trated as name} name 
 * @param {*callback function, will return success/error} callback 
 */
var CreateContactByMobile=(contactNo,name,FreshDeskConfig,callback)=>{

    if(contactNo==null||contactNo==""){

        callback("Contact no cannot be null",null);
        return;
    }
    if(name==null||name==""){
        name=contactNo;
    }
    var bodyData={

        name:name,
        mobile:contactNo,
        phone:contactNo

    }
    var options={
        url:FreshDeskConfig.BaseUrl+endPoints.ReadContacts,
        headers:{
            'Content-Type':"application/json"
        },
        body:JSON.stringify(bodyData)
    }
    
    request.post(options,function(err,resp,body){

        if(err){
            callback(err);
            return
        }
        if(body){

            var bodyJson=JSON.parse(body);
            if(bodyJson.length==0){
                console.log("contact does not exists");
            }
            callback(null,body);
            return;
        }

       
        console.log(resp);

    }).auth(FreshDeskConfig.User,FreshDeskConfig.Password)


}
var GetContacts=(query,FreshDeskConfig,callback)=>{

   // query="phone=9782177245"
    var options={
        url:FreshDeskConfig.BaseUrl+endPoints.ReadContacts+"?"+query,
        headers:{
            'Content-Type':"application/json"
        }
    }
    request.get(options,function(err,resp,body){


        try{
        if(resp.statusCode==400){
            callback(body);
            return;
        }
        else
        if(err){
            callback(err);
            return
        }
        if(body){

            var bodyJson=JSON.parse(body);
            if(bodyJson.length==0){
                console.log("contact does not exists");
            }
            callback(null,body);
            return;
        }

    }
    catch(e){
        callback(e);
    }
       
        console.log(resp);

    }).auth(FreshDeskConfig.User,FreshDeskConfig.Password)
    

}




var CreateNewTicket=(User,ttitle,tdescription,FreshDeskConfig,callback)=>{

    //assuming User is a object returned from frreshdesk,
    //in case user is null ticket cannot be created
    if(User==null||User==""){

        callback("User cannot be null",null);
        return;
    }
    if(ttitle==null||ttitle==""){
        callback("Ticket title cannot be null",null);
        return;
    }
    if(tdescription==null||tdescription==""){
        tdescription=ttitle;
    }
    if(User.name==null||User.name==""){
        User.name=User.phone;
    }
    var bodyData={

        name:User.name,
        requester_id:User.requester_id,
      
        phone:User.phone,
        facebook_id:User.facebook_id,
        twitter_id :User.twitter_id,
        unique_external_id:User.unique_external_id,
        subject:ttitle,
        description:tdescription,
        status:2,
        priority:1,
        source:3,

    }
    var options={
        url:FreshDeskConfig.BaseUrl+endPoints.CreateTicket,
        headers:{
            'Content-Type':"application/json"
        },
        body:JSON.stringify(bodyData)
    }
    
    request.post(options,function(err,resp,body){

        if(err){
            callback(err);
            return
        }
        if(body){

            var bodyJson=JSON.parse(body);
            if(bodyJson.length==0){
                console.log("contact does not exists");
            }
            callback(null,body);
            return;
        }

       
        console.log(resp);

    }).auth(FreshDeskConfig.User,FreshDeskConfig.Password)



}



var AddReplyToTicket=(ticketid,bodyText,user_id,FreshDeskConfig,callback)=>{


  
    if(ticketid==null||ticketid==""){

        callback("Ticket Id cannot be null",null);
        return;
    }
    if(bodyText==null||bodyText==""){
        callback("Body text cannot be null",null);
        return;
    }
  
    var bodyData={

        body:bodyText,
        user_id:user_id

    }
    var options={
        url:FreshDeskConfig.BaseUrl+endPoints.CreateReply+"/"+ticketid+"/reply",
        headers:{
            'Content-Type':"application/json"
        },
        body:JSON.stringify(bodyData)
    }
    
    request.post(options,function(err,resp,body){

        if(err){
            callback(err);
          
        }
        if(body){

            var bodyJson=JSON.parse(body);
            if(bodyJson.length==0){
                console.log("contact does not exists");
            }
            callback(null,body);
         
        }

       
        console.log(resp);

    }).auth(FreshDeskConfig.User,FreshDeskConfig.Password)



}






module.exports={
    GetAllTickets,
    GetContacts,
    CreateContactByMobile,
    CreateContactByFacebook,
    CreateNewTicket,
    AddReplyToTicket,
    
   
}