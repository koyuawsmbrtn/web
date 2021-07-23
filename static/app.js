$(document).ready(function() {
    function updateNowPlaying() {
        $.getJSON("https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=bubblineyuri&api_key=1ebf7f35cb5aa1cb9b9804f88fb16339&format=json&limit=1", function(data) {
            $("#nowplaying").html("Now playing: "+data["recenttracks"]["track"][0]["artist"]["#text"]+" – "+data["recenttracks"]["track"][0]["name"]);
        });
    }
    $("body").html(twemoji.parse($("body").html(), {folder: "svg", ext: ".svg"}));
    $("body").prepend("<div id=\"nowplaying\"></div>");
    //$("#nowplaying").attr("style", "right:20px;position:absolute;");
    updateNowPlaying();
    window.setInterval(function() {
        updateNowPlaying();
    }, 1000);
    $("body").html($("body").html().replaceAll("href=\"https://", "target=\"_blank\" href=\"https://"));
});