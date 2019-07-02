var express=require('express');
var fs=require("fs");
var jsonfile=require('jsonfile');
var bodyParser=require('body-parser');
var freshDesk=require('./js/freshdesk');
var nexmoManager=require('./js/nexmoManager');
var nfPlugin=require('./js/FreshDeskNexmoPlugin');
var dbHelper=require("./js/dbhelper");
var DEFAULT_PORT=8080;
var app = express();
app.set('port', process.env.PORT || DEFAULT_PORT);

app.use('/4sdfsISPZA4sdfhfv', express.static('public'))
var Sessions=new Array();
//this function will be used for initialization purpose
var init=()=>{

   
    nfPlugin.init(Sessions);
}
var API_KEY="X5X7A8YIISBCT8HB6P7LUX2MF8AXASFBEG4VQVQ9BYGPU1AA4ISPZA491ULVF4XK6F7L6DSEG5X4LMM116QSCF0Y32G2IC55D9XE3T8JC0IG521WJFU4IC6Y0XRL2NCQ4WUDMCBRUKVEI6ZSXI69VY";
init();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/', function(req, res){

    res.redirect("/4sdfsISPZA4sdfhfv/");
});


app.get('/isadminexists/:emailid', function(req, res){
    
    
  dbHelper.isExistsAlready(req.params.emailid,function(err,isexists){

    res.status(200).send({"isexists":isexists}).end();


  });
   

});

app.post('/addnewadmin', function(req, res){
    
    
    dbHelper.registerNewUser(req.body,function(err,isexists){
  
      res.status(200).send({"message":isexists}).end();
  
  
    });
     
  
  });


  app.post('/updateconfig', function(req, res){
    
    
    dbHelper.UpdateConfig(req.body,function(err,message){
  
      res.status(200).send({"message":message}).end();
  
  
    });
     
  
  });


   app.get('/readconfig/:key', function(req, res){
    
    
    dbHelper.readConfiguration(req.params.key,function(err,configuration){
  

      if(err){
        res.status(200).send({"error":err}).end(); 
        return;
      }  
      res.status(200).send({"config":configuration}).end();
  
  
    });
     
  
  });


  app.post('/adminlogin', function(req, res){
    
    
    dbHelper.adminLogin(req.body,function(err,user){
  
      res.status(200).send(user).end();
  
  
    });
     
  
  });



/**
 * @description ("this endpoint will be used to receive the incoming messages from nexmo")
 */
app.post('/webhook/inbound-message/:callbackId', function(req, res){
    
    res.status(200).send("sent").end();
   //res.status(200).end();
   // console.info("Message Received");
    var callbackId=req.params.callbackId;
  //  console.log(JSON.stringify(req.body));

    
    if(req.body.type=="text"){

        
        var ContactNo=req.body.msisdn;
        var message=req.body.text;
        var callbackId=req.params.callbackId;
      //  console.info("SMS Received from"+ContactNo+" message is"+ message);
       // console.info("CALLBACK ID Received"+callbackId);
       
        nfPlugin.onReceiveSMS(ContactNo,message,callbackId,function(err,data){

            if(err){
                //res.status(200).send(err).end();
              //  res.status(200).send("sent").end();
                return;
            }
            else
            {
               // console.log(data);
                //res.status(200).send(data).end();
               // res.status(200).send("sent").end();
            }

        });
        //res.status(200).send("sent").end();
      
    }
     else
    if(req.body.from.type=="sms"){

        
        var ContactNo=req.body.msisdn;
        var message=req.body.text;

        

        console.info("SMS Received from"+ContactNo+" message is"+ message);
       
        nfPlugin.onReceiveSMS(ContactNo,message,callbackId,function(err,data){

            if(err){
                //res.status(200).send(err).end();
               // res.status(200).send("sent").end();
                return;
            }
            else
            {
               // console.log(data);
                //res.status(200).send(data).end();
              //  res.status(200).send("sent").end();
            }
           

        });
        //res.status(200).send("sent").end();
        return;
    }
    else
    if(req.body.from.type == "messenger"){
        var ContactNo=req.body.from.id;
        var message=req.body.message.content.text;

        if(req.body.message.content.type!="text"){

          var user={};
          user.profile={};
       
          dbHelper.readConfiguration(callbackId,function(err,data){

            user.serverConfig=data;
            user.lastState={};
            user.lastState.replyVia="facebook";
            user.profile.unique_external_id=ContactNo;
            user.profile.phone=ContactNo;

            nfPlugin.SendToUser(user,"Media files are not supported",function(err,data){

              //console.log("Error message sent successfuly");
              
             });

          });
           

           return;

        }

        //console.error("Facebook message Received from"+ContactNo+" message is"+ message);
      
        nfPlugin.onReceiveFacebookMessage(ContactNo,message,callbackId,function(err,data){

            if(err){
               // res.status(200).send(err).end();
                return;
            }
            else
            {
                //console.log(data);
               // res.status(200).send(data).end();
            }

        });

       // res.status(200).send("sent").end();
       return;
      
    }
    else
    if(req.body.from.type == "whatsapp"){
        

        console.log("From: "+req.body.from.number);
        console.log("From: "+req.body.message.content.text);
        console.info("Facebook message Received from"+req.body.from.number+" message is"+ req.body.message.content.text);


        if(req.body.message.content.type!="text"){

          var user={};
          user.profile={};
       
          dbHelper.readConfiguration(callbackId,function(err,data){

            user.serverConfig=data;
            user.lastState={};
            user.lastState.replyVia="whatsapp";
            user.profile.unique_external_id=req.body.from.number;
            user.profile.phone=req.body.from.number;

            nfPlugin.SendToUser(user,"Media files are not supported",function(err,data){

             // console.log("Error message sent successfuly");
              
             });

          });
           

           return;

        }

        nfPlugin.onReceiveWhatsappMessage(req.body.from.number,req.body.message.content.text,callbackId,function(err,data){

            if(err){
              //  res.status(200).send(err).end();
                return;
            }
            else
            {
               // console.log(data);
               // res.status(200).send(data).end();
            }

        });

        //res.status(200).send("sent").end();
    }
    else
    if(req.body.from.type == "viber"){
        //to be implement

    }
    else
    if(req.body.from.type == "mms"){
        //to be implement

    }
    else
    {
        //console.log("No Channel found"+req.body.from.type);
        res.status(200).send("OK").end();
    }
    
   // res.status(200).send("OK").end();
    

});

app.post('/webhook/inbound-status/:callbackId', function(req, res){
    
   
    res.status(200).end();

});

//----------------------SMS------------------------------

//-----------Webhook APPS--
/**
 * @description only in case of additional apps require to add web hook url
 * or need to split the channel 
 */
app.post('/webhook/app/inbound-message/:callbackId', function(req, res){
    
   
    nfPlugin.onReceiveWhatsappMessage(req.body.from.number,req.body.message.content.text,req.params.callbackId,function(err,data){


        
      

    });

    res.status(200).send("sent").end();
  
});



app.post('/webhook/app/events/:callbackId', function(req, res){
    
   
    res.status(200).send("GOT APP MES events").end();

});

app.post('/webhook/app/inbound-status/:callbackId', function(req, res){
    
    
    res.status(200).send("GOT APP MES STATUS").end();

});


app.post('/webhook/outbound/:callbackId', function(req, res){
    
   
  
 
    nfPlugin.MessageReceivedFromFreshdesk(req.body,req.params.callbackId,function(err,data){

       
    });
    res.status(200).send("GOT APP MES STATUS").end();
   
});
//-------------WEBHOOK APPS------------------------------



app.get('/getHelpData', function(req, res){
    
   
  
   jsonfile.readFile("configuration/helpdata.json",function(err,data){

            if(err){
                res.status(500).send(err).end();
                return;
            }
             res.status(200).send(data).end();

   });
   
});



app.listen(app.get('port'),function(){

    console.log("server is started at port"+app.get('port'));
});
