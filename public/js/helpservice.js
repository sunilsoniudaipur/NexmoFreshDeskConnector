angular.module("app").service('helpservice', function () {

    this.helpdata = function ($scope) {
        var dfd = jQuery.Deferred();
        var stringifyData = "{}";

        var getUrl = window.location;
       // var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];

        $.ajax({
            url: getUrl.origin + '/getHelpData',
            data: stringifyData,
            dataType: "json",
            type: "get",
             
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                dfd.resolve(data);

            },
            error: function (xhr, ajaxOptions, thrownError) {

                alert("service error");
            
            }
        });
        return dfd.promise();
    };


   

});