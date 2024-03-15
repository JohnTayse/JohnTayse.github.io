var options = [];
var rankedList = [];
var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

$(document).ready(function(){
	checkForSaved();

	$('#btnAdd').click(function(){
		addOption();
	});

	$('#btnCompare').click(function(){
		rankedList = [];
		$('#compare').modal('show');

		compare(0, 1);
	})

	$('#btnResetCompare').click(function(){
		rankedList = [];
		showOptions();
	})

	$('#btnResetMatrix').click(function(){
		if(confirm('This will clear all options from the matrix. Are you sure?')){
			options = [];
			rankedList = [];
			localStorage.setItem('savedOptions', JSON.stringify([]));
			localStorage.setItem('savedRankedList', JSON.stringify([]));
			showOptions();
		}
	})

	$('#btnModalCancel').click(function(){
		rankedList = [];
		showOptions();
		$('#compare').modal('hide');
	})

	$('#btnImport').click(function(){
		$('#import').modal('show');
	})

	$('#btnModalImport').click(function(){
		importItems();
		$('#import').modal('hide');
	})
	
	$('#btnModalCancelImport').click(function(){
		$('#itemsInput').val('');
		$('#import').modal('hide');
	})

	$(document).on('keypress',function(e) {
		if(e.which == 13 && $('#decision').val() != '') {
			addOption();
		}
	});
})

function addOption(){
	var decision = $('#decision').val();

	if(options.find(x => x.toUpperCase() == decision.toUpperCase()) == undefined){
		if(options.length == alphabet.length){
			addLetter();
		}
		options.push(decision);
		rankedList = [];
		$('#decision').val('');
		showOptions();
	}
	else{
		alert('Already added!');
	}
}

function importItems(){
	var lines = $('#itemsInput').val().split('\n');
	lines.forEach(item => {
		if(options.length == alphabet.length){
			addLetter();
		}
		if(options.find(x => x.toUpperCase() == item.toUpperCase()) == undefined){
			options.push(item);
			rankedList = [];
		}
	})
	$('#itemsInput').val('');
	showOptions();
}

function addLetter(){
	var grouping = Math.floor(alphabet.length / 26);
	var letter = alphabet.length % 26;

	var nextLetter = alphabet[grouping - 1] + '' + alphabet[letter];
	alphabet.push(nextLetter);
}

function checkForSaved(){
	if(typeof(Storage) !== undefined){
		var savedOptions = JSON.parse(localStorage.getItem('savedOptions'));
		var savedRankedList = JSON.parse(localStorage.getItem('savedRankedList'));
		if(savedOptions !== null && savedOptions != ''){
			options = savedOptions;
		}
		if(savedRankedList !== null && savedRankedList != ''){
			rankedList = savedRankedList;
		}
	}
	if(options.length > alphabet.length){
		var toAddCount = options.length - alphabet.length;
		for(var i = 0; i < toAddCount; i++){
			addLetter();
		}
	}
	showOptions();
}

function showOptions(){
	var optionCount = options.length;

	if(optionCount > 0){
		var matrix = '<table id="matrixTable">';
		var finalRowHeader = '';
		var finalRow = '';
		var rankCounts = [];

		for(var i = 0; i < optionCount; i++){
			var alpha = alphabet[i];
			var task = options[i];
			var span = optionCount - i;
			matrix += '<tr>';
			for(j = 0; j < i; j++){
				var compare = options[j];
				var choiceIndex = rankedList.findIndex(x => (x.chosen == task && x.notChosen == compare)
					|| (x.chosen == compare && x.notChosen == task));
				if(choiceIndex > -1){
					var choice = rankedList[choiceIndex];
					var displayLetter = alphabet[options.indexOf(choice.chosen)];
					matrix += '<td chosen="' + choice.chosen + '" notChosen="' + choice.notChosen + '" class="choice borderAll">';
					matrix += displayLetter;
					matrix += '</td>';
				}
				else{
					matrix += '<td class="borderAll"></td>';
				}
				
			}
			matrix += '<td class="alpha">' + alpha + '</td>';
			matrix += '<td colspan="' + span + '">' + task + '&nbsp;&nbsp;';
			matrix += '<button type="button" class="btn btn-danger btn-small remove" id="' + task + '">X</button>';
			matrix += '</td>';
			matrix += '</tr>';

			finalRowHeader += '<td class="totalAlpha">' + alpha + '</td>';
			finalRow += '<td id="' + alpha + 'Total" class="total">';
			if(rankedList.length > 0){
				var choiceCount = rankedList.filter(x => x.chosen == task).length;
				finalRow += choiceCount;
				rankCounts.push(choiceCount);
			}
			finalRow += '</td>';
		}

		matrix += '<tr>' + finalRowHeader + '<td></td></tr>';
		matrix += '<tr>' + finalRow + '<td class="rank" style="border-left: 1px solid black">Totals</td></tr>';
		matrix += '</table>';

		$('#matrix').html(matrix).trigger('create');

		if(rankedList.length > 0){
			showResults(rankCounts);
		}
		else{
			$('#results').html('').trigger('create');
		}

		$('.remove').click(function(){
			var index = options.indexOf(this.id);
			if(index > -1) {
				options.splice(index, 1);
			}
			showOptions();
		})

		$('.choice').click(function(){
			var chosen = this.getAttribute("chosen");
			var notChosen = this.getAttribute("notChosen");
			if(confirm('Switch choice "' + chosen + '" for "' + notChosen + '"?')){
				var choiceIndex = rankedList.findIndex(x => (x.chosen == chosen && x.notChosen == notChosen));
				rankedList[choiceIndex] = {
					"chosen": notChosen,
					"notChosen": chosen
				};
				showOptions();
			}

		})

		if(optionCount > 1){
			$('.functionButton').prop("disabled", false);
		}
		else{
			$('.functionButton').prop("disabled", true);
		}
	}
	else{
		$('#results').html('').trigger('create');
		$('#matrix').html('').trigger('create');
		$('.functionButton').prop("disabled", true);
	}

	if (typeof (Storage) !== undefined) {
		localStorage.setItem('savedOptions', JSON.stringify(options));
		localStorage.setItem('savedRankedList', JSON.stringify(rankedList));
	}
}

function compare(option1Index, option2Index){
	var compare = '';
	compare += '<button type="button" class="btn btn-info" id="option1" index="' + option1Index + '">' + options[option1Index] + '</button>';
	compare += ' or<br/>';
	compare += '<button type="button" class="btn btn-light" id="option2" index="' + option2Index + '">' + options[option2Index] + '</button>';
	compare += '?';

	$('#compare .modal-body').html(compare).trigger('create');
	$('#compare').modal('show');

	$('#option1').click(function(){
		makeChoice($('#option1').attr('index'), $('#option2').attr('index'));
	})

	$('#option2').click(function(){
		makeChoice($('#option2').attr('index'), $('#option1').attr('index'));
	})
}

function makeChoice(chosenIndex, notChosenIndex){
	var choice = {
		"chosen": options[chosenIndex],
		"notChosen": options[notChosenIndex]
	};
	rankedList.push(choice);

	var minChoice = Math.min(chosenIndex, notChosenIndex);
	var maxChoice = Math.max(chosenIndex, notChosenIndex);

	if(maxChoice == options.length - 1 && minChoice == maxChoice - 1){
		$('#compare .modal-body').html('').trigger('create');
		$('#compare').modal('hide');
		showOptions();
	}
	else if(maxChoice == options.length - 1){
		compare(minChoice + 1, minChoice + 2);
	}
	else{
		compare(minChoice, maxChoice + 1);
	}
}

function showResults(rankCounts){
	var sortArray = [];
	for(var i = 0; i < options.length; i++){
		var option = options[i];
		var count = rankCounts[i];
		var sort = {
			"option": option,
			"count": count
		};

		sortArray.push(sort);
	}

	//modify any counts to get distinct ranks
	for(var j = 1; j <= sortArray.length; j++){
		var rank = sortArray.filter(x => x.count == j);
		if(rank.length > 1){
			for(var k = 0; k < rank.length; k++){
				for(var m = 0; m < sortArray.length; m++){
					if(k != m){
						var compareK = sortArray[k];
						var compareM = sortArray[m];
						if(compareK.count == compareM.count){
							var choice = rankedList.filter(x => (x.chosen == compareK.option && x.notChosen == compareM.option)
								|| (x.chosen == compareM.option && x.notChosen == compareK.option))[0];
							if(choice.chosen == compareK.option){
								sortArray[k].count += 1;
							}
							else{
								sortArray[m].count += 1;
							}
						}
					}
				}
			}
		}
	}

	sortArray.sort((a, b) => b.count - a.count);

	var results = '<h3>Ranked Results</h3>';
	results += '<table id="matrixTable">';

	for(var s = 0; s < sortArray.length; s++){
		results += '<tr>';
		results += '<td class="rank">' + (s + 1) + '</td>';
		results += '<td>' + sortArray[s].option + '</td>';
		results += '</tr>';
	}
	results += '</table>';

	$('#results').html(results).trigger('create');
}