import $ from "jquery";
import twemoji from "twemoji";

$(document).ready(function() {
    $("main").html(twemoji.parse($("main").html(), {folder: "svg", ext: ".svg"}));
});