$(document).ready(function() {
    $("body").html(twemoji.parse($("body").html(), {folder: "svg", ext: ".svg"}));
    $("#discord").html("<img src=\"https://lanyard-profile-readme.vercel.app/api/635125063896793098?bg=000&date="+new Date().getTime()+"\">")
    window.setInterval(function() {
        $("#discord img").attr("src", "https://lanyard-profile-readme.vercel.app/api/635125063896793098?bg=000&date="+new Date().getTime());
    }, 500);
});