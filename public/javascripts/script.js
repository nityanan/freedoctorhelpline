/**
* Created by nitya on 22/12/16.
*/

$(document).ready(function(){
    $("#locationName").click(function () {
        console.log("inside client")
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            url: '/location',
            success: function (data) {
                console.log("success >>>>>>>")
            },
            error: function (err) {
                console.log("error")
            }
        })
    })
})
