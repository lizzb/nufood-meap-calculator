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
	{
		name: "Tomato + Mozzerella Baguette",
		price: "4.99",
		section: "Deli",
	},
	{
		name: "Sushi - California",
		price: "",
		section: "Deli",
	},
	{
		name: "Sushi - California w/ Masago",
		price: "",
		section: "Deli",
	},
	{
		name: "Sushi - Shrimp",
		price: "",
		section: "Deli",
	},
	{
		name: "Sushi - Veggie",
		price: "",
		section: "Deli",
	},
	{
		name: "PB&J on Wheat",
		price: "2.99",
		section: "Deli",
	},
	// ---------- Candy, Chips, & Soda ---------- //
	{
		name: "Nerd Rope",
		price: "1.19",
		section: "Candy, Chips, & Soda",
	},
	{
		name: "Tostido's Lime Tortilla Chips",
		price: "4.29",
		section: "Candy, Chips, & Soda",
	},
	{
		name: "Spicy Cheeto Fries",
		price: "1.49",
		section: "Candy, Chips, & Soda",
	},
	{
		name: "Sweettart Gummies",
		price: "2.75",
		section: "Candy, Chips, & Soda",
	},
	{
		name: "Chocolate Candy Bar",
		price: "",
		section: "Candy, Chips, & Soda",
	},
	{
		name: "Dorito's",
		price: "",
		section: "Candy, Chips, & Soda",
	},
	{
		name: "Candy Bar",
		price: "1.19",
		section: "Candy, Chips, & Soda",
	},
	{
		name: "M&Ms",
		price: "1.19",
		section: "Candy, Chips, & Soda",
	},
	{
		name: "M&Ms",
		price: "1.19",
		section: "Candy, Chips, & Soda",
	},
	{
		name: "Soda - 12 pack cans",
		price: "",
		section: "Candy, Chips, & Soda",
	},

	// ---------- Baked Goods ---------- //
	{
		name: "Cookie",
		price: "",
		section: "Baked Goods",
	},
	{
		name: "Danish",
		price: "2.25",
		section: "Baked Goods",
	},
	{
		name: "Brownie",
		price: "1.99",
		section: "Baked Goods",
	},


	// --------- Packaged Noodles/Soup ---------- //
	{
		name: "Simply Asia Soup/Noodles",
		price: "4.99",
		section: "Packaged Noodles/Soup",
	},
	{
		name: "Cup O Ramen",
		price: "",
		section: "Packaged Noodles/Soup",
	},
	{
		name: "Top Ramen Package",
		price: "0.49",
		section: "Packaged Noodles/Soup",
	},

	// --------- Freezer ---------- //
	{
		name: "Lean Cuisine",
		price: "4.99",
		section: "Frozen Meals",
	},
	{
		name: "Amy's Pesto Tortellini Bowl",
		price: "5.49",
		section: "Frozen Meals",
	},
	{
		name: "Taipei Stir Fry Chinese Takeout Boxes",
		price: "4.99",
		section: "Frozen Meals",
	},
	{
		name: "Bagel Bites Mini Pizzas",
		price: "",
		section: "Frozen Meals",
	},
	{
		name: "Naanwich",
		price: "",
		section: "Frozen Meals",
	},


	// ---------- Cold Drinks ---------- //
	{
		name: "Odwalla Juice Smoothie",
		price: "3.49",
		section: "Cold Drinks",
	},
	{
		name: "Soda - Individual bottle",
		price: "",
		section: "Cold Drinks",
	},
	{
		name: "Wheat Thins",
		price: "",
		section: "",
	},
	{
		name: "Box of cereal",
		price: "",
		section: "",
	},
	{
		name: "Mini bowl of cereal",
		price: "",
		section: "",
	},
	{
		name: "Clif Bar",
		price: "",
		section: "",
	},

	// ---------- Register ---------- //
	{
		name: "Laffy Taffy",
		price: "0.25",
		section: "Register",
	},
	{
		name: "Mini Reese's Cups",
		price: "0.25",
		section: "Register",
	},
	{
		name: "Gum",
		price: "",
		section: "Register",
	},
	{
		name: "Machine Coffee Drink 16 oz",
		price: "3.00",
		section: "Register",
	},

	{
		name: "Soup of the day",
		price: "0.00",
		section: "Register",
	},
	
];

	// section: "Frozen Meals",
	// section: "Baked Goods",
	// section: "Candy, Chips, & Soda",
	// section: "Register",
	// section: "Deli",
	// section: "Packaged Noodles/Soup",
	// section: "Cold Drinks",
	// section: "Frozen Treats",


function makeProductList() {

	var productlisthtml = "";

	$.each( products, function( index ) {
	  	productlisthtml +=
	  	"<li class='product purchase btn btn-info item' id='"+ index+ "'>" +
	  	"<span class='title'>" + products[index].name + "</span>" +
	  	"<span class='price'> $" + products[index].price  + "</span> </li>";
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

