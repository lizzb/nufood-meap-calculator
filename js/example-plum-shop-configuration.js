/**
 * Example plum.Shop configuration
 */
$('#cart').plum('shop', {
	cartitem: '<span>{title}</span> '
		+ '<div class="options">'
			+ '<select class="color">'
				+ '<option value="cyan">Cyan</option>'
				+ '<option value="magenta">Magenta</option>'
				+ '<option value="yellow">Yellow</option>'
				+ '<option value="black">Black</option>'
			+ '</select> '
			+ '<select class="size">'
				+ '<option value="6">6</option>'
				+ '<option value="7">7</option>'
				+ '<option value="8">8</option>'
				+ '<option value="9">9</option>'
			+ '</select>'
		+ '</div>'
		+ '<input class="quantity" value="{quantity}">'
		+ '<span>{pricesingle}</span> '
		+ '<span>{pricetotal}</span> '
		+ '<a class="remove" href="#">Remove</a>',
	properties: [ 'description', 'thumb', 'color', 'size' ],
	currencyFormat: '$00,000,000.00', // £
	currencyCode: 'USD',
	generateSKU: true,
	geolocation: true,
	taxRate: { 'US': [ 0.08 ] },
	discountCodes: { '10PERCENT': '10%', '10DOLLARS': 10 },
	sandbox: true,
	shippingRate: {
		'USPS': 0.10,
		'UPS Ground': 0.15,
		'FedEx Express': 0.18
	},
	storage: 'session',
	storageURL: 'shopping-cart.php',
	paypaluser: 'hello',
	paypaldomain: 'robocreatif.com',
	googlemerchant: '177633614003403',
	amazonmerchant: 'A18WCVD7H429AV',
	skrilluser: 'hello',
	skrilldomain: 'robocreatif.com',
	checkout: function () {
		console.dir(this.cart);
		return false;
		alert(
			'This message is controlled by a callback function.\n\n'
			+ 'Checking out your cart of ' + this.quantity + ' items for a '
			+ 'total of ' + this.formatPrice(this.total)
		);
		return true;
	},
	emptyCartBefore: function () {
		return confirm(
			'This message is controlled by a callback function.\n\n'
			+ 'Are you sure you want to empty your cart?'
		);
	}
});