import twemoji from 'twemoji';
import $ from 'jquery';

$(document).ready(() => {
    $("main").html(twemoji.parse($("main").html()));
});