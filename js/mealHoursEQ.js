	var breakfastEQ = 5.00;
	var brunchEQ = 9.00;
	var lunchEQ = 7.00;
	var dinnerEQ = 9.00;
	var latenightEQ = 7.00;
	

	var breakfastStartH = 7;	// 7:30 am
	var breakfastStartM = 30;

	var breakfastEndH = 10;		// 10:45 am
	var breakfastEndM = 45;
	
	var lunchStartH = 10;		// 10:46 am
	var lunchStartM = 46;

	var lunchEndH = 16;			// 4:45 am
	var lunchEndM = 45;

	var dinnerStartH = 16;		// 4:46 pm
	var dinnerStart = 46;
	
	var dinnerEndH = 19; 		// 7:30pm
	var dinnerEndM = 30;



var total = 0.00;
var eq = 0.00;
var mealCount = 0;
/*
var products = [
	{
		name: "Celery + Carrots (Crudites)",
		price: "2.69",
		section: "Deli",
	},
	{
		name: "Edamame",
		price: "2.95",
		section: "Deli",
	},
	{
		name: "Chicken Caesar Salad",
		price: "5.59",
		section: "Deli",
	},
];

var cart = [
	{
		name: "Celery + Carrots (Crudites)",
		price: "2.69",
		quantity: 1,
		item-id: 1,
	},
];
*/
var dayNames = [ "Sunday", "Monday", "Tuesday", "Wednesday", 
                                "Thursday", "Friday", "Saturday"];


//window.addEventListener('load', function(e) {
//  document.querySelector('#test').innerHTML = 'Hello, Jsany!';

//}, false);

//
//
//
function start()
{
	updateEQ();
	updateTotal();

	getCurrentDayTimeString();

}


//
//
//
// Readable for the user
function getCurrentDayTimeString()
{
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();

        var hour =         ((h < 10)? "0" : "") + ( (h > 12)? (h-12) : h);
        var min =         ((m < 10)? "0" : "") + m;
        var sec =         ((s < 10) ? "0" : "") + s;
        var ampm =         ((h > 12) ? "PM" : "AM");
        document.getElementById('currentWeekday').innerHTML=dayNames[today.getDay()];
        
        document.getElementById('currentTime').innerHTML = hour + ":" + min + ":" + sec + ampm;

 	document.getElementById('eq').innerHTML = toUSD(eq);

        // t=setTimeout(function(){startTime()},500);
        //<body onload="startTime();">
}

//
//
//
function updateEQ()
{
	var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();


/*if 	( 	(h > lunchStartH && h < lunchEndH) &&
		(m > lunchStartM && m < lunchEndM) )
{
	eq = lunchEQ;
}*/

//else if
if 	(	(h > dinnerStartH && h < dinnerEndH) && 
		(m > dinnerStartM && m < dinnerEndM) )
{
	eq = dinnerEQ;
}
else eq = latenightEQ;

//check if dinnertime
//check if breakfast
// check if sunday "brunch"
// if none, eq = lunch/latente value

//alert('h: '+h+'m: '+m+'eq: '+eq);
}
/*
Mon - Thur 	11:00 a.m. - 2:00 a.m.
Friday 		11:00 a.m. - 2:00 a.m.
Saturday
Sunday

11 fri - 2 sat
11 sat - 2 sun
12 sunday - 2 mon
*/
function fun(){


}


function incrementItem(){


}

function decrementItem(){

	// if quantity <=0 remove frmo cart
}

function emptyCart(){


}


function filter(){


}

/*
function getCurrentDayTimeString()
{

	// getCurrentWeekdayString()
	document.getElementById('currentWeekday').innerHTML=dayNames[today.getDay()];
	//return hour + ":" + min + ":" + sec + ampm;
	//document.getElementById('txt').innerHTML=h+":"+m+":"+s;
	document.getElementById('currentTime').innerHTML = hour + ":" + min + ":" + sec + ampm;
	// t=setTimeout(function(){startTime()},500);
	//<body onload="startTime();">
}
*/
// http://www.cssnewbie.com/javascript-currency-conversion-script/#.UoQZr5TwIw9
// Converts a float number to a USD currency format
// fx isn't perfect, testing "010" == $8.00??
function toUSD(number) {
    var number = number.toString(), 
    dollars = number.split('.')[0], 
    cents = (number.split('.')[1] || '') +'00';

    // converts our string into an array of individual digits
    dollars = dollars.split('')
    	// reverses our array
    	.reverse()
    	// turns our array back into a single string again
    	.join('')
    	// “add a comma to the end of every group of 3 numbers, 
    	// unless it is the last group of three numbers
    	// (to avoid trailing commas)”:
        .replace(/(\d{3}(?!$))/g, '$1,')
        // converts our newly comma’d string to an array again:
        .split('')
        // puts the numbers back in the proper order
        .reverse()
        // makes them a string again
        .join('');
        // return our manipulated number
        // with a dollar sign out front
        // and a decimal point between dollars and cents
        // (slice to only return the first two digits
        // in the cents string).
    return '$' + dollars + '.' + cents.slice(0, 2);
}
/*
function formatPrice(price)
{
Number.prototype.toCurrencyString = function() { return "$" + Math.floor(this).toLocaleString() + (this % 1).toFixed(2).toLocaleString().replace(/^0/,''); }
}*/


//
//
//
function formatPrice(price)
{
	// Formatting variables.
	var currency = '$00,000.00', //this.options.currencyFormat,
		before = currency.replace(/^([^\d]+)?.+?$/, '$1'),
		after = currency.replace(/^.+?([^\d]+)?$/, '$1'),
		number = currency.substring(before.length, currency.length - after.length),
		decimal = number.replace(/^.+?([^\d]+)\d{2}$/, '$1');

	decimal = decimal === number ? '' : decimal;
	number = decimal ? number.substring(0, number.lastIndexOf(decimal)) : number;
	number = number.split('').reverse();
	
	// Split the price to whole & fraction amounts.
	price = parseFloat(price || 0).toFixed(2).toString().match(/^(.+?)(?:[^\d](\d\d))?$/);
	price[1] = price[1].replace(/[^\d]/g, '');
	price[2] = price[2] || 0;
			
	// Reformat the price array to contain only whole & fraction
	// numbers, and reverse the format.
	price = parseFloat(price[1] + '.' + price[2]).toFixed(2).split('.');
	price[0] = price[0].split('').reverse();
	
	// Build the currency string.
	currency = [];
	$.each(number, function (i, number) {
		currency.push(/^\d+$/.test(number) ? price[0].shift() : number);
	});

	currency = currency.reverse().join('').replace(/^(?:[^\d]+)?(.+)(?:[^\d]+)?$/, '$1');
	
	// Add formatting.
	price = before + currency + (decimal ? decimal + price[1] : '') + after;
	return price;
}

//
//
//
function updateTotal()
{
	var pointOverflow = total % eq;
	document.getElementById('points-over').innerHTML = pointOverflow;
	document.getElementById('eq-meals-over').innerHTML = mealCount;
	document.getElementById('points-under').innerHTML = eq - pointOverflow;
	document.getElementById('eq-meals-under').innerHTML = mealCount + 1;

	document.getElementById('cart-subtotal').innerHTML = toUSD(total);

}

function updateSubtotal()
{
	// sum up every item in the cart

	// for each item in the cart
	// multiply price x quantity

}

// remove item from the cart array
// and also remove the cart item html /redo? the cart
function removeCartItem()
{

}

// add item to the array
// and also generate and append the cart item html
function addCartItem()
{
	
}

//update, genrate, create?
function generateCartHTML()
{
	
}




