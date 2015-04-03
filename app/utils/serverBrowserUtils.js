'use strict';
(function(exports){
   exports.calcWinnings = function(amount, juice){
	juice = juice.toString();
	juice = juice.trim();
	var slashPosition = juice.indexOf('/');
	var winnings = 0;
	var conversion = 0;

	if (juice === 'EVEN') {
		winnings = amount;
	}
	else if (slashPosition > 0) {
		var numerator = juice.split('/')[0];
		var denominator = juice.split('/')[1];
		var theOdds = parseFloat(numerator / denominator);
		winnings = amount * theOdds;
	}
	else if (juice[0] === '+') {
		juice = parseInt(juice);
		conversion = juice / 100;
		winnings = conversion * amount;
	}
	else {
		juice = parseInt(juice.substring(1));
		conversion = 1 / (juice / 100);
		winnings = conversion * amount;
	}

	var pay =  amount + winnings;
	pay = parseFloat(pay).toFixed(2);
	winnings = parseFloat(winnings).toFixed(2);

	return {'pay' : pay, 'winnings' : winnings};
    };
})(typeof exports === 'undefined'? this.serverBrowserUtils={}: exports);
