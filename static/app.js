$(document).ready(function() {
    function updateNowPlaying() {
        $.getJSON("https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=bubblineyuri&api_key=1ebf7f35cb5aa1cb9b9804f88fb16339&format=json&limit=1", function(data) {
            try {
                if (data["recenttracks"]["track"][0]["@attr"]["nowplaying"] === "true") {
                    $("#nowplaying").html("<i class=\"fa fa-play\" aria-hidden=\"true\"></i> "+data["recenttracks"]["track"][0]["artist"]["#text"]+" – "+data["recenttracks"]["track"][0]["name"]);
                } else {
                    $("#nowplaying").html("<i class=\"fa fa-pause\" aria-hidden=\"true\"></i> "+data["recenttracks"]["track"][0]["artist"]["#text"]+" – "+data["recenttracks"]["track"][0]["name"]);
                }
            } catch (e) {
                $("#nowplaying .fa").attr("class", "fa fa-pause");
                if (!$("#nowplaying").html().includes(" ")) {
                    $("#nowplaying").html("<i class=\"fa fa-pause\" aria-hidden=\"true\"></i> "+data["recenttracks"]["track"][0]["artist"]["#text"]+" – "+data["recenttracks"]["track"][0]["name"]);
                }
            }
        });
    }
    $("body").html(twemoji.parse($("body").html(), {folder: "svg", ext: ".svg"}));
    $("body").prepend("<div id=\"nowplaying\"></div>");
    updateNowPlaying();
    window.setInterval(function() {
        updateNowPlaying();
    }, 500);
});