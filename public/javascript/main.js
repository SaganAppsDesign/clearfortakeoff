$(function() {

  var showView = function (page) {
    $(".contents").hide();
    $("." + page).show();
  }

  showView("input");

  $("#submit").on("click", function(e) {
      showView("loading");

      e.preventDefault();
      var flightNumber = $("#flightNumberInput").val();
      $.get("/flightdetails/" + flightNumber)
          .done(function(response) {
              console.log("success:");
              console.log(response);
              $("#result").text(response);
              showView("result");
          })
          .fail(function() {
              console.log("failed");
              showView("input");
              showView("result");
          });
    });

    $("#redo").on("click", function(e) {
        showView("input");
    });
});
