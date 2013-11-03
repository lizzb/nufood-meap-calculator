var items = {
	"Soup of the day": "0.00",

	"Chicken Caesar Salad": "5.59",
	"Tomato + Mozzerella Baguette": "4.99",

	"Celery + Carrots (Crudites)": "2.69",
	"Edamame": "2.95",

	"Sushi - Veggie": "0.00",
	"Sushi - Shrimp": "0.00",
	"Sushi - California w/ Masago": "0.00",
	"Sushi - California": "0.00",
	
	"Nerd Rope": "1.19",
	"Odwalla Juice Smoothie": "3.49",
	"Sweettart Gummies": "2.75",

	"Tostido's Lime Tortilla Chips": "4.29",
	"Spicy Cheeto Fries": "1.49",

	"Lean Cuisine": "4.99",
	"Amy's Pesto Tortellini Bowl": "5.49",
	"Taipei Stir Fry Chinese Takeout Boxes": "4.99",
	"Bagel Bites Mini Pizzas": "0.00",
	"Naanwich": "0.00",

	"Simply Asia Soup/Noodles": "4.99",

	"Cup O Ramen": "0.00",
	"Top Ramen Package": "0.49",

	"PB&J on Wheat": "2.99",
	"Brownie": "1.99",
	"Danish": "2.25",
	"Cookie": "1.75",
	"Machine Coffee Drink 16 oz": "3.00",

	"Dorito's": "0.00",
	"Soda - 12 pack cans": "0.00",
	"Soda - Individual bottle": "0.00",
	
	"Chocolate Candy Bar": "0.00",
	"Clif Bar": "0.00",
	
	"Candy Bar": "1.19",
	"M&Ms": "1.19",
	"Laffy Taffy": "0.25",
	"Mini Reese's Cups": "0.25",
	"Gum": "0.00",
	
	"Wheat Thins": "0.00",
	"Box of cereal": "0.00",
	"Mini bowl of cereal": "0.00",
	
};

function makeProductList() {

	var productlisthtml = "";
	var i = 0;

	$.each( items, function( item, price ) {
	  	productlisthtml +=
	  	"<li class='product purchase btn btn-info item' id='"+i+"'>" +
	  	"<span class='title'>" + item + "</span>" +
	  	"<span class='price'> $" + price + "</span> </li>";
	  i++;
	});

	document.getElementById("products").innerHTML = "<ul>" + productlisthtml + "</ul>";
}

function sortAZ() {
	var productList = $('#products ul');
	var listItems = productList.children('li').get();
	listItems.sort(function(a, b) {
		var compA = $(a).text().toUpperCase();
		var compB = $(b).text().toUpperCase();
   return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
})
$.each(listItems, function(idx, itm) { productList.append(itm); });
}

function sortByPrice() {
  var productList = $('#products ul');
  var listItems = productList.children('li').get();
  listItems.sort(function(a,b){
    var compA = $(a).find('.price').text();
    var compB = $(b).find('.price').text();
    return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
  });
  $(productList).append(listItems);
}

