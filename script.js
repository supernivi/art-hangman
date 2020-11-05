$('#alphabet').hide();
$('.results-social').hide();
$('#moreGames').hide();
$('#gotoquiz').hide();
$('#correctAns').hide();
$('#toggle-skip1').hide();

$('.btn').on('click', handleClick);

var hangman = {};
let hangmanObject = {};
let quesIndex = 0;
let scoreCounter = 0;
let questionCounter = 0;
let skipCounter = 0;

function handleClick(e) {
  let id = e.target.id,
    buttonId = $('#newGame');

  let action = {
    newGame: () => initialize(),
    letter: () => processGuess(id),
    hint: () => showHint(hangman.hintsUsed)
  };

  if (hangman.newGame) {
    id.length > 1 ? action[id]() : action.letter();
  } else {
    id === 'newGame' ? action.newGame() : shakeButton(buttonId);
  }
}

function shakeButton(id) {
  id.addClass('shake');
  setTimeout(() => id.removeClass('shake'), 200);
}

function initialize() {
  $('#correctAns').hide().attr('src', './correct.jpg');
  $('#hangman-figure').show(800);
  $('#stick-figure').show(800);

  resetGame().then(newGame => {
    hangman = newGame;
    updateCategory(hangman.question)
    appendSpaces();
    $('#quesNum').text(`${quesIndex}/9 `).delay(100);
    $('#scoreCount').text(`Score : ${scoreCounter}`);
  });
}

$('#skip').click(() => {
  console.log("QuesIndex : " + quesIndex);
  if (quesIndex == 8) {
    ++skipCounter
    setTimeout(()=>initialize(), 700);
    $('#toggle-skip').hide();
    $('#toggle-skip1').show();
  }
  else {
    ++skipCounter;
    console.log("SkipCounter : " + skipCounter);
    setTimeout(()=>initialize(), 700);
  }
});


$('#skip1').click(() => {
  ++skipCounter
  console.log("QuesIndex : " + quesIndex);
  console.log("SkipCounter : " + skipCounter);
  setTimeout(()=>gameOver(), 800);
});


/*$('#skip').click(() => {
  console.log("QuesIndex : " + quesIndex);
  if (quesIndex < 9 && skipCounter < 8) {
    ++skipCounter;
    console.log("SkipCounter : " + skipCounter);
    setTimeout(()=>initialize(), 700);
  }
  else if(skipCounter == 9) {
  	console.log("QuesIndex : " + quesIndex);
	console.log("SkipCounter : " + skipCounter);
	setTimeout(()=>gameOver(), 800);
  }
  else {
  	++skipCounter
	console.log("QuesIndex : " + quesIndex);
	console.log("SkipCounter : " + skipCounter);
	setTimeout(()=>gameOver(), 800);
  }
});*/

async function getWord() {
  questionCounter = fetch("data.json").then((res) => res.json()).then(data => questionCounter = data.length);
  return fetch("data.json")
    .then((res) => res.json())
    .then((data) => data[quesIndex++]);
}

function resetGame() {
  //reset text, stick figure, button styles
  $('#word-letters').show(800);
  $('#newGame').hide(400);
  $('#gotoquiz').hide(400);
  $('#moreGames').hide(400);
  $('.results-social').hide(400);
  $('#alphabet').show(800);
  $('#question-text').show(800);
  $('#hintParent').show(800);
  $('.guessed-right').text('');
  $('#word-letters').empty();
  $('svg > circle, line').removeClass().addClass('hide-hangman');
  $('#category-label').removeClass().addClass('badge').text('Loading...');
  $('#hintParent').empty();
  $('.btn').removeClass().addClass('btn btn-primary');
  $('.letter').removeClass().addClass('btn btn-primary');
  $('#hint').removeClass().addClass('btn btn-info');
  //request new word
  return new Promise(resolve => resolve(getWord()))
}

function updateCategory(val) {
  let category = `${val}`;
  $('#category-label').text('');
  $('#question-text').text('').append(category);
}

function appendSpaces() {
  const createSpace = (el, i) => {
    let isPunct = /\W/.test(el),
      id = isPunct ? 'punct' + i : el.toLowerCase() + i,
      className = isPunct ? 'show-letter punct' : 'hide-letter',
      span = `<span id=${id} class="${className}">${el}</span>`;
    return `<div class="guessed-right">${span}</div>`;
  };

  $('#word-letters').append(hangman.answer.map((el, i) => {
    return /\s/.test(el) ? '&emsp;' : createSpace(el, i);
  }));
}

function processGuess(id) {
  let guessLetter = $('#' + id),
    letterInWord = hangman.answer.includes(id);

  guessLetter.removeClass().addClass('btn btn-secondary letter disableClick');

  letterInWord ? showLetter(id) : addToHangman();
}

function showLetter(id) {
  for (let i = 0; i < hangman.answer.length; i++) {
    if (id === hangman.answer[i]) {
      $('#' + id.toLowerCase() + i).removeClass().addClass('show-letter');
    }
  }
  checkForWin();
}

function addToHangman() {
  let lastIncorrect = hangman.stickIndex === 5,
    stickPart = hangman.stickFigure[hangman.stickIndex];

  $('#' + stickPart).removeClass('hide-hangman').addClass('show-hangman');

  if (lastIncorrect) {
    $('.hide-letter').removeClass().addClass('show-letter');
    $('.btn').removeClass().addClass('btn btn-secondary disableClick');
    if (quesIndex < questionCounter) {
      setTimeout(() => initialize(), 2400);
    }
    else setTimeout(() => {gameOver();}, 2400);
  }
  else {
    hangman.stickIndex += 1;
  }
}

function showHint(index) {
  hangman.hintsUsed += 1;

  let newHint = `<p><span>${index + 1}/2 - </span>${hangman.hints[index]}</p>`;
  $('#hintParent').append(newHint);

  if (hangman.hintsUsed === 2) {
    $('#hint').removeClass().addClass('btn btn-secondary disableClick');
  }
}

function checkForWin() {
  let playerWon = $('.guessed-right > .hide-letter').length === 0;

  if (playerWon) {
    ++scoreCounter;
    $('#scoreCount').text(`Score : ${scoreCounter}`);
    $('#correctAns').show();
    $('#hangman-figure').hide();
    $('#stick-figure').hide();
    $('.btn').removeClass().addClass('btn btn-secondary disableClick');
    if (quesIndex < questionCounter) {
      setTimeout(() => initialize(), 2400);
    }
    else setTimeout(() => {gameOver(); $('#correctAns').attr('src', './dali_0_3.jpg');}, 2400);
  }
}
function gameOver() {
  hangman.newGame = false;
  $('#correctAns').attr('src', '');
  $('.btn').removeClass().addClass('btn btn-primary');
  $('#hangman-figure').hide();
  $('#stick-figure').hide();
  $('#word-letters').hide();
  $('#newGame').show().text('Play Again').unbind().click(() => location.reload());
  $('#gotoquiz').show().click(() => window.location = 'https://guesstheartist.artfervour.com/');
  $('#moreGames').show().click(() => window.location = 'https://www.artfervour.com/af-games');
  $('.results-social').show();
  $('#alphabet').hide();
  $('#question-text').hide();
  $('#hintParent').hide();
  // $('.hide-letter').removeClass().addClass('show-letter');

  let mssg = $('#category-label'),
    sc03 = `<span><br><br>Aaah you're killing me, try harder!<br><br><br>Your Score : ${scoreCounter}/${questionCounter}</span>`,
    sc46 = `<span><br><br>Hmm you're getting there. Valiant effort!<br><br><br>Your Score : ${scoreCounter}/${questionCounter}</span>`,
    sc79 = `<span><br><br>My God! You're a genius!<br><br><br>Your Score : ${scoreCounter}/${questionCounter}</span>`,
    skip = `<span><br><br>Skipped Questions : ${skipCounter}</span>`;

  mssg.empty().removeClass('badge-secondary');

  if (scoreCounter >= 0 && scoreCounter <= 3) {
    $('#correctAns').attr('src', './dali_0_3.jpg').show();
    mssg.append(sc03);
    mssg.append(skip);
  }
  else if (scoreCounter >= 4 && scoreCounter <= 6) {
    $('#correctAns').attr('src', './dali_4_6.jpg').show();
    mssg.append(sc46);
    mssg.append(skip);
  }
  else {
    $('#correctAns').attr('src', './dali_7_9.jpg').show();
    mssg.append(sc79);
    mssg.append(skip);
  }
}
