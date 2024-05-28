$(document).ready(function () {
  $('a[href*=".jpg"]').each(function () {
    var styles = "width:100%;";
    if ($(this).html().includes("_right")) {
      styles = "float:right;padding:5px;";
    }
    var imguri = $(this).attr("href");
    $(this).html('<img src="' + imguri + '" style="' + styles + '">');
    $(this).attr("target", "_blank");
    $(this).attr("href", imguri);
    $(this).attr("style", "border:0;");
    $(this).parent().css("background", "transparent");
  });
  $('a[href*=".jpeg"]').each(function () {
    var styles = "width:100%";
    if ($(this).html().includes("_right")) {
      styles = "float:right;padding:5px;";
    }
    var imguri = $(this).attr("href");
    $(this).html('<img src="' + imguri + '" style="' + styles + '">');
    $(this).attr("target", "_blank");
    $(this).attr("href", imguri);
    $(this).attr("style", "border:0;");
    $(this).parent().css("background", "transparent");
  });
  $('a[href*=".png"]').each(function () {
    var styles = "width:100%";
    if ($(this).html().includes("_right")) {
      styles = "float:right;padding:5px;";
    }
    var imguri = $(this).attr("href");
    $(this).html('<img src="' + imguri + '" style="' + styles + '">');
    $(this).attr("target", "_blank");
    $(this).attr("href", imguri);
    $(this).attr("style", "border:0;");
    $(this).parent().css("background", "transparent");
  });
  $('li').each(function () {
    if (!$(this).html().includes("<a")) {
      $(this).css("list-style-type", "disc");
      $(this).css("margin-left", "20px");
      $(this).css("background", "transparent");
      $(this).css("border", "0px");
      $(this).css("padding", "0px");
      $(this).css("margin-bottom", "0px");
      $(this).css("box-shadow", "none");
      $(this).parent().css("width", "auto");
      $(this).parent().css("margin", "0px");
    }
  });
  try {
    $('li a').each(function () {
      if ($(this).attr("href").includes("gemlog")) {
        $(this).parent().remove();
      }
      if ($(this).attr("href").includes("archive/")) {
        $(this).parent().remove();
      }
    });
  } catch (e) { }
  if (window.location.pathname !== "/") {
    $.get("/navigation.json", function(data) {
      var nav = data;
      var path = window.location.pathname;
      var navhtml = "";
      for (var i = 0; i < nav.length; i++) {
        if (nav[i].path === path) {
          navhtml += '<a href="/' + nav[i].path + '" class="navitem active">' + nav[i].name + '</a>';
        } else {
          navhtml += '<a href="/' + nav[i].path + '" class="navitem">' + nav[i].name + '</a>';
        }
      }
      $("body").prepend(navhtml);
    });
  }
});
