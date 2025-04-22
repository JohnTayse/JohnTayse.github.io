var hasCalculated = false;

var history = [];

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
	$('.btn').click(function(){
		var id = this.id;
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
		else if(id == 'history'){
			
		}
	})
});

function performCalculations(str){
	var result = math.evaluate(str);
	var fractional = math.fraction(result);
	if(fractional.d != 1){
		var fraction = formatMixedFraction(fractional);
		$('#result').html(result);
		$('#fractional').html(' [' + fraction + ']');
	}
	else{
		$('#result').html(result);
		$('#fractional').html('&nbsp;')
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