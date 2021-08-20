$(document).ready(function() {
    $("body").html(twemoji.parse($("body").html(), {folder: "svg", ext: ".svg"}));
});