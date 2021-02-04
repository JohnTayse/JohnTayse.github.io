$(document).ready(function(){
	$('input[type=radio][name=units]').change(function(){
		var units = $("input:radio[name=units]:checked'").val();
		if(units === "imperial"){
			$('#imperialInputs').show();
			$('#metricInputs').hide();
		}
		else if(units === "metric"){
			$('#imperialInputs').hide();
			$('#metricInputs').show();
		}
	})

	$('#scale').change(function(){
		var scale = $('#scale').val();
		if(scale === "custom"){
			$('#custom').show();
		}
		else {
			$('#custom').hide();
		}
	})

	$('#calculate').click(function(){
		calculate();
	})

	$('#clear').click(function(){
		$('#feet').val('');
		$('#inches').val('');
		$('#meters').val('');
		$('#centimeters').val('');
		$('#result').text('');
	})
})

function calculate(){
	var scale = $('#scale').val();
	if(scale === "custom"){
		scale = $('#customScale').val()
	}

	var result = "";

	var units = $("input:radio[name=units]:checked'").val();
	if(units === "imperial"){
		var inches = $('#inches').val() * 1;
		var feetInInches = $('#feet').val() * 12;
		inches += feetInInches;
		
		result = (inches / scale).toFixed(3) + " in";
	}
	else if(units === "metric"){
		var centimeters = $('#centimeters').val() * 1;
		var metersInCm = $('#meters').val() * 100;
		centimeters += metersInCm;
		
		result = (centimeters / scale).toFixed(3) + " cm";
	}

	$('#result').text(result);
}