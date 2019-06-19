// Grab the articles as a json
$( document ).ready(function() {
  $.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {

      // TODO: Convert to Handlebars template

      $(".article-container").append("<div class='card'>" +
      "<div class='card-header'>" +
      "<div class='row'>" +
      "<div class='col-9 text-center'>" + 
      "<h3>" +
      "<a class='text-light' target='_blank' href='"+ data[i].link + "'>" + data[i].title + "</a>" +
      "</div>" + 
      "<div class='col-3'>" +
      "<form class='form-inline'>" +
      "<div class='btn-group pull-right'>" +
      "<a class='btn btn-light btn-comments text-dark' data-id='" + data[i]._id + "'>Comments</a>" +
      "<a class='btn btn-danger btn-delete text-light' data-id='" + data[i]._id + "'>X</a>" + 
      "</div>" +
      "</form>" +
      "</h3>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "<div class='card-body'>" +
      "<div class='row'>" + data[i].blurb + "</div>" +
      "</div>" +
      "</div>");
    }
  });
});


$(document).on("click", ".btn-comments", function() {

  var modalId = $(this).attr("data-id");
  $("#comment-modal").attr("data-id", modalId);


  $("#comment-modal").modal({
    show: true,
    backdrop: false
  }); 


});

$(document).on("click", ".btn-save", function() {
    var comment = $("#comment-textarea").val();
    var id = $("#comment-modal").attr("data-id");
    alert(id + " " + comment);
    $.ajax({
      method: "POST",
      url: "/comments/",
      data: {
        id : id,
        comment : comment
      }
    }).then(function() {
      $("textarea").val("Note Saved!");

    });
  });



$(document).on("click", ".btn-delete", function() {
  thisId = $(this).attr("data-id");

  $.ajax({
    method: "DELETE",
    url: "/articles/",
    data : {id : thisId}
  }).then(function(data) {
    console.log(data);
    window.location.reload();
  });
});

$(document).on("click", ".scrape-new", function() {
  thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/scrape",
  }).then(function(data) {
    console.log(data);
    $("#scrape-modal").modal({
      show: true,
      backdrop: false
    }); 

  });
});



//Reload window on Bootstrap hide modal event
$("#scrape-modal").on('hidden.bs.modal', function () {
  window.location.reload();
 })
