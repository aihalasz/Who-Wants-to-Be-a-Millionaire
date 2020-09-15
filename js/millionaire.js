/**
* Edits the number prototype to allow money formatting
*
* @param fixed the number to fix the decimal at. Default 2.
* @param decimalDelim the string to deliminate the non-decimal
*        parts of the number and the decimal parts with. Default "."
* @param breakdDelim the string to deliminate the non-decimal
*        parts of the number with. Default ","
* @return returns this number as a USD-money-formatted String
*		  like this: x,xxx.xx
*/
Number.prototype.money = function(fixed, decimalDelim, breakDelim){
	var n = this, 
	fixed = isNaN(fixed = Math.abs(fixed)) ? 2 : fixed, 
	decimalDelim = decimalDelim == undefined ? "." : decimalDelim, 
	breakDelim = breakDelim == undefined ? "," : breakDelim, 
	negative = n < 0 ? "-" : "", 
	i = parseInt(n = Math.abs(+n || 0).toFixed(fixed)) + "", 
	j = (j = i.length) > 3 ? j % 3 : 0;
	return negative + (j ? i.substr(0, j) +
		 breakDelim : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + breakDelim) +
		  (fixed ? decimalDelim + Math.abs(n - i).toFixed(fixed).slice(2) : "");
}

/**
* Plays a sound via HTML5 through Audio tags on the page
*
* @require the id must be the id of an <audio> tag.
* @param id the id of the element to play
* @param loop the boolean flag to loop or not loop this sound
*/
startSound = function(id, loop) {
	console.log("starting audio: ", id);
	soundHandle = document.getElementById(id);
	if(loop)
		soundHandle.setAttribute('loop', loop);
	soundHandle.play();
}

stopSound = function(id) {
	soundHandle = document.getElementById(id);
	soundHandle.pause();
	soundHandle.currentTime = 0;
}

/**
* The View Model that represents one game of
* Who Wants to Be a Millionaire.
* 
* @param data the question bank to use
*/
var MillionaireModel = function(data) {
	var self = this;

	// The 15 questions of this game
    this.questions = data.questions;

    // A flag to keep multiple selections
    // out while transitioning levels
    this.transitioning = false;

    // The current money obtained
 	this.money = new ko.observable(0);

 	// The current level(starting at 1) 
	 this.level = new ko.observable(10);

	this.answers = new ko.observableArray(Array(15).fill(null));
	 
 	// The three options the user can use to 
 	// attempt to answer a question (1 use each)
 	this.usedFifty = new ko.observable(false);
 	this.usedPhone = new ko.observable(false);
 	this.usedAudience = new ko.observable(false);

 	// Grabs the question text of the current question
 	self.getQuestionText = function() {
 		return self.questions[self.level() - 1].question;
 	}

 	// Gets the answer text of a specified question index (0-3)
 	// from the current question
 	self.getAnswerText = function(index) {
 		return self.questions[self.level() - 1].content[index];
	 }
	 
	 self.isGreen = (i) => self.answers()[i - 1] === true;
	 self.isRed = (i) => self.answers()[i - 1] === false;
	 self.isWhite = (i) => self.answers()[i - 1] === null;

 	// Uses the fifty-fifty option of the user
 	self.fifty = function(item, event) {
 		if(self.transitioning || !$(event.target).hasClass('hoverable'))
 			return;
		startSound('5050', false);
 		var correct = this.questions[self.level() - 1].correct;
 		var first = (correct + 1) % 4;
 		var second = (first + 1) % 4;
 		if(first == 0 || second == 0) {
 			$("#answer-one").fadeOut('slow');
 		}
 		if(first == 1 || second == 1) {
 			$("#answer-two").fadeOut('slow');
 		}
 		if(first == 2 || second == 2) {
 			$("#answer-three").fadeOut('slow');
 		}
 		if(first == 3 || second == 3) {
 			$("#answer-four").fadeOut('slow');
 		}
		self.fadeOutOption(item, event);
 	}

	self.phone_friend = function(item, event) {
		if(self.transitioning || !$(event.target).hasClass('hoverable'))
			return;
		self.stopAllAudio();
	    startSound('phone_main', false);
	    $("body").click(() => {
			$("body").click(() => {
				$("body").off("click");
				stopSound('phone_main');
				startSound('phone_end', false);
				self.startBackgroundAudio();
				self.fadeOutOption(item, event);
			});
		});
	}

	self.ask_audience = function(item, event) {
		if(self.transitioning || !$(event.target).hasClass('hoverable'))
			return;
		self.stopAllAudio();
	    startSound('askaud_begin', false);
	    startSound('askaud_loop', true);
	    $("body").click(() => {
			$("body").click(() => {
				$("body").off("click");
				stopSound('askaud_loop');
				startSound('askaud_finish');
				self.startBackgroundAudio();
				self.fadeOutOption(item, event);
			});
		});
 	}

 	// Fades out an option used if possible
 	self.fadeOutOption = function(item, event) {
 		if(self.transitioning)
 			return;
		$(event.target).attr('style', 'background-position: 0 -50px !important');
		$(event.target).removeClass('hoverable');
 	}

 	// Attempts to answer the question with the specified
 	// answer index (0-3) from a click event of elm
 	self.answerQuestion = function(index, elm) {
 		if(self.transitioning) {
			console.log("transitioning")
			return;
		 }
			 
		console.log("answerQuestion");
		 self.transitioning = true;
		$("#" + elm).css('background', 'orange');
		self.stopAllAudio();
		self.startFinalAnswerAudio();
		$("body").click(() => {
			$("body").click(() => {
				$("body").off("click");
				var isCorrect = self.questions[self.level() - 1].correct == index
				self.stopFinalAnswerAudio();
				if(isCorrect) {
					self.rightAnswer(elm);
				} else {
					self.wrongAnswer(elm);
				}
				self.answers()[self.level() - 1] = isCorrect;
			});
		});
 	}

 	// Executes the proceedure of a correct answer guess, moving
 	// the player to the next level (or winning the game if all
	 // levels have been completed)
	 
	self._next_question = (elm) => {
		console.log("_next_question");
		self.money($(".active").data('amt'));
		if(self.level() + 1 > 15) {
			$("#game").fadeOut('slow', function() {
				$("#game-over").html('You Win!');
				$("#game-over").fadeIn('slow');
			});
		} else {
			self.level(self.level() + 1);
			$("#" + elm).css('background', 'none');
			$("#answer-one").show();
			$("#answer-two").show();
			$("#answer-three").show();
			$("#answer-four").show();
			self.stopAllAudio();
			self.startBackgroundAudio();
			self.transitioning = false;
		}
	}

 	self.rightAnswer = function(elm) {
		console.log("rightAnswer", elm);
 		$("#" + elm).slideUp('slow', function() {
			[_, duration] = self.getRighAnswerAudio();
			self.startRighAnswerAudio();
 			$("#" + elm).css('background', 'lime').slideDown('slow').delay(duration ?? 0).queue(function() {
				self._next_question(elm);
				$(this).dequeue();
 			});
 		});
 	}

 	// Executes the proceedure of guessing incorrectly, losing the game.
 	self.wrongAnswer = function(elm) {
		console.log("wrongAnswer", elm);
 		$("#" + elm).slideUp('slow', function() {
			[_, duration] = self.getWrongAnswerAudio();
			self.startWrongAnswerAudio();
 			$("#" + elm).css('background', 'red').slideDown('slow').delay(duration ?? 0).queue(function() {
 				//$("#game").fadeOut('slow', function() {
 				// 	$("#game-over").html('Game Over!');
 				// 	$("#game-over").fadeIn('slow');
 				// 	self.transitioning = false;
				self._next_question(elm);
				//});
				$(this).dequeue();
 			});
 		});
 	}

 	// Gets the money formatted string of the current won amount of money.
 	self.formatMoney = function() {
		console.log("formatMoney");
	    return self.money().money(2, '.', ',');
	}

	self.getBackgroundAudio = (level = null) => {
		switch (level ?? self.level()) {
			case  1:
			case  2:
			case  3:
			case  4:
			case  5: return 'background_1_5';
			case  6: return 'background_6';
			case  7: return 'background_7';
			case  8: return 'background_8';
			case  9: return 'background_9';
			case 10: return 'background_10';
			case 11: return 'background_11';
			case 12: return 'background_12';
			case 13: return 'background_13';
			case 14: return 'background_14';
			case 15: return 'background_15';
			default: return null;
		}
	};

	self.startBackgroundAudio = () => {
		var backgroundAudio = self.getBackgroundAudio();
		if (backgroundAudio) {
			startSound(backgroundAudio, true);
		}
	};

	self.stopBackgroundAudio = () => {
		for (var level = 1; level <= 15; level++) {
			var backgroundAudio = self.getBackgroundAudio(level);
			if (backgroundAudio) {
				stopSound(backgroundAudio);
			}
		}
	};

	self.getRighAnswerAudio = (level = null) => {
		switch (level ?? self.level()) {
			case  1:
			case  2:
			case  3:
			case  4: return ['right_1_4', 3000];
			case  5: return ['right_5', 7000];
			case  6: return ['right_6', 3000];
			case  7: return ['right_7', 3000];
			case  8: return ['right_8', 3000];
			case  9: return ['right_9', 3000];
			case 10: return ['right_10', 9000];
			case 11: return ['right_11', 5000];
			case 12: return ['right_12', 5000];
			case 13: return ['right_13', 5000];
			case 14: return ['right_14', 5000];
			case 15: return ['right_15', 18000];
			default: return null;
		}
	};

	self.startRighAnswerAudio = () => {
		var [righAnswerAudio, _] = self.getRighAnswerAudio();
		if (righAnswerAudio) {
			startSound(righAnswerAudio, false);
		}
	};

	self.stopRighAnswerAudio = () => {
		for (var level = 1; level <= 15; level++) {
			var [righAnswerAudio, _] = self.getRighAnswerAudio(level);
			if (righAnswerAudio) {
				stopSound(righAnswerAudio);
			}
		}
	};

	self.getWrongAnswerAudio = (level = null) => {
		switch (level ?? self.level()) {
			case  1:
			case  2:
			case  3:
			case  4:
			case  5: return ['wrong_1_5', 5000];
			case  6: return ['wrong_6', 5000];
			case  7: return ['wrong_7', 5000];
			case  8: return ['wrong_8', 5000];
			case  9: return ['wrong_9', 5000];
			case 10:
			case 11:
			case 12:
			case 13:
			case 14: return ['wrong_10_14', 5000];
			case 15: return ['wrong_15', 8000];
			default: return null;
		}
	};

	self.startWrongAnswerAudio = () => {
		var [wrongAnswerAudio, _] = self.getWrongAnswerAudio();
		if (wrongAnswerAudio) {
			startSound(wrongAnswerAudio, false);
		}
	};

	self.stopWrongAnswerAudio = () => {
		for (var level = 1; level <= 15; level++) {
			var [wrongAnswerAudio, _] = self.getWrongAnswerAudio(level);
			if (wrongAnswerAudio) {
				stopSound(wrongAnswerAudio);
			}
		}
	};

	self.getFinalAnswerAudio = (level = null) => {
		switch (level ?? self.level()) {
			case  1:
			case  2:
			case  3:
			case  4:
			case  5: return null;
			case  6: return 'finalanswer_6';
			case  7: return 'finalanswer_7';
			case  8: return 'finalanswer_8';
			case  9: return 'finalanswer_9';
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15: return 'finalanswer_10_15';
			default: return null;
		}
	}

	self.startFinalAnswerAudio = () => {
		var finalAnswerAudio = self.getFinalAnswerAudio();
		if (finalAnswerAudio) {
			startSound(finalAnswerAudio, false);
		}
	};

	self.stopFinalAnswerAudio = () => {
		
		for (var level = 1; level <= 15; level++) {
			var finalAnswerAudio = self.getFinalAnswerAudio(level);
			if (finalAnswerAudio) {
				stopSound(finalAnswerAudio);
			}
		}
	};

	self.stopAllAudio = () => {
		self.stopBackgroundAudio();
		self.stopFinalAnswerAudio();
		self.stopRighAnswerAudio();
		self.stopWrongAnswerAudio();
	};
};

// Executes on page load, bootstrapping
// the start game functionality to trigger a game model
// being created
$(document).ready(function() {
	console.log("document.ready");
	$.getJSON("questions.json", function(data) {
		// for(var i = 1; i <= data.games.length; i++) {
		// 	$("#problem-set").append('<option value="' + i + '">' + i + '</option>');
		// }
		$("#pre-pre-start-button").click(() => {
			console.log("$#pre-pre-start-button.click");
			$("#pre-pre-start").hide();
			$("#pre-start").show();
			startSound('lets_play', false);
		});
		$("#start").click(function() {
			console.log("$#start.click");
			var index = 0;
			var m = new MillionaireModel(data.games[index]);
			ko.applyBindings(m);
			stopSound('lets_play');
			m.startBackgroundAudio();
			$("#pre-start").fadeOut('slow', function() {
				$("#game").fadeIn('slow');
			});
		});
	});
});