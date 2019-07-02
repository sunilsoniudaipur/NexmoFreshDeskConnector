var Nexmo=require('nexmo');
const superagent = require('superagent');
var request=require('request');
var fs=require("fs");
var isDebug=true;

var GetJWT=(NexmoApp,success)=>{



   
    
    const jwt=NexmoApp.generateJwt();
    if(jwt){
        success(jwt);
    }
    else
    {
        success(null);
    }




}

/**
 * @description {* function is only used for the whatsapp testing purpose, for production there is already a method available }
 * @param {*} from 
 * @param {*} text 
 * @param {*} to 
 * @param {*} type 
 * @param {*} isTemplateRequired 
 * @param {*} callback 
 */
var sendBySandBox=(from,text,to,type,isTemplateRequired,token,callback)=>{

 

  console.error("WHATSAPP Sending"+ from);
 
  var data={     "from": { "type": type, "number": from },     "to": { "type": type, "number": to },     "message": {       "content": {         "type": "text",         "text": text       }     }   };
 
  if(isTemplateRequired==true){

    data= { "to": { "type": "whatsapp","number": to           }, "from": {"type": "whatsapp","number": from           },           "message": {                 "content": {                   "type": "template",                   "template": {                     "name":"whatsapp:hsm:technology:nexmo:simplewelcome",                     "parameters": [                {                   "default":"Nexmo"                },                {                   "default":"interact with us over whatsapp"                }             ]           }         }       }     } ;
  }

 var finalData=JSON.stringify(data);


  var options={
    url:"https://sandbox.nexmodemo.com/v0.1/messages/",
    headers:{
        'Content-Type':"application/json",
        'Authorization':'bearer 34p5freshfreshonqa',
        'Accept':"application/json"
    },
    body:finalData
    }

    
 console.error("Data Extracted"+ JSON.stringify(options));
 
    try{
   // console.log("DATA"+JSON.stringify(options.body));
   //request.post()

   superagent
  .post('https://sandbox.nexmodemo.com/v0.1/messages/')
  .send(data) // sends a JSON post body
  .set('Authorization', 'bearer 34p5freshfreshonqa')
  .set('Accept', 'application/jsonson')
  .set("Content-Type","application/json")
  .end((err, resp) => {
    // Calling the end function will send the request
   // console.log("ERROR"+JSON.stringify(resp));
    if(err){
      callback(err);
      return;
    }
     console.log("ERROR"+err);
    if(resp.status!=200 && resp.status!=202){
          callback(resp.statusCode);
          console.log("Body "+body);
          console.log("Code "+resp.statusCode);
          console.error("ERROR "+resp.statusMessage);
          return
      }
     
  
        console.log(type+" Message sent");
        
       
        
        callback(null,200);
        return;
      
     
      console.log(resp);

  });

  // request.post("https://sandbox.nexmodemo.com/v0.1/messages/",options,function(err,resp,body){


    
  
  // });

}
catch(e){

  console.error(e);
}


}



var sendByProdMessageApi=(from,text,to,type,NexmoConfiguraiton,callback)=>{

  
  var findata={};

  if(type=='messenger'){
    var data={     "from": { "type": type, "id":from },     "to": { "type": type, "id": to },     "message": {       "content": {         "type": "text",         "text": text       }     }   };

  }
  else
  {
    var data={     "from": { "type": type, "number": from },     "to": { "type": type, "number": to },     "message": {       "content": {         "type": "text",         "text": text       }     }   };
  }
  //https://sandbox.nexmodemo.com/v0.1/messages/
  //https://api.nexmo.com/v0.1/messages
  var t=NexmoConfiguraiton.token;
 var finalData= JSON.stringify(data);
  var options={
    url:"https://api.nexmo.com/v0.1/messages",
    headers:{
        'Content-Type':"application/json",
        'Authorization':'bearer '+t,
       
    },
    body:finalData
    }
  request.post(options,function(err,resp,body){
  
    try{


      if(err){
        callback(err);
        return;
      }
  
      if(resp.statusCode!=200 && resp.statusCode!=202){

        if(resp.statusCode==401){
         
          console.log("Invalid Access token");
          NexmoConfiguraiton.retries++;
          if( NexmoConfiguraiton.retries>3){
            callback("failed to get new token");
         
            return;
          }
          GetJWT(NexmoConfiguraiton.NexmoApp,function(token){

                if(token==null){
                  console.log("Failed to get the token");
                  callback("Failed to get the token");
                  return;
                }
                NexmoConfiguraiton.token=token;
                sendByProdMessageApi(from,text,to,type,NexmoConfiguraiton,callback);

          });
         
         
            return;
        }
          callback(" Failed to send the last message to"+to+" by "+ type);
          console.error(err);
          return
      }
      if(body){
  
        console.log(type+" Message sent");
        console.log(data);
        console.log("Body "+body);
        console.log("Code "+resp.statusCode);
        console.log("SMEssage "+resp.statusMessage);
        callback(null,data);
          return;
      }

    }
    catch(e){

    }
  
     
      console.log(err);
  
  });


}


var sendWhatsAppMessage=(from,text,to,issandbox,isTemplateRequired,NexmoConfiguraiton,callback)=>{



  //console.log("Configuration"+JSON.stringify(NexmoConfiguraiton));

  if(isTemplateRequired==true){


        sendBySandBox(from,text,to,"whatsapp",true,NexmoConfiguraiton.token,function(err,data){

        if(err){
          console.log("error while sending the template");
          return;
        }

        sendBySandBox(NexmoConfiguraiton.WHATSAPP_NUMBER,text,to,"whatsapp",false,NexmoConfiguraiton.token,callback);


    });

    
  }
 
  if(issandbox){
    sendBySandBox(NexmoConfiguraiton.WHATSAPP_NUMBER,text,to,"whatsapp",false,NexmoConfiguraiton.token,callback);
  }
  else
  {
    NexmoConfiguraiton.NexmoApp.channel.send(
      { "type": channel, "whatsapp": to },
      { "type": channel, "whatsapp": NexmoConfiguraiton.WHATSAPP_NUMBER },
      {
        "content": {
          "type": "text",
          "text": message
        }
      },
      (err, data) => {
        //  res.send(er);
        callback(err,data);
          console.log(err); }
    );
  }


 // whatsapp,messanger

// var data={     "from": { "type": "whatsapp", "number": "447418342149" },     "to": { "type": "whatsapp", "number": to },     "message": {       "content": {         "type": "text",         "text": text       }     }   };
// var options={
//   url:"https://sandbox.nexmodemo.com/v0.1/messages/",
//   headers:{
//       'Content-Type':"application/json",
//       'Authorization':'bearer 34p5freshfreshonqa',
//       'Accept':"application/json"
//   },
//   body:JSON.stringify(data)
//   }
// request.post(options,function(err,resp,body){

//     if(err){
//         callback(err);
//         return
//     }
//     if(body){

//       console.log("whatsapp sent");
//      console.log(data);
//         return;
//     }

   
//     console.log(resp);

// });


}

var sendMessage=(channel,toNumber,message,issandbox,NexmoConfiguraiton,callback)=>{

   
    if(issandbox){

      sendByProdMessageApi(NexmoConfiguraiton.VIRTUAL_NUMBER,message,toNumber,"sms",NexmoConfiguraiton,callback);
    }
    else
    {

      NexmoConfiguraiton.NexmoApp.channel.send(
        { "type": channel, "number": toNumber },
        { "type": channel, "number": NexmoConfiguraiton.VIRTUAL_NUMBER },
        {
          "content": {
            "type": "text",
            "text": message
          }
        },
        (err, data) => {
          //  res.send(er);
          callback(err,data);
            console.log(err); }
      );

    }

    

}
var sendFacebookMessage=(recipientid,message,usingMessagingAPI,NexmoConfiguraiton,callback)=>{
 

  if(usingMessagingAPI){

 
    sendByProdMessageApi( NexmoConfiguraiton.FACEBOOK_SENDER_ID,message,recipientid,"messenger",NexmoConfiguraiton,callback);

  }
   
else
{
  try{
  NexmoConfiguraiton.NexmoApp.channel.send(
    { "type": channel, "messenger": recipientid },
    { "type": channel, "messenger": NexmoConfiguraiton.FACEBOOK_SENDER_ID },
    {
      "content": {
        "type": "text",
        "text": message
      }
    },
    (err, data) => {
      //  res.send(er);
      callback(err,data);
        console.log(err); }
  );
    }
    catch(e){
      callback(e);
    }


}
  

}





var InitConfig=(NexmoConfiguraiton,callbackId,callback)=>{



  try{

  
    var path="key/"+callbackId+".key";

    fs.writeFile(path, NexmoConfiguraiton.PRIVATE_KEY_PATH, (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");

        var NexmoApp=new Nexmo({

            
          apiKey: NexmoConfiguraiton.API_KEY,
          apiSecret: NexmoConfiguraiton.API_SECRET,
          applicationId: NexmoConfiguraiton.APP_ID,
          privateKey: "key/"+callbackId+".key",
        

        },{debug:isDebug});
        
        GetJWT(NexmoApp,function(token){
          if(token==null){
            console.error("Failed to get the JWT token");
            callback("Failed to get the JWT token");
          }
          else
          {
            Nexmo.jwtToken=token;
            callback(null,token,NexmoApp);
          }
      
      
        });

       
    });
       //due to issue write file every time during init operation
     


 
  //console.log(nexmo.channel);


  }
  catch(e){

    console.error(e);

  }
    


}

module.exports={
    InitConfig,
    GetJWT,
    sendMessage,sendWhatsAppMessage,sendFacebookMessage
}