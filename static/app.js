$(document).ready(function() {
    $("main").html(twemoji.parse($("main").html(), {folder: "svg", ext: ".svg"}));
    $("footer").html(twemoji.parse($("footer").html(), {folder: "svg", ext: ".svg"}));
});
