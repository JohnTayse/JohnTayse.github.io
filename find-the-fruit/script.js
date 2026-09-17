const TOTAL_SQUARES = 15;
const FRUIT_COUNT = 8; // number of fruit squares hidden on the board
const STORAGE_KEY = "vivacitySquaresState";

const FRUITS = [
	{ emoji: "🍎", name: "Apple", fact: "An apple a day is only about 95 calories and packs 4g of fiber." },
	{ emoji: "🍌", name: "Banana", fact: "Bananas are rich in potassium, which helps regulate blood pressure." },
	{ emoji: "🍊", name: "Orange", fact: "One orange provides more than 100% of your daily vitamin C needs." },
	{ emoji: "🍇", name: "Grapes", fact: "Grapes contain antioxidants called polyphenols that support heart health." },
	{ emoji: "🍓", name: "Strawberry", fact: "Strawberries have more vitamin C, ounce for ounce, than oranges." },
	{ emoji: "🍍", name: "Pineapple", fact: "Pineapple contains bromelain, an enzyme that aids digestion." },
	{ emoji: "🥝", name: "Kiwi", fact: "A single kiwi has about as much vitamin C as an orange." },
	{ emoji: "🍑", name: "Peach", fact: "Peaches are a good source of vitamin A, which supports eye health." },
	{ emoji: "🍉", name: "Watermelon", fact: "Watermelon is about 92% water, making it great for hydration." },
	{ emoji: "🍒", name: "Cherries", fact: "Cherries are one of the few natural sources of melatonin." },
	{ emoji: "🥭", name: "Mango", fact: "One mango provides your full daily dose of vitamin C and vitamin A." },
	{ emoji: "🍐", name: "Pear", fact: "A medium pear has about 6g of fiber, more than most other fruits." },
	{ emoji: "🍋", name: "Lemon", fact: "Lemons contain citric acid that may help prevent kidney stones." },
	{ emoji: "🥥", name: "Coconut", fact: "Coconut water is naturally rich in electrolytes like potassium." },
	{ emoji: "🫐", name: "Blueberries", fact: "Blueberries rank among the highest antioxidant foods available." },
	{ emoji: "🍈", name: "Melon", fact: "Cantaloupe melon is loaded with vitamin A for healthy skin and eyes." },
];

const JUNK = [
	{ emoji: "🍔", name: "Burger", fact: "A typical fast-food burger can pack over 500 calories and 25g of fat." },
	{ emoji: "🍟", name: "Fries", fact: "A large order of fries can contain more than 500 calories and lots of sodium." },
	{ emoji: "🍕", name: "Pizza", fact: "Two slices of pepperoni pizza can have over 600mg of sodium." },
	{ emoji: "🌭", name: "Hot Dog", fact: "Processed meats like hot dogs are linked to increased health risks when eaten often." },
	{ emoji: "🍩", name: "Donut", fact: "A glazed donut has about 12g of sugar — nearly half the daily recommended limit." },
	{ emoji: "🍪", name: "Cookie", fact: "Store-bought cookies often contain trans fats that can raise bad cholesterol." },
	{ emoji: "🥤", name: "Soda", fact: "A single can of soda can have around 39g of added sugar." },
	{ emoji: "🧁", name: "Cupcake", fact: "A frosted cupcake can contain as much sugar as a candy bar." },
	{ emoji: "🍦", name: "Ice Cream", fact: "A single scoop of premium ice cream can have over 300 calories." },
	{ emoji: "🥓", name: "Bacon", fact: "Bacon is high in saturated fat and sodium, even in small portions." },
	{ emoji: "🍫", name: "Candy Bar", fact: "A standard chocolate candy bar can contain over 20g of sugar." },
	{ emoji: "🌮", name: "Loaded Taco", fact: "A loaded fast-food taco can pack in over 700mg of sodium." },
	{ emoji: "🍿", name: "Buttered Popcorn", fact: "Movie-theater popcorn with butter can exceed 1,000 calories per bucket." },
	{ emoji: "🥨", name: "Pretzel", fact: "Mall-style soft pretzels are often high in refined carbs and sodium." },
	{ emoji: "🍰", name: "Cake Slice", fact: "A slice of frosted cake can contain as much sugar as several cookies combined." },
	{ emoji: "🌰", name: "Candied Nuts", fact: "Sugar-glazed nuts pack extra calories on top of an otherwise healthy snack." },
];

const boardEl = document.getElementById("board");
const chancesEl = document.getElementById("chances-value");
const scoreEl = document.getElementById("score-value");
const messageEl = document.getElementById("message");
const factBoxEl = document.getElementById("fact-box");
const resetButtonEl = document.getElementById("reset-button");

let chancesLeft = 0;
let score = 0;
let gameOver = false;
let squares = []; // { btn, item, revealed }
let stickyFactText = ""; // last fact shown from an actual reveal (click), restored after hover

function getCurrentQuarter() {
	const month = new Date().getMonth(); // 0-11
	return Math.floor(month / 3) + 1; // 1-4
}

function getChancesForQuarter(quarter) {
	return quarter * 2;
}

function shuffle(arr) {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

function getMonthKey(date = new Date()) {
	return `${date.getFullYear()}-${date.getMonth()}`;
}

function buildBoardLayout() {
	const fruitItems = shuffle(FRUITS)
		.slice(0, FRUIT_COUNT)
		.map((item) => ({ type: "fruit", ...item }));
	const junkItems = shuffle(JUNK)
		.slice(0, TOTAL_SQUARES - FRUIT_COUNT)
		.map((item) => ({ type: "junk", ...item }));
	return shuffle(fruitItems.concat(junkItems));
}

function loadState() {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY));
	} catch {
		return null;
	}
}

function saveState() {
	const state = {
		month: getMonthKey(),
		quarter: getCurrentQuarter(),
		chancesLeft,
		score,
		gameOver,
		squares: squares.map((sq) => ({ ...sq.item, revealed: sq.revealed, pickedByPlayer: sq.pickedByPlayer })),
	};
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function initGame() {
	const saved = loadState();
	if (saved && saved.month === getMonthKey()) {
		restoreGame(saved);
	} else {
		startNewGame();
	}
}

function renderBoard(items) {
	boardEl.innerHTML = "";
	squares = items.map((item) => {
		const { revealed, pickedByPlayer, ...rest } = item;
		const entry = { item: rest, revealed: !!revealed, pickedByPlayer: !!pickedByPlayer };

		const btn = document.createElement("button");
		btn.className = "square";
		btn.setAttribute("aria-label", "Hidden square");
		btn.addEventListener("click", () => revealSquare(entry));
		btn.addEventListener("mouseenter", () => previewFact(entry));
		btn.addEventListener("mouseleave", restoreStickyFact);
		boardEl.appendChild(btn);

		entry.btn = btn;
		applySquareVisual(entry);
		return entry;
	});
}

function applySquareVisual(entry) {
	entry.btn.textContent = entry.revealed ? entry.item.emoji : "❓";
	entry.btn.classList.toggle("revealed", entry.revealed);
	entry.btn.classList.toggle("disabled", entry.revealed);
	entry.btn.classList.toggle("player-picked", entry.revealed && entry.pickedByPlayer);
	if (entry.revealed) {
		entry.btn.classList.add(entry.item.type);
	}
}

function formatFact(item) {
	return `${item.emoji} ${item.name} — ${item.fact}`;
}

function previewFact(entry) {
	if (!entry.revealed) return;

	factBoxEl.textContent = formatFact(entry.item);
	factBoxEl.classList.add("visible");
}

function restoreStickyFact() {
	factBoxEl.textContent = stickyFactText;
	factBoxEl.classList.toggle("visible", !!stickyFactText);
}

function startNewGame() {
	const quarter = getCurrentQuarter();
	chancesLeft = getChancesForQuarter(quarter);
	score = 0;
	gameOver = false;
	stickyFactText = "";

	chancesEl.textContent = chancesLeft;
	scoreEl.textContent = score;
	messageEl.textContent = "";
	messageEl.classList.remove("game-over");
	factBoxEl.classList.remove("visible");
	factBoxEl.textContent = "";

	renderBoard(buildBoardLayout());

	// Starting the board consumes the player's one attempt for the month.
	saveState();
}

function restoreGame(saved) {
	chancesLeft = saved.chancesLeft;
	score = saved.score;
	gameOver = saved.gameOver;
	stickyFactText = "";

	chancesEl.textContent = chancesLeft;
	scoreEl.textContent = score;
	factBoxEl.classList.remove("visible");
	factBoxEl.textContent = "";

	renderBoard(saved.squares);

	if (gameOver) {
		messageEl.textContent = `Game over! You found ${score} out of ${FRUIT_COUNT} fruits. Come back next month to play again!`;
		messageEl.classList.add("game-over");
	} else {
		messageEl.textContent = "";
		messageEl.classList.remove("game-over");
	}
}

function revealSquare(entry) {
	if (gameOver || entry.revealed) return;

	entry.revealed = true;
	entry.pickedByPlayer = true;
	applySquareVisual(entry);

	stickyFactText = formatFact(entry.item);
	factBoxEl.textContent = stickyFactText;
	factBoxEl.classList.add("visible");

	if (entry.item.type === "fruit") {
		score++;
		scoreEl.textContent = score;
	}

	chancesLeft--;
	chancesEl.textContent = chancesLeft;

	checkGameOver();
	saveState();
}

function checkGameOver() {
	const allRevealed = squares.every((sq) => sq.revealed);

	if (chancesLeft <= 0 || allRevealed) {
		gameOver = true;
		revealRemainingSquares();
		messageEl.textContent = `Game over! You found ${score} out of ${FRUIT_COUNT} fruits. Come back next month to play again!`;
		messageEl.classList.add("game-over");
	}
}

function revealRemainingSquares() {
	squares.forEach((entry) => {
		if (!entry.revealed) {
			entry.revealed = true;
			applySquareVisual(entry);
		}
	});
}

resetButtonEl.addEventListener("click", () => {
	localStorage.removeItem(STORAGE_KEY);
	startNewGame();
});

initGame();
