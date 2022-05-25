$(document).ready(function() {
    $("main").html(twemoji.parse($("main").html(), {folder: "svg", ext: ".svg"}));
});
