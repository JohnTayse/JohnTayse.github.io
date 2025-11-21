var hasCalculated = false;

const numbers = {
	'one': 1,
	'two': 2,
	'three': 3,
	'four': 4,
	'five': 5,
	'six': 6,
	'seven': 7,
	'eight': 8,
	'nine': 9,
	'zero': 0,
	'decimal': '.'
}

const operators = {
	'add': '+',
	'subtract': '-',
	'multiply': '*',
	'divide': '/',
	'modulo': '%'
}

$(document).ready(function(){
	// Configure math.js to use higher precision
	math.config({
		number: 'BigNumber',
		precision: 64
	});
	
	$('#historyDiv').toggle(false);
	loadHistory();

	$('.btn').click(function(){
		var id = this.id;
		if(id == 'historyBtn'){
			$('#historyDiv').toggle();
		}
		else{
			loadHistory();
			$('#historyDiv').toggle(false);
			if(numbers[id] !== undefined && hasCalculated){
				hasCalculated = false;
				clearResults();
				$('#formula').val(numbers[id]);
			}
			else if(numbers[id] !== undefined && !hasCalculated){
				var formula = $('#formula').val();
				$('#formula').val(formula += numbers[id]);
			}
			else if(operators[id] !== undefined && hasCalculated){
				hasCalculated = false;
				var formula = $('#result').html();
				clearResults();
				$('#formula').val(formula += operators[id]);
			}
			else if(operators[id] !== undefined && !hasCalculated){
				var formula = $('#formula').val();
				$('#formula').val(formula += operators[id]);
			}
			else if(id == 'equals'){
				hasCalculated = true;
				performCalculations($('#formula').val());
			}
			else if(id == 'clear'){
				$('#formula').val('');
				clearResults();
			}
			else if(id == 'backspace'){
				hasCalculated = false;
				clearResults();
				$('#formula').val($('#formula').val().slice(0, -1));
			}
			else if(id == 'parentheses'){
				var formula = $('#formula').val();
				$('#formula').val(formula += nextParenthesisShouldBeOpen(formula));
			}
		}
	})
});

function performCalculations(str){
	loadHistory();
	var result = math.evaluate(str);
	
	// Convert BigNumber to regular number for display
	var resultNum = math.number(result);
	
	var fractional = math.fraction(resultNum);
	if(fractional.d != 1){
		var fraction = formatMixedFraction(fractional);
		$('#result').html(resultNum);
		$('#fractional').html(' [' + fraction + ']');
	}
	else{
		$('#result').html(resultNum);
		$('#fractional').html('&nbsp;')
	}

	var timestamp = new Date();
	var save = {
		"date" : timestamp.toLocaleDateString(),
		"time": timestamp.toLocaleTimeString(),
		"formula" : str,
		"result": resultNum,
	}
	saveHistory(save);
}

function displayHistory(historical){
	var histDiv = '';
	var lastDate = '';

	$.each(historical, function(index, value){
		
		if(value.date != lastDate){
			lastDate = value.date;
			histDiv += '<hr>'
			histDiv += '<span class="dateHeader">' + lastDate + '</span><br/>';
		}
		else{
			histDiv += '<br/>'
		}
		histDiv += '<p class="histFormula">' + value.formula + '</p>';
		histDiv += '<p class="histResult">' + value.result + '</p>';
	})

	histDiv += '<br/><br/>'
	histDiv += '<button type="button" id="clearHistoryBtn" class="btn btn-light">Clear History</button>'

	$('#historyDiv').html(histDiv).trigger('create');

	$('#clearHistoryBtn').click(function(){
		if(confirm('Are you sure you want to clear your calculation history? This cannot be undone.')){
			localStorage.setItem("history", JSON.stringify({}));
			$('#historyDiv').html('').trigger('create');
			loadHistory();
		}
		$('#historyDiv').toggle(true);	
	})

	$('#historyDiv').toggle(true);
	$('#historyDiv').scrollTop($("#historyDiv")[0].scrollHeight);
	$('#historyDiv').toggle(false);
}

function saveHistory(save){
	if(typeof(Storage) !== undefined){
		var local = localStorage.getItem("history");
		if(local !== null){
			var history = JSON.parse(local);
			var nextPlace = (ObjectLength(history) + 1) + "";
			history[nextPlace] = save;
			localStorage.setItem("history", JSON.stringify(history));
		}
		else{
			var history = { "1": save };
			localStorage.setItem("history", JSON.stringify(history));
		}
	}
}

function loadHistory(){
	if(typeof(Storage) !== undefined){
		var local = localStorage.getItem("history");
		if(local !== null){
			var history = JSON.parse(local);

			if(history["1"] !== undefined){
				displayHistory(history);
			}
		}
	}
}

function clearResults(){
	$('#result').html('&nbsp;');
	$('#fractional').html('&nbsp;');
}

function nextParenthesisShouldBeOpen(str) {
	let balance = 0;

	for (let char of str) {
		if (char === '(') balance++;
		else if (char === ')') balance--;
	}

	// If balance is zero or more, we need to open a parenthesis
	// If balance is negative, that means there are too many closes
	return balance <= 0 ? '(' : ')';
}

function formatMixedFraction(fractionObj) {
	if (!fractionObj || !fractionObj.isFraction) return null;

	// Get the sign, numerator, and denominator as BigInts
	const sign = BigInt(fractionObj.s);
	const numerator = BigInt(fractionObj.n);
	const denominator = BigInt(fractionObj.d);

	const absNumerator = numerator < 0n ? -numerator : numerator;
	const whole = (sign * absNumerator) / denominator;
	const remainder = absNumerator % denominator;

	if (remainder === 0n) {
		return whole.toString();
	}

	const remainderStr = `${remainder}/${denominator}`;

	if (whole === 0n) {
		return (sign < 0n ? "-" : "") + remainderStr;
	}

	return `${whole} ${remainderStr}`;
}

function ObjectLength(object) {
	var length = 0;
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			++length;
		}
	}
	return length;
};