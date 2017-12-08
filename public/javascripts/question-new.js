$(function($){
  $('.tab > ul > li > a').click(function(e) {
    var $item = $(e.currentTarget).parent();
    var idx = $item.index() + 1;
    var $tab = $item.closest(".tab");
    $tab.find(">ul>li").removeClass('active');
    $tab.find(".section").removeClass('selected');

    if($(this).attr('id') === "FREE"){
      $tab.find("#FREE").addClass("active");
      $tab.find("#PAID").removeClass("active");
      $tab.find(".section>ul>#payinput").attr("readonly",true).attr("disabled",false);
      $tab.find(".section>ul>#payinput").val('FREE');
    } else if($(this).attr('id') === "PAID"){
      $tab.find("#PAID").addClass("active");
      $tab.find("#FREE").removeClass("active");
      $tab.find(".section>ul>#payinput").val('').attr('placeholder', 'Input Ticket Price   ex) 10,000');
      $tab.find(".section>ul>#payinput").attr("readonly",false).attr("disabled",false);  
    }
    $tab.find(".section").addClass("selected");
  });
}); 

function changeTypeSelect(){
  $("#typeResult").val($("#type option:selected").val());
} 

function changeTopicSelect(){
  $("#topicResult").val($("#topic option:selected").val());
}

$(document).ready(function(){
  $("#typeResult").attr("readonly",true).attr("disabled",false);
  $("#topicResult").attr("readonly",true).attr("disabled",false);
  $("#typeResult").hide();
  $("#topicResult").hide();
});