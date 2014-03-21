// JavaScript Document
jQuery.extend({
    stepForm: function(txtBack, txtNext, token){
    		var fieldsets = $((token || 'fieldset'), $("form.stepMe"));
        var total = $(fieldsets).length;
				$(fieldsets).each(function(x,el){
			    if (x > 0) {
			      $(el).hide();
			      $(el).append('<a class="backStep btn btn-default" href="#x_' + (x-1) + '">'+ (txtBack || 'Volver') +'</a>');
			      $(".backStep", $(el)).bind("click", function(){
			                $("#x_" + (x - 1)).show();
			                $(el).hide();
			       });
			    }

			    if ((x+1)< total) {
			        $(el).append('<a class="nextStep btn btn-default" href="#_' + (x+1) + '">'+(txtNext || 'Seguir')+'</a>');
			        $(".nextStep", $(el)).bind("click", function(){
			                $("#x_" + (x + 1)).show();
			                $(el).hide();
			        });
			    }
			    $(el).attr("id", "x_" + x);
			});
    }
});
$(document).ready(function() {
	$.stepForm();
});


