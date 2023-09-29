var fromFavoriteScale = "";
var toFavoriteScale = "";
var scales = {
	'1': 'Prototype (1:1)',
	'12' : '1" (1:12)',
	'22.5' : 'G (1:22.5)',
	'24' : '1/2" (1:24)',
	'29' : 'G (1:29)',
	'32' : 'G/One (1:32)',
	'43.5' : 'O UK (1:43.5)',
	'45' : 'O Europe (1:45)',
	'48' : 'O US (1:48)',
	'64' : 'S (1:64)',
	'76.2' : 'OO (1:76.2)',
	'87' : 'HO (1:87)',
	'120' : 'TT (1:120)',
	'160' : 'N (1:160)',
	'220' : 'Z (1:220)',
	'480' : 'T (1:480)',
	'custom' : 'Custom',
}

$(document).ready(function(){
	for (var scale in scales) {
		var option = '<option value="' + scale + '">' + scales[scale] + '</option>';
		$('#fromScale').append(option);
		$('#toScale').append(option);
	}

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

	$('.scaleSelect').change(function(){
		var fromScale = $('#fromScale').val();
		var toScale = $('#toScale').val();
		
		if(fromScale === "custom"){
			$('#fromCustom').show();
		}
		else {
			$('#fromCustom').hide();
		}
		if(toScale === "custom"){
			$('#toCustom').show();
		}
		else {
			$('#toCustom').hide();
		}

		if(fromScale == fromFavoriteScale){
			$('#fromFavorite').html('&#9733');
		}
		else {
			$('#fromFavorite').html('&#9734');
		}
		if(toScale == toFavoriteScale){
			$('#toFavorite').html('&#9733');
		}
		else {
			$('#toFavorite').html('&#9734');
		}

		calculate();
	})

	$('#fromFavorite').click(function(){
		var scale = $('#fromScale').val();
		if(scale === "custom"){
			scale = $('#fromCustomScale').val();
		}

		if(scale == fromFavoriteScale){
			//un-favorite
			localStorage.setItem('fromFavorite', '');
			fromFavoriteScale = "";
			$('#fromFavorite').html('&#9734');
		}
		else {
			localStorage.setItem('fromFavorite', scale);
			fromFavoriteScale = scale;
			$('#fromFavorite').html('&#9733');
		}
	})

	$('#toFavorite').click(function(){
		var scale = $('#toScale').val();
		if(scale === "custom"){
			scale = $('#toCustomScale').val();
		}

		if(scale == toFavoriteScale){
			//un-favorite
			localStorage.setItem('toFavorite', '');
			toFavoriteScale = "";
			$('#toFavorite').html('&#9734');
		}
		else {
			localStorage.setItem('toFavorite', scale);
			toFavoriteScale = scale;
			$('#toFavorite').html('&#9733');
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
	$('#millimeters').keyup(function(){
		calculate();
	})

	$('#clear').click(function(){
		clear();
	})

	if(typeof(Storage) !== undefined){
		var fromFavorite = localStorage.getItem('fromFavorite');
		var toFavorite = localStorage.getItem('toFavorite');
		if(fromFavorite !== null && fromFavorite != ''){
			$('#fromScale').val(fromFavorite);
			if($('#fromScale').val() != fromFavorite){
				$('#fromScale').val('custom');
				$('#fromCustom').show();
				$('#fromCustomScale').val(fromFavorite);
			}
			fromFavoriteScale = fromFavorite;
			$('#fromFavorite').html('&#9733');
		}
		if(toFavorite !== null && toFavorite != ''){
			$('#toScale').val(toFavorite);
			if($('#toScale').val() != toFavorite){
				$('#toScale').val('custom');
				$('#toCustom').show();
				$('#toCustomScale').val(toFavorite);
			}
			toFavoriteScale = toFavorite;
			$('#toFavorite').html('&#9733');
		}
	} else {
		$('#fromFavorite').remove();
		$('#toFavorite').remove();
	}
})

function clear(){
	$('#feet').val('');
	$('#inches').val('');
	$('#meters').val('');
	$('#millimeters').val('');

	var units = $("input:radio[name=units]:checked'").val();
	$('#resultImperial').html('0 in');
	$('#resultMetric').html('0 mm');
}

function calculate(){
	var fromScale = $('#fromScale').val();
	var toScale = $('#toScale').val();
	if(fromScale === "custom"){
		fromScale = $('#fromCustomScale').val()
	}
	if(toScale === "custom"){
		toScale = $('#toCustomScale').val()
	}

	var resultImperial = "";
	var resultMetric = "";

	var units = $("input:radio[name=units]:checked'").val();
	if(units === "imperial"){
		var inches = $('#inches').val() * 1;
		var feetInInches = $('#feet').val() * 12;
		inches += feetInInches;

		var value = (inches * (fromScale / toScale)).toFixed(3);

		if(value == 0){
			value = "0";
			resultMetric = "0 mm";
		}
		else{
			var valueMetric = (value * 25.4).toFixed(3);
			resultMetric = valueMetric + " mm";
		}

		if(value > 60){
			var valueFeet = Math.floor(value / 12);
			var valueInches = (value % 12).toFixed(3);
			resultImperial = valueFeet + "' " + valueInches + '"';
		}
		else{
			resultImperial = value + " in";
		}
	}
	else if(units === "metric"){
		var millimeters = $('#millimeters').val();
		var metersInMm = $('#meters').val() * 1000;
		millimeters += metersInMm;

		var value = (millimeters * (fromScale / toScale)).toFixed(3);

		if(value == 0){
			value = "0";
			resultImperial = "0 in";
		}
		else{
			var valueImperial = (value / 25.4).toFixed(3);
			if(valueImperial > 60){
				var valueFeet = Math.floor(valueImperial / 12);
				var valueInches = (valueImperial % 12).toFixed(3);
				resultImperial = valueFeet + "' " + valueInches + '"';
			}
			else{
				resultImperial = valueImperial + " in";
			}
		}
		
		resultMetric = value + " mm";
	}

	$('#resultImperial').text(resultImperial);
	$('#resultMetric').text(resultMetric);
}