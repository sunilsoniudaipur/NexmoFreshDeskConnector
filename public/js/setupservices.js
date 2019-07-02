angular.module("app").service('setupservice', function () {


    // this.getConfiguration = function ($scope,key) {
    //     var dfd = jQuery.Deferred();
    //     var data={
    //         apikey:key
    //     }
    //     var stringifyData = JSON.stringify(data);

    //     var getUrl = window.location;
       

    //     $.ajax({
    //         url: getUrl.origin + '/getConfigurationData',
    //         data: stringifyData,
    //         dataType: "json",
    //         type: "post",
             
    //         contentType: "application/json; charset=utf-8",
    //         success: function (data) {
    //             dfd.resolve(data);

    //         },
    //         error: function (xhr, ajaxOptions, thrownError) {

    //             //alert("service error");
    //             //window.location.href = GetStatusCodeURL(xhr.status)
    //         }
    //     });
    //     return dfd.promise();
    // };


    this.getConfiguration = function ($scope,key) {
        var dfd = jQuery.Deferred();
      

        var getUrl = window.location;
       

        $.ajax({
            url: getUrl.origin + '/readconfig/'+key,
         
            dataType: "json",
            type: "get",
             
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                dfd.resolve(data);

            },
            error: function (xhr, ajaxOptions, thrownError) {

                //alert("service error");
                //window.location.href = GetStatusCodeURL(xhr.status)
            }
        });
        return dfd.promise();
    };


    this.saveConfig = function ($scope,data) {
        var dfd = jQuery.Deferred();
       
        var stringifyData = JSON.stringify(data);

        var getUrl = window.location;
       

        $.ajax({
            url: getUrl.origin + '/updateconfig',
            data: stringifyData,
            dataType: "json",
            type: "post",
             
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                dfd.resolve(data);

            },
            error: function (xhr, ajaxOptions, thrownError) {

                alert("service error");
                //window.location.href = GetStatusCodeURL(xhr.status)
            }
        });
        return dfd.promise();
    };


    // this.saveFreshdesk = function ($scope,desk,key) {
    //     var dfd = jQuery.Deferred();
    //     var data={
    //         apikey:key,
    //         freshDesk:desk
    //     }
    //     var stringifyData = JSON.stringify(data);

    //     var getUrl = window.location;
       

    //     $.ajax({
    //         url: getUrl.origin + '/savefreshdesk',
    //         data: stringifyData,
    //         dataType: "json",
    //         type: "post",
             
    //         contentType: "application/json; charset=utf-8",
    //         success: function (data) {
    //             dfd.resolve(data);

    //         },
    //         error: function (xhr, ajaxOptions, thrownError) {

    //             //alert("service error");
    //             //window.location.href = GetStatusCodeURL(xhr.status)
    //         }
    //     });
    //     return dfd.promise();
    // };


    // this.saveNexmo = function ($scope,ne,key) {
    //     var dfd = jQuery.Deferred();
    //     var data={
    //         apikey:key,
    //         nexmo:ne
    //     }
    //     var stringifyData = JSON.stringify(data);

    //     var getUrl = window.location;
       

    //     $.ajax({
    //         url: getUrl.origin + '/savenexmo',
    //         data: stringifyData,
    //         dataType: "json",
    //         type: "post",
             
    //         contentType: "application/json; charset=utf-8",
    //         success: function (data) {
    //             dfd.resolve(data);

    //         },
    //         error: function (xhr, ajaxOptions, thrownError) {

    //             //alert("service error");
    //             //window.location.href = GetStatusCodeURL(xhr.status)
    //         }
    //     });
    //     return dfd.promise();
    // };


    // this.saveAppConfig = function ($scope,config,key) {
    //     var dfd = jQuery.Deferred();
    //     var data={
    //         apikey:key,
    //         appconfig:config
    //     }
    //     var stringifyData = JSON.stringify(data);

    //     var getUrl = window.location;
       

    //     $.ajax({
    //         url: getUrl.origin + '/saveappconfig',
    //         data: stringifyData,
    //         dataType: "json",
    //         type: "post",
             
    //         contentType: "application/json; charset=utf-8",
    //         success: function (data) {
    //             dfd.resolve(data);

    //         },
    //         error: function (xhr, ajaxOptions, thrownError) {

    //             //alert("service error");
    //             //window.location.href = GetStatusCodeURL(xhr.status)
    //         }
    //     });
    //     return dfd.promise();
    // };






});