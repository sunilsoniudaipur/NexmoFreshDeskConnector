const uuidv3 = require('uuid/v3');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var fs=require("fs");
const url = 'mongodb+srv://sunil:nexmo@234#@cluster0-erswg.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'nexmofreshdesk';

const usersTable = 'adminusers';
const customersTable = 'customers';

const configurationTable = 'confgurationTable';

const profileData = 'profileDataTable';




//----------------------------------------------



//-------------------------------------------------




var adminLogin=(loginData,callback)=>{

    getConnection(function(err,client,db){

        const collection = db.collection(usersTable);

        collection.find({'emailid':loginData.emailid,"password":loginData.password}).toArray(function(err,docs){

            client.close();
            if(err){
                callback(err);
                return;
            }
            
            if(docs.length>0){

               var user=docs[0];
                 user.emailid="";
                 user.password="";
                callback(null,docs[0]);
                return;
            }
            callback(null,null);
            

        });

    });

    
  }

var getConnection=(callback)=>{


    try{

    
const uri = "mongodb+srv://sunil:nexmotest@cluster0-erswg.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect( function(err, client) {
      // assert.equal(null, err);

        if(err){

            callback(err);
            return;

        }
        console.log("Connected successfully to server");
       
        const db = client.db(dbName);
       
        callback(null,client,db);
        //client.close();
      });

    }
    catch(exp){
        console.log(exp);
    }
}
  var registerNewUser=(userInformation,callback)=>{



    userInformation.createdOn=new Date();
    userInformation.lastLoggedIn=new Date();
    userInformation.gender="M";
    userInformation.company="";
    const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
    var data=uuidv3(userInformation.emailid,MY_NAMESPACE);

    
    let buff = new Buffer(data);  
    let base64data = buff.toString('base64');


console.log('"' + data + '" converted to Base64 is "' + base64data + '"');  
var codeF= base64data.substring(0,4)+base64data.substring(10,4)+base64data.substring(12,5);
userInformation.callbackId=codeF;

    getConnection(function(err,client,db){

        const collection = db.collection(usersTable);

        if(collection==undefined){
            callback("No collection found");
            return;
        }

        isExistsAlready(userInformation.emailid,function(err,isexists){


         
            if(isexists==true){

                callback(null,0);
                return;

            }

            collection.insertOne(userInformation,function(err,result){

                if(err){
                    callback(null,0);
                    return;
                }
                createConfiguration(userInformation.callbackId,db,client);
                callback(null,result.insertedCount);
                

            });


        })

    });
    
  }


  var createConfiguration=(callbackId,db,client)=>{

    const collection = db.collection(configurationTable);

    var config={};
    config.callbackId=callbackId;
    config.AppSettings={
        "Version":"0.1",
        "MaxOptionRetry":3,
        "default":"true",
        "Messages":{
             "ConfirmationMessage":"Support: Add comment to ticket #{ticket.id}? Titled as: ({ticket.subject}) reply YES to cconfirm, or NO to Create new ticket",
             "NewTicket":"Support: New ticket is created with ID #{ticket.id} and Titled as {ticket.subject}, it will be processed shortly, thanks for cooperation",
             "Help":"To create a new ticket reply NEW <Ticket Description>.\n For ticket status reply STATUS <id>.\n For open tickets reply OPEN.\n For help reply HELP \n For comment on last seen ticket reply with REPLY <Comment>",
             "FixedMessage":"\nTo create a new ticket reply NEW. For ticket status reply STATUS. For open ticket reply OPEN. For help reply HELP",
             "Options":"{options} Please reply with options mentioned above",
             "NoTicketsFound":"Support: No Open tickets were found",
             "CommentAdded":"Support: your comment is added to ticket id #{ticket.id} titled as {ticket.subject}. Thanks for your support, your issue will be resolved shortly",
             "InvalidRequest":"Invalid request",
             "IncorrectOptionSelected":"you have entered an incorrect option, please retry with valid option {lastmessage}",
             "ExceedRetry":"You have entered incorrect responses {count} times,",
             "TicketStatus":"Your ticket titled as {ticket.subject} and status is {ticket.status}"
            
    
        },
    
        "ReadMe":"the plugin allow you to edit the messages as well you can use some of the dynamic paramters in the mesasge like, ticket.id, ticket.subject, ticket.status, ticket.created_at and for line break you can use the /n, do not change option text like YES/NO else you might face some issues"
       
    
    
    };

    config.NexmoConfig={
        "API_KEY":"",
        "API_SECRET":"",
        "APP_ID":"",
        "PRIVATE_KEY_PATH":"",
        "VIRTUAL_NUMBER":"",
        "FACEBOOK_SENDER_ID":"",
        "WHATSAPP_NUMBER":""
    
    }

    config.freshdesk={
        "User":"",
        "Password":"andrandom@123text",
        "BaseUrl":"",
    }

    collection.insertOne(config,function(err,data){

        client.close();

    });
 

  }
  var isExistsAlready=(emailid,callback)=>{

    getConnection(function(err,client,db){

        const collection = db.collection(usersTable);

        collection.find({'emailid':emailid}).toArray(function(err,docs){
            client.close();
            if(err){
                callback(err);
                return;
            }
            
            if(docs.length>0){
                callback(null,true);
                return;
            }
           
            callback(null,false);

        });

    });

    
  }


  var readConfiguration=(callbackId,callback)=>{

    getConnection(function(err,client,db){

        const collection = db.collection(usersTable);

        collection.find({'callbackId':callbackId}).toArray(function(err,docs){
           
            if(err){
                callback(err);
                return;
            }
            
            if(docs.length>0){


                readConfigurations(callbackId,client,db,callback);
                //here we need to read the configuration data.
                //also for the firsttime we need to save the configuration data too?
                //callback(null,true);
                return;
            }
            else
            {
                callback("Invalid key");
            }

         
          

        });

    });

    
  }


  var readConfigurations=(id,client,db,callback)=>{


    


        const collection = db.collection(configurationTable);

        collection.find({'callbackId':id},{"fields":{"_id":false}}).toArray(function(err,docs){
            client.close();
            if(err){
                 callback(err);
                return;
            }
            
            if(docs.length>0){

                //here we need to read the configuration data.
                //also for the firsttime we need to save the configuration data too?
                callback(null,docs[0]);
                return;
            }
            else
            {
                callback(null,null);
                return;
            }
            
          

        });

  }



  var UpdateConfig=(data,callback)=>{

    getConnection(function(err,client,db){

        const collection = db.collection(usersTable);

        collection.find({'callbackId':data.callbackId}).toArray(function(err,docs){
          
            if(err){
                callback(err);
                return;
            }
            
            if(docs.length>0){


                WriteConfigurations(data,client,db,callback);
                //here we need to read the configuration data.
                //also for the firsttime we need to save the configuration data too?
                //callback(null,true);
                return;
            }
            else
            {
                callback("Invalid key");
            }
        

        });

    });


  }
  var WriteConfigurations=(data,client,db,callback)=>{


    


    const collection = db.collection(configurationTable);


   collection.replaceOne({'callbackId':data.callbackId},data,function(err,update){

            client.close();
            if(err){
                callback(err);
                 return;

            }

            var path="key/"+data.callbackId+".key";

            fs.writeFile(path, data.NexmoConfig.PRIVATE_KEY_PATH, (err) => {
                if (err) console.log(err);
                console.log("Successfully Written to File.");
               
            });
            callback(null,update.modifiedCount);


    });
}



var isCustomerExists=(id,callbackId,callback)=>{

    getConnection(function(err,client,db){

        const collection = db.collection(customersTable);

        collection.find({'key':id,"callbackId":callbackId},{"fields":{"_id":false}}).toArray(function(err,docs){
            client.close();
            if(err){
                callback(err);
                return;
            }
            
            if(docs.length>0){
                callback(null,docs[0]);
                return;
            }
            callback(null);
           

        });

    });

    
  }


  var CreateNewCustomer=(user,callbackId,callback)=>{

    getConnection(function(err,client,db){

        const collection = db.collection(customersTable);

        user.callbackId=callbackId;
        user.key=user.profile.id;
       // var user={};
        if(user.lastState==null)
            {
            user.lastState={};
            user.lastState.subject="";
            user.lastState.message="";
            user.lastState.offset=0;
            user.lastState.replyVia="";
            
            }
       

        collection.insertOne(user,function(err,data){
            client.close();
            if(err){
                callback(err,user);
                return;
            }

            callback(null,user);
            
        })
      

    });

    
  }


  var UpdateCustomer=(user,callbackId,callback)=>{

    getConnection(function(err,client,db){


        if(err)
        {
            callback(err);
            return;
        }
        const collection = db.collection(customersTable);

      
       

        collection.replaceOne({'key':user.key,"callbackId":callbackId},user,function(err,data){

            if(err){
                callback(err);
                return;
            }

            callback(null,200);
            client.close();

        });
    

    });

    
  }




  module.exports={
    isExistsAlready,
    registerNewUser,
    adminLogin,
    readConfiguration,
    UpdateConfig,
    isCustomerExists,
    CreateNewCustomer,
    UpdateCustomer
    
  }




