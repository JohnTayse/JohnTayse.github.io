var favoriteScale = "";

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

		if(scale == favoriteScale){
			$('#favorite').html('&#9733');
		}
		else {
			$('#favorite').html('&#9734');
		}
	})

	$('#favorite').click(function(){
		var scale = $('#scale').val();
		if(scale === "custom"){
			scale = $('#customScale').val();
		}

		if(scale == favoriteScale){
			//un-favorite
			localStorage.setItem('favorite', '');
			favoriteScale = "";
			$('#favorite').html('&#9734');
		}
		else {
			localStorage.setItem('favorite', scale);
			favoriteScale = scale;
			$('#favorite').html('&#9733');
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

	if(typeof(Storage) !== undefined){
		var favorite = localStorage.getItem('favorite');
		if(favorite !== null && favorite != ''){
			$('#scale').val(favorite);
			if($('#scale').val() != favorite){
				$('#scale').val('custom');
				$('#custom').show();
				$('#customScale').val(favorite);
			}
			favoriteScale = favorite;
			$('#favorite').html('&#9733');
		}
	} else {
		$('#favorite').remove();
	}
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