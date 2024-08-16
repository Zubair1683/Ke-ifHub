
$(document).ready(function() {
 
    evaluatePagging();
    /*console.log($("#projNum").text());
    let num = parseInt($("#projNum").attr("value"));

        if(num < 4)
        num++;

        //console.log(num)
        $("#projNum").attr("value", num);
        $("#projNum").empty().append(num);
        console.log($("#projNum").attr("value"))
    console.log($("#projNum").text());*/
    $("#downButton").click(function() {
      
        let num = parseInt($("#projNum").attr("value"));

        if(num < 4){
          num++;
          $("#projNum").attr("value", num);
          $("#projNum").empty().append(num);
        }
      
        evaluatePagging();

        window.location.href = `http://www.localhost:3000/projectss/project${num}`;
    });

    $("#upButton").click(function() {

        let num = parseInt($("#projNum").attr("value"));

        if(num > 1)
        num--;

        $("#projNum").attr("value", num);
        $("#projNum").empty().append(num);
        //evaluatePagging();

        window.location.href = `http://www.localhost:3000/projectss/project${num}`;
    });
});

function evaluatePagging(){
    if ($("#projNum").attr("value") === "1") {
        $("#upButton").css("display", "none");
        $("#upButton").empty().append("");
    } else if ($("#projNum").attr("value") === "4") {
        $("#downButton").css("display", "none");
        $("#downButton").empty().append("");
    }
    else{
        $("#downButton").css("display", "block");
        $("#upButton").css("display", "block");
        $("#upButton").empty().append("&#8593;");
        $("#downButton").empty().append("&#8595;");
        $("#upButton").css("border", "2px outset #464646");
        $("#downButton").css("border", "2px outset #464646");
    }


    $(document).ready(function () {
        // When hovering over an image with the class 'imagebutton'
        $('.imagebutton').hover(function () {
          // Increase the image size on hover
          $(this).find('img').css({
            'transform': 'scale(1.05)', // Scale factor
            'transition': 'transform 0.5s ease' // Smooth transition
          });
        }, function () {
          // Restore the original size when mouse leaves
          $(this).find('img').css({
            'transform': 'scale(1)', // Original scale
            'transition': 'transform 0.5s ease' // Smooth transition
          });
        });
      });
}




