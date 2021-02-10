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

		clear();
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

	$('#feet').keyup(function(){
		calculate();
	})
	$('#inches').keyup(function(){
		calculate();
	})
	$('#meters').keyup(function(){
		calculate();
	})
	$('#centimeters').keyup(function(){
		calculate();
	})

	$('#clear').click(function(){
		clear();
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

function clear(){
	$('#feet').val('');
	$('#inches').val('');
	$('#meters').val('');
	$('#centimeters').val('');

	var units = $("input:radio[name=units]:checked'").val();
	if(units === "imperial"){
		$('#result').html('0 in');
	}
	else if(units === "metric"){
		$('#result').html('0 cm');
	}
}

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

		var value = (inches / scale).toFixed(3);

		if(value == 0){
			value = "0";
		}
		
		result = value + " in";
	}
	else if(units === "metric"){
		var centimeters = $('#centimeters').val() * 1;
		var metersInCm = $('#meters').val() * 100;
		centimeters += metersInCm;

		var value = (centimeters / scale).toFixed(3);

		if(value == 0){
			value = "0";
		}
		
		result = value + " cm";
	}

	$('#result').text(result);
}