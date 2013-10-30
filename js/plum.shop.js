/*!
 * Plum v1.5: A library of tools for jQuery
 *
 * Copyright 2011 RoboCreatif, LLC
 * <http://robocreatif.com>
 *
 * Date: 3 March, 2012
 */

var plum = plum || {};
(function ($) {

	String.prototype.plum = Number.prototype.plum = $.fn.plum = function (callback, options) {
		var action = callback.split('.'), secondary;
		callback = action[0];
		if (action.length > 1) {
			secondary = options;
			options = action[1];
		}
		return typeof plum[callback] === 'function' ? plum[callback].call(this, options, secondary) : this;
	};

	/**
	 * DOMNodeInserted emulation (custom "plum" event)
	 *
	 * Plum plugins love AJAX, and it's always awesome to not have the need to
	 * call a plugin again when a new page has been loaded with AJAX. This can be
	 * accomplished by listening to DOM mutation events. Unfortunately,
	 * DOMNodeInserted is not supported in IE 7 and 8, and has been deprecated by
	 * the W3C. A forceful workaround is to play with jQuery's DOM mutation
	 * methods to trigger a custom event.
	 *
	 * @package  Plum
	 * @since    1.3
	 */
	$.each([ 'before', 'after', 'append', 'html' ], function (k, v) {
		k = $.fn[v];
		$.fn[v] = function (arg) {
			var result = k.apply(this, arguments);
			this.trigger('plum', [ result, arg ]);
			return result;
		};
	});

}(jQuery));




/*!
 * plum.shop v2.6
 * Copyright 2011-2012 Elia Fierro <http://plumjs.com>
 * Date: 30 Oct, 2012
 */

(function ($, undefined) {

	plum.shop = function (options) {
		var self = plum.shop.prototype;
		// Register additional shopping cart containers.
		if (this.selector && (typeof options === 'string' || options.cartitem)) {
			$.each(this.selector.split(/\s*,\s*/), function (i, selector) {
				selector = selector.replace(/^\s+|\s+$/, '');
				self.carts[selector] = (options.cartitem || options).toString();
			});
		}
		// Initialize the shopping cart and its options.
		if (!this.selector || typeof options === 'object') {
			self.init(options);
		}
		// Continue jQuery chaining.
		return this;
	};
	plum.shop.prototype = {
		// The initial cart. This contains an empty expiration time, shipping
		// method, discount code, country and region.
		cart: {
			items: [],
			timeout: null,
			shippingMethod: null,
			discountCode: null,
			country: null,
			region: null,
			each: function (callback) {
				var result, i, length = this.items.length;
				for (i = 0; i < length; i++) {
					result = callback.call(this.items[i], i);
					if (result !== undefined && result !== true) {
						return result;
					}
				}
			}
		},
		// The list of shopping cart selectors and the HTML that will be used to
		// build each item.
		carts: { },
		// A cached property to check if the shipping menu already has an item
		// in it.
		shippingMenuPopulated: false,
		// The cart's discount amount.
		discount: 0,
		// The cart's shipping cost.
		shipping: 0,
		// The cart's subtotal amount.
		subtotal: 0,
		// The cart's total quantity.
		quantity: 0,
		// The cart's tax amount.
		tax: 0,
		// The cart's total cost.
		total: 0,
		// Default option list.
		options: {
			// The list of class or data-attribute listeners for HTML elements.
			classes: {
				// The HTML tag that contains the cart's discount amount.
				cartdiscount: 'cart-discount',
				// HTML tag for the cart's total number of items.
				cartquantity: 'cart-quantity',
				// The cart's shipping cost.
				cartshipping: 'cart-shipping',
				// The cart's subtotal.
				cartsubtotal: 'cart-subtotal',
				// The cart's calculate tax amount.
				carttax: 'cart-tax',
				// The cart's total.
				carttotal: 'cart-total',
				// The field where a customer can type in a discount code.
				discount: 'discount',
				// The button that triggers emptying the shopping cart.
				empty: 'empty',
				// The class name or data attribute to store a product's ID/SKU.
				id: 'id',
				// Class or data attribute that forces the quantity to never go
				// above this amount. This is different from the "stock" in that
				// item properties other than the quantity may still be updated.
				limit: 'limit',
				// Class or data attribute for a product's price.
				price: 'price',
				// The class name to identify a product container.
				product: 'product',
				// The class name to identify the button that adds an item.
				purchase: 'purchase',
				// Class or data attribute for a product's quantity.
				quantity: 'quantity',
				// A property to determine if tax should be applied to the item.
				taxable: 'taxable',
				// Class name or data attribute for a product's title.
				title: 'title',
				// Class name to identify the cart's drop-down menu of shipping
				// options.
				shipping: 'shipping',
				// Class or data attribute to list a product's in stock amount.
				// The value of this field can trigger the itemSoldOut calback
				// method.
				stock: 'stock',
				// The class name inside a single list item in the cart that
				// refers to the button that will remove the item.
				remove: 'remove'
			},
			// Defines how prices should be formatted. For example, you can use
			// '$00,000.00' or '€ 00 000,00' or '€000' or any variation of
			// currency symbols and formats.
			currencyFormat: '$00,000.00',
			// The currency code used when checking out with a third-party
			// payment gateway, like PayPal.
			currencyCode: 'USD',
			// This can be a list of discount codes and the value which is
			// discounted. For example, { '10PERCENT': '10%', '10DOLLARS': 10 }
			// will discount 10% of the subtotal when entering "10PERCENT" into
			// a text field marked with a "discount" class, or $10 when entering
			// "10DOLLARS".
			discountCodes: false,
			// If this is set to a URL on your server, any discount code that is
			// entered into a "discount" text field will be sent to this URL
			// with a post request so you can determine if an amount should be
			// discounted. The response from your server should be a JSON string
			// with a "discount" index containing the amount to be discounted.
			discountURL: '',
			// Set this to true to use plum.Shop's experimental geolocation,
			// which utilizes services of geoplugin.com, a third-party provider.
			geolocation: false,
			// If set to true, Plum will generate an ID for products based on
			// the options that are chosen.
			generateSKU: false,
			// The number of characters to set option names and values to when
			// generating a product SKU.
			generateLimit: 2,
			// An ISO-2 code used to determine the language available on the
			// payment gateway's checkout page.
			language: 'EN',
			// When updating an item that has different properties than is
			// already saved in the cart, setting this option to true will force
			// any new properties to override existing properties.
			overrideProperties: false,
			// A list of additional properties that Plum should look for in a
			// product container. For example, setting this to [ 'title' ] will
			// also look for a data-title attribute, or an element that has a
			// "title" class.
			properties: [ ],
			// Setting this to true will enable sandbox mode at the third-party
			// payment gateways.
			sandbox: false,
			// The product property to be used when calculating "range" shipping
			shippingProperty: null,
			// Can be a single amount or a list of shipping options and their
			// amounts. For example, you can offer various shipping carriers:
			// { 'USPS': 0.1, 'UPS': 0.15, 'FedEx': 0.17 }
			shippingRate: 0,
			// Set this to 'fixed', 'flat', 'range', or 'variable' to set the
			// shipping method.
			shippingType: 'variable',
			// This is a list of callback functions that are applied to each
			// matched shortcode in the item's cart HTML. A shortcode is a
			// string wrapped in curly brackets. For example, {title} will
			// trigger a callback function defined as "title".
			shortCodes: {
				pricesingle: function (product) {
					var c = this.options.classes;
					return this.formatPrice(product[c.price]);
				},
				pricetotal: function (product) {
					var c = this.options.classes;
					return this.formatPrice(product[c.price] * product[c.quantity]);
				}
			},
			// The list of storage methods in order of priority. If localStorage
			// is unavailable, Plum attempts to use cookies. If cookies are
			// unavailable, Plum attempts to user server-side sessions. If no
			// storage method is available, an error will be thrown.
			storage: 'local,cookie,session',
			// The identifying key name for the cart to be stored.
			storageName: 'plum_shop',
			// When using server-side storage, this is the URL where Plum sends
			// GET and POST requests.
			storageURL: '',
			// If set to true, calculated tax amounts are subtracted from the
			// subtotal to display the total amount of tax on each item.
			//taxIncluded: false,
			// A single VAT or sales tax rate, multiple tax rates, or a list of
			// localities and their tax rates. Examples:
			// 0.07
			// [ 0.035, 0.04, 0.02 ]
			// { 'US:NY': [ 0.0375, 0.04 ], 'FR': 0.23 }
			//taxRate: 0,
			// Setting this option to true will also calculate tax on shipping.
			//taxShipping: false,
			// The number of seconds until the shopping cart contents expire.
			timeout: 86400,
			// Triggers after a new item has been added to the cart.
			addItemAfter: function () { },
			// Triggers before a new item has been added.
			addItemBefore: function () { },
			// Triggers after the cart's HTML display has finished building.
			buildCartAfter: function () { },
			// Triggers before the cart's HTML has started building.
			buildCartBefore: function () { },
			// Triggers when the cart's discount is being calculated.
			calcDiscount: function () { },
			// Triggers when the shipping amount is being calculated.
			calcShipping: function () { },
			// Triggers when the subtotal is being calculated.
			calcSubtotal: function () { },
			// Triggers when tax is being calculated.
			calcTax: function () { },
			// Triggers when the total amount is being calculated.
			calcTotal: function () { },
			// Triggers after the shopping cart has been emptied.
			emptyCartAfter: function () { },
			// Triggers before the cart is emptied.
			emptyCartBefore: function () { },
			// Triggers when the quantity of an item reaches the "stock" limit.
			itemSoldOut: function () { },
			// Triggers when the cart has loaded after the page initially loads.
			ready: function () { },
			// Triggers after a single item is removed from the cart.
			removeItemAfter: function () { },
			// Triggers before an item is removed.
			removeItemBefore: function () { },
			// Triggers when a customer changes to a different shipping option.
			shippingChanged: function () { },
			// Triggers after an existing item is modified.
			updateItemAfter: function () { },
			// Triggers before an existing item is modified.
			updateItemBefore: function () { }
		},

		/**
		 * Initializes a shopping cart.
		 *
		 * When this function is first run, various events are delegated to the
		 * necessary HTML elements. This includes adding a non-existant cart to
		 * the DOM, clicking on a purchase button, the "empty cart" button,
		 * changing the shipping method, typing a code into the discount field,
		 * clicking a "remove item" button, changing options for a single item,
		 * and clicking any button that references a checkout method.
		 *
		 * It also sets up the storage method, builds the cart display for the
		 * first time, and triggers the "ready" callback function.
		 *
		 * @since  2.0
		 * @param  object  options  Configuration options
		 */
		init: function (options) {
			var self = this, o = this.options, c = o.classes, d = $(document), i;
			// Set up the cart configuration.
			$.extend(true, o, options);
			// Set up the storage method.
			this.saveCart = this.setStorageMethod(o.storage);
			if (this.saveCart) {
				// Get the shopping cart.
				o.properties = $.merge([ c.id, c.limit, c.price, c.quantity, c.stock, c.title ], o.properties);
				// Check if the shipping menu is already populated.
				this.shippingMenuPopulated = !!$('select.' + c.shipping).children().length;
				this.saveCart(true);
				if (this.cart.timeout === null) {
					this.cart.timeout = this.timeout(true);
				}
				// Experimental geolocation lookup.
				/*if (o.geolocation) {
					this.geolocation();
				}*/
				$('input.' + c.discount).val(this.cart.discountCode);
				// Listen for specific events on marked HTML elements.
				d.bind('plum', 'build', $.proxy(this.listen, this));
				d.delegate('.' + c.purchase, 'click', 'purchase', $.proxy(this.listen, this));
				d.delegate('.' + c.empty, 'click', 'empty', $.proxy(this.listen, this));
				d.delegate(':radio.' + c.shipping + ',select.' + c.shipping, 'change', 'shipping', $.proxy(this.listen, this));
				d.delegate('input.' + c.discount, 'change', 'discount', $.proxy(this.listen, this));
				// Listen for checkout events.
				for (i in this.checkout) {
					if (this.checkout.hasOwnProperty(i)) {
						d.delegate('.' + (this.options.classes[i] || i), 'click', i, $.proxy(this.checkout, this));
					}
				}
				// Build the shopping cart.
				$.each(this.carts, function (cart) {
					d.delegate(cart + ' .' + c.remove, 'click', 'remove', $.proxy(self.listen, self));
					d.delegate(cart + ' :input', 'change', 'cart-options', $.proxy(self.listen, self));
					self.buildCart(cart);
				});
				// Update total amounts.
				this.updateTotals();
				o.ready.call(this);
			}
		},

		/**
		 * Builds the HTML for a single cart container.
		 *
		 * When setting up your shopping cart, you can register multiple carts
		 * to have different displays. Each time a cart is updated, this
		 * function is run for each registered cart. It will build the list of
		 * items, and add them to an HTML unordered list, which is placed inside
		 * of the cart's container.
		 *
		 * @since  2.0
		 * @param  string  cart  The cart selector in the list of carts refering
		 *                       to the cart being built
		 */
		buildCart: function (cart) {
			var self = this,
				o = this.options,
				html = this.carts[cart],
				list;
			cart = $(cart);
			if (cart.length && o.buildCartBefore.call(this, cart) !== false) {
				list = $('<ul>');
				this.cart.each(function () { list.append(self.buildCartItem(this, html)); });
				cart.html(list);
				o.buildCartAfter.call(this, cart);
			}
		},

		/**
		 * Builds an individual item in the cart list.
		 *
		 * This will run through each item in the shopping cart and parse any
		 * shortcodes that are found. Shortcodes can be already in the product
		 * (e.g., {id} will be replaced by the product's ID), or they can have
		 * a relevant callback function in the list of shortcode callbacks
		 * (e.g., {pricetotal} will run the "pricetotal" callback).
		 *
		 * @since   2.0
		 * @param   object  product  The product and its properties
		 * @param   string  li       The HTML to use for each cart item
		 * @return  string  Returns a string containing the item HTML
		 */
		buildCartItem: function (product, html) {
			var self = this, o = this.options, c = o.classes;
			if (html) {
				// Replace each shortcode in the cart item HTML with the product
				// property value, or the return value from an available
				// shortcode function.
				$.each(html.match(/(\{[^\}\s]+\})/g), function (i, prop) {
					var value = prop.substring(1, prop.length - 1);
					value = o.shortCodes[value] !== undefined
						? o.shortCodes[value].call(self, product, value)
						: product[value];
					html = html.replace(new RegExp(prop, 'g'), value === undefined ? '' : value);
				});
				html = $('<li data-id="' + product[c.id] + '">' + html + '</li>');
				$(':input', html).each(function () {
					var elem = $(this), prop = this.className, property;
					// We need to ensure that all input fields in the cart item
					// have properties applicable to those fields. If not, the
					// field can be removed from the item to prevent unavailable
					// options from being purchased.
					if (prop) {
						$.each(prop.split(' '), function (i, prop) {
							if ($.inArray(prop, o.properties) && product[prop] !== undefined) {
								property = product[prop];
								return false;
							}
						});
						if (property === undefined) {
							elem.remove();
						} else {
							elem.val(property);
						}
					} else {
						elem.remove();
					}
				});
			}
			return html;
		},

		/**
		 * Calculate the discount.
		 *
		 * This will first check to see if a list of discount codes exist and
		 * the entered discount code is a part of that list. If not, Plum will
		 * send some data to the location defined in the "discountURL" option.
		 * That data will include the raw numbers for quantity, subtotal, tax,
		 * and shipping. It will also include the shopping cart items, and the
		 * discount code that was entered. The value that is returned from the
		 * server as a JSON string will be used as the discount amount. For
		 * example, returning '{"discount":10}' will take $10 off the subtotal.
		 *
		 * @since   2.0
		 * @return  number  Returns the discount amount
		 
		calcDiscount: function (target) {
			var o = this.options,
				self = this,
				discount,
				callback,
				data;
			if (!target) {
				target = $('.' + o.classes.discount);
				target = target.length ? target[0] : {};
			}
			// If the "discountCodes" option is set, the discount code searched
			// for in the object. If one is found, a number is calculated based
			// on the found value. If the value is a number, it is used as the
			// discount amount. If the value is a number followed by a % sign,
			// the discount is that percentage of the subtotal.
			if (target.value && typeof o.discountCodes === 'object') {
				if (o.discountCodes[target.value] !== undefined) {
					discount = o.discountCodes[target.value];
					discount = this.calcDiscountAmount(discount);
				}
			// A synchronous GET request is sent to the file located at the
			// "discountURL" option containing "plum_shop", the cart's quantity,
			// subtotal, tax, shipping and discount code.
			} else if (target.value && o.discountURL) {
				data = {
					quantity: this.quantity,
					subtotal: this.subtotal,
					tax: this.tax,
					shipping: this.shipping,
					discount: target.value
				};
				data[o.storageName] = true;
				$.ajax({
					url: o.discountURL,
					async: false,
					type: 'GET',
					data: data,
					dataType: 'json',
					// Expected response: JSON string with a "discount" index
					// containing a number value. If any fail, the discount
					// remains at 0.
					success: function (response) {
						if (response.discount !== undefined) {
							discount = self.calcDiscountAmount(response.discount);
						}
					}
				});
			}
			// If a discount code was successfully found, set the cart's
			// discount code to the typed value and discount amount to value
			// returned by the server.
			if (discount !== undefined) {
				this.discount = discount;
				this.cart.discountCode = target.value;
				$('.' + o.classes.discount).val(target.value);
			} else {
				discount = 0;
				this.discount = 0;
				this.cart.discountCode = null;
				target.value = '';
			}
			callback = o.calcDiscount.call(this, discount, target.value);
			return callback === undefined ? discount : callback;
		},
		*/

		/**
		 * Calculates a discount amount based on a given variable.
		 *
		 * This function will determine if a fixed value needs to be discounted,
		 * or if a percentage value will be applied.
		 *
		 * @since   2.0
		 * @param   mixed   discount  A callback function to calculate the
		 *                            discount, a string with '%' appended to
		 *                            it, or a fixed discount
		 * @return  number  Returns the discount amount
		 
		calcDiscountAmount: function (discount) {
			discount = typeof discount === 'function'
				? discount.call(this)
				: (
					/^\d+%$/.test(discount)
					? this.subtotal * parseFloat(discount) / 100
					: discount
				);
			if (!isNaN(discount)) {
				return discount;
			}
		},
		*/

		/**
		 * Calculate the shipping.
		 *
		 * This loops through each option in the shippingRate list and applies
		 * each rate through the this.calcShippingRate method. If given a list,
		 * each shipping rate is compiled into a list of options and inserted
		 * into the designated drop-down menu that contains shipping rates.
		 *
		 * @since   2.0
		 * @return  number  Returns the shipping amount
		 
		calcShipping: function () {
			var self = this,
				o = self.options,
				c = o.classes,
				select,
				options = $(),
				shipping = 0,
				callback;
			if (typeof o.shippingRate === 'object') {
				select = $('select.' + c.shipping);
				if (select.length) {
					$.each(o.shippingRate, function (name, rate) {
						var selected = '';
						rate = self.calcShippingRate(rate);
						if (self.cart.shippingMethod === name) {
							selected = ' selected';
							shipping = rate;
						}
						options = options.add('<option value="' + name + '" data-rate="'
							+ rate + '"'
							+ selected + '>' + name
							+ ' (' + self.formatPrice(rate) + ')</option>'
						);
					});
					if (this.shippingMenuPopulated) {
						options = select.children().eq(0).clone().attr('disabled', true).add(options);
					}
					select.html(options).children().each(function () {
						if (this.selected) {
							shipping = parseFloat($(this).data('rate'));
							select.val(this.value);
							self.cart.shippingMethod = this.value;
							return false;
						}
					});
				} else {
					shipping = $(':radio.' + o.shipping + ':checked').data('rate');
				}
				shipping = isNaN(shipping) ? 0 : shipping;
			} else {
				shipping = this.calcShippingRate(o.shippingRate);
			}
			callback = o.calcShipping.call(this, shipping);
			return callback === undefined ? shipping : callback;
		},
		*/

		/**
		 * Calculate the shipping amount for a single shipping option.
		 *
		 * @since   2.0
		 * @param   number  rate  The rate of the current option
		 * @return  number  Returns the shipping amount
		 
		calcShippingRate: function (rate) {
			var quantity = this.quantity,
				subtotal = this.subtotal,
				o = this.options,
				c = o.classes,
				shipping = 0,
				baseRange = 0,
				property,
				type = o.shippingType.split(',');
			switch (type[0]) {
			case 'fixed':
				// Shipping is based on the quantity of each item.
				shipping = quantity * rate;
				break;
			case 'flat':
				// Shipping is the same regardless of cart contents.
				shipping = rate;
				break;
			case 'range':
				// Shipping changes based on an amount of cart contents.
				property = o.shippingProperty ? o.shippingProperty : c.price;
				type = type[1] || 'flat';
				this.cart.each(function () {
					// If the shipping property is "quantity", only the
					// range is added to the base shipping cost. If it's
					// anything else, the range is multiplied by the
					// quantity.
					var range = parseFloat(this[property]);
					baseRange += property === c.quantity ? range
						: (isNaN(range) ? 0 : range) * this[c.quantity];
				});
				if (typeof rate === 'object' && rate !== null) {
					$.each(rate, function (range, rate) {
						range = parseFloat(range);
						range = isNaN(range) ? 0 : range;
						if (baseRange >= range) {
							switch (type) {
							case 'fixed':
								// Shipping is applied to each item.
								shipping += quantity * rate;
								break;
							case 'flat':
								// Shipping is the same.
								shipping = rate;
								break;
							default:
								// Variable rate based on the cart subtotal.
								shipping = subtotal * rate;
								break;
							}
						}
					});
				}
				break;
			default:
				// Variable rate based on the cart subtotal.
				shipping = subtotal * rate;
				break;
			}
			return shipping;
		},
		*/

		/**
		 * Calculate the subtotal and tally the quantity.
		 *
		 * @since   2.0
		 * @return  number  Returns the subtotal amount
		 */
		calcSubtotal: function () {
			var o = this.options, c = o.classes, subtotal = 0, quantity = 0, callback;
			this.cart.each(function () {
				subtotal += this[c.price] * this[c.quantity];
				quantity += this[c.quantity];
			});
			this.quantity = quantity;
			callback = o.calcSubtotal.call(this, subtotal);
			return callback === undefined ? subtotal : callback;
		},

		/**
		 * Calculate the tax.
		 *
		 * If the "taxIncluded" option is false, this will calculate tax as an
		 * incremented value of the subtotal. If the option is true, it will
		 * calculate how much tax was included in each item.
		 *
		 * @since   2.0
		 * @return  number  Returns the tax amount
		 
		calcTax: function () {
			var self = this,
				callback,
				o = self.options,
				c = o.classes,
				rates = [ ],
				tax = 0,
				taxable = o.taxShipping ? this.shipping : 0
				taxRate = [ ];
			this.cart.each(function () {
				taxable += this[c.taxable] ? this[c.price] * this[c.quantity] : 0;
			});
			if (typeof o.taxRate === 'object') {
				// If no regions are set, the tax rate is a global rate added to
				// all localities.
				if (o.taxRate instanceof Array) {
					$.each(o.taxRate, function (i, rate) {
						rates.push(self.calcTaxAmount(taxable, rate));
					});
					taxRate = o.taxRate;
				// Otherwise, rates can be set in "COUNTRY:REGION" format. For
				// example, {'US:NY': [ 0.04, 0.0375 ]} will apply a 7.75% tax
				// tax to all customers in New York, United States.
				} else {
					$.each(o.taxRate, function (loc, rate) {
						loc = loc.split(':');
						if (self.cart.country === loc[0]) {
							if (!loc[1] || (self.cart.region === loc[1])) {
								$.each(rate, function (i, rate) {
									rates.push(self.calcTaxAmount(taxable, rate));
								});
								taxRate = rate;
							}
						}
					});
				}
			}
			$.each(rates, function (i, rate) { tax += rate; });
			tax = parseFloat(tax.toFixed(2), rates);
			// Optional calcTax function can further refine the tax rate.
			callback = o.calcTax.call(this, tax, taxRate);
			return callback === undefined ? tax : callback;
		},
		*/

		/**
		 * Calculates the amount of tax to be added, or the amount of tax that
		 * was included.
		 *
		 * @since   2.0
		 * @param   number  taxable  The total price
		 * @param   number  rate     The tax rate
		 * @return  number  Returns the tax amount
		 
		calcTaxAmount: function (taxable, rate) {
			return this.options.taxIncluded
				? taxable - taxable / ((rate + 1) * 100) * 100
				: taxable * rate;
		},
		*/

		/**
		 * Calculate the total.
		 *
		 * @since   2.0
		 * @return  number  Returns the total amount
		 */
		calcTotal: function () {
			var o = this.options, total = 0, callback;
			total = this.subtotal + this.shipping - this.discount + (o.taxIncluded ? 0 : this.tax);
			callback = o.calcTotal.call(this, total);
			total = callback === undefined ? total : callback;
			return total < 0 ? 0 : total;
		},

		/**
		 * Runs a checkout method to process a transaction.
		 *
		 * @since  1.0
		 */
		checkout: function (event, vars) {
			if (typeof event === 'string') {
				var fields = [];
				$.each(vars, function (i, field) {
					fields.push('<input type="hidden" name="' + field[0] + '" value="' + field[1].toString() + '">');
				});
				$('<form>', {
					action: event,
					method: 'post',
					css: { display: 'none' },
					html: fields.join('')
				}).appendTo('body').trigger('submit');
			} else {
				event.preventDefault();
				if (this.quantity) {
					this.checkout[event.data].call(this);
				}
			}
		},

		/**
		 * Empties the shopping cart.
		 *
		 * @since  1.0
		 * @param  bool  force  When set to true, the cart will be emptied
		 *                      without running user-defined callback functions
		 */
		emptyCart: function (force) {
			var o = this.options;
			if (force) {
				this.cart.items = [];
				this.cart.timeout = this.timeout(true);
				this.cart.discountCode = null;
				this.cart.shippingMethod = null;
				this[o.geolocation ? 'geolocation' : 'saveCart'](o.geolocation);
				$.each(this.carts, function (cart) { $(cart).empty(); });
			} else if (this.cart.items && this.cart.items.length && o.emptyCartBefore.call(this) !== false) {
				this.emptyCart(true);
				o.emptyCartAfter(true);
			}
		},

		/**
		 * Encodes an object (namely, the shopping cart) into a JSON string.
		 *
		 * @since   1.0
		 * @param   object  object  The object to encode
		 * @return  string  The JSON-encoded string
		 */
		encodeJSON: function (object) {
			var json = [], i;
			switch (typeof object) {
			case 'function':
				return this.escapeJSONString(object.toString());
			case 'number':
				if (isNaN(object)) {
					throw new Error();
				}
				return object;
			case 'boolean':
			case 'null':
				return object;
			case 'string':
				return this.escapeJSONString(object);
			case 'object':
				if (!object) {
					return null;
				}
				if (object instanceof Array) {
					for (i in object) {
						if (object.hasOwnProperty(i)) {
							json.push(this.encodeJSON(object[i]));
						}
					}
					json = '[' + json.join(',') + ']';
				} else {
					for (i in object) {
						if (object.hasOwnProperty(i)) {
							json.push('"' + i + '":' + this.encodeJSON(object[i]));
						}
					}
					json = '{' + json.join(',') + '}';
				}
				return json;
			default:
				throw new Error();
			}
		},

		/**
		 * Safely escapes a string for JSON.
		 *
		 * @since   2.0
		 * @param   string  string  The string to escape
		 * @return  string  The escaped string, enclosed in double-quotes
		 */
		escapeJSONString: function (string) {
			var search  = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
				replace = {
					'\b': '\\b',
					'\t': '\\t',
					'\n': '\\n',
					'\f': '\\f',
					'\r': '\\r',
					'"': '\\"',
					'\\': '\\\\'
				};
			search.lastIndex = 0;
			return '"' + (search.test(string)
				? string.replace(search, function (match) {
					return typeof replace[match] === 'string'
						? replace[match]
						: '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4);
				})
				: string) + '"';
		},

		/**
		 * Forces a given number to an integer, with a default value if the
		 * number can not be converted.
		 *
		 * @since   2.4
		 * @param   mixed  number        The value to convert to an integer
		 * @param   int    defaultValue  The default value if conversion fails
		 * @return  int    Returns the converted value or default.
		 */
		forceInt: function (number, defaultValue) {
			number = number ? parseInt(number, 10) : defaultValue;
			return isNaN(number) ? defaultValue : number;
		},

		/**
		 * Converts a number to currency format.
		 *
		 * This allows for internationalization of currencies. By using the
		 * currency configuration options of plum.Shop, one can customize the
		 * display beyond the default "$10,000.00" format. For example, this
		 * can instead be displayed as "€1 000,00" by changing "currencyformat"
		 * to "€0 000,00". The format should be defined as the maximum amount
		 * that a product can be in the store.
		 *
		 * @since   1.5
		 * @param   number  price  The number to format as a currency string
		 * @return  string  A string formatted with the cart's currency options
		 */
		formatPrice: function (price) {
			// Formatting variables.
			var currency = this.options.currencyFormat,
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
		},

		/**
		 * Get the visitor's country and region codes for use in tax tables.
		 *
		 * NOTE: This is an experimental feature using services by
		 * geoplugin.com.
		 *
		 * @since  2.0
		 * @param  bool  force  Forces a lookup even if country and region are
		 *                      already set
		 
		geolocation: function (force) {
			var self = this;
			if (force || !this.cart.country || !this.cart.region) {
				$.getJSON('http://www.geoplugin.net/json.gp?jsoncallback=?', function (geo) {
					self.cart.country = geo.geoplugin_countryCode;
					self.cart.region = geo.geoplugin_regionCode || null;
					self.saveCart();
				});
			}
			self.saveCart();
		},
		*/

		/**
		 * Updates an existing item, or adds a new item to the shopping cart.
		 *
		 * @since  2.0
		 * @param  object  product  An object containing the product properties
		 */
		insertItem: function (product) {
			var self = this,
				o = self.options,
				c = o.classes,
				i,
				soldOut;
			// The product MUST have an ID attached to it.
			if (!product[c.id]) {
				return false;
			}
			// Determine if the product is taxable or not.
			product[c.taxable] = product[c.taxable] === 'false' ? false : true;
			// Check if the item already exists in the cart.
			i = this.itemExists(product);
			soldOut = product[c.stock];
			// If it does not already exist, run the addItemBefore callback
			// function. If the function does not return false, push the item to
			// the cart, run the addItemAfter callback and save the cart.
			if (i === false) {
				soldOut = soldOut && product[c.quantity] > soldOut;
				if (soldOut) {
					o.itemSoldOut.call(this, product);
				} else if (o.addItemBefore.call(this, product) !== false) {
					this.cart.items.push(product);
					this.saveCart();
					o.addItemAfter.call(this, product);
				}
			// If the item exists and the updated quantity is 0, run the
			// removeItemBefore and removeItemAfter callback functions.
			} else if (product[c.quantity] + this.cart.items[i][c.quantity] < 1) {
				product = this.cart.items[i];
				if (o.removeItemBefore.call(this, product) !== false) {
					this.cart.items.splice(i, 1);
					this.saveCart();
					o.removeItemAfter.call(this, product);
				}
			// For items that exist and the quantity is being changed to a
			// value other than 0, the updateItemBefore and updateItemAfter
			// callback functions are run.
			} else {
				product[c.quantity] += this.cart.items[i][c.quantity];
				if (product[c.limit] && product[c.quantity] > product[c.limit]) {
					product[c.quantity] = parseInt(product[c.limit]);
				}
				soldOut = soldOut && product[c.quantity] > soldOut;
				if (soldOut) {
					o.itemSoldOut.call(this, product);
				} else if (o.updateItemBefore.call(this, product) !== false) {
					if (o.overrideProperties) {
						$.extend(this.cart.items[i], product);
					} else {
						this.cart.items[i][c.quantity] = product[c.quantity];
					}
					this.saveCart();
					o.updateItemAfter.call(this, product);
				}
			}
			// Rebuild the cart(s).
			$.each(this.carts, function (cart) { self.buildCart(cart); });
		},

		/**
		 * Checks if an item exists in the cart.
		 *
		 * @since   2.0
		 * @param   mixed  id  The ID/SKU of the item or the entire item object
		 * @return  mixed  Returns false on failure, or the index of the item in
		 *                 the shopping cart
		 */
		itemExists: function (id) {
			var c  = this.options.classes;
			id = (typeof id === 'object' ? id[c.id] : id).toString();
			id = this.cart.each(function (i) { return this[c.id] === id ? i : true; });
			return id === undefined ? false : id;
		},

		/**
		 * The global listener for events on particular HTML tags.
		 *
		 * This takes care of events like building the shopping cart, changing
		 * cart options, changing the discount method, emptying the cart, adding
		 * a new item to the cart, removing an item, and changing the shipping.
		 *
		 * @since  2.0
		 * @param  object  event  The event object
		 * @param  object  elem   The element on which the event was triggered
		 * @param  mixed   html   Any HTML passed with the event
		 */
		listen: function (event, elem, html) {
			event.preventDefault();
			var self = this,
				o = self.options,
				c = o.classes,
				target = event.currentTarget,
				product = {},
				priceMod = 0,
				property,
				value,
				trimProp,
				i,
				id,
				container,
				SKU;
			switch (event.data) {
			case 'build':
				$(html).each(function () {
					elem = $(this);
					$.each(self.carts, function (cart) {
						if (elem.is(cart)) {
							self.buildCart(cart);
						}
					});
				});
				break;
			case 'cart-options':
				target = $(target);
				value = target[0].value;
				i = this.itemExists(target.closest('li[data-id]').data('id'));
				product = $.extend({}, this.cart.items[i]);
				// Check if the item has a class that is part of the list
				// of defined properties.
				$.each(target[0].className.split(/\s+/), function (i, prop) {
					if ($.inArray(prop, o.properties)) {
						property = prop;
					}
				});
				// If the property is a quantity, the product's quantity
				// should be subtracted from the value to change the amount.
				if (property === c.quantity) {
					value = parseInt(value, 10);
					value = isNaN(value) ? -product[c.quantity] : value;
					product[c.quantity] = value - product[c.quantity];
				// If the generateSKU option is enabled, changing an option
				// will also change the SKU for the product. Therefore, the
				// product should be removed from the cart and a new product
				// should be added, or existing product updated.
				} else if (property && o.generateSKU) {
					this.cart.items.splice(i, 1);
					trimProp = property.replace(/(?:\:|\|)/, '')
						.substring(0, o.generateLimit)
						.toUpperCase();
					product[c.id] = product[c.id].replace(
						new RegExp(
							trimProp + product[property]
								.replace(/(?:\:|\|)/, '')
								.substring(0, o.generateLimit)
								.toUpperCase() + '(\u007c|$)'
						),
						trimProp + value.replace(/(?:\:|\|)/, '')
							.substring(0, o.generateLimit)
							.toUpperCase() + '$1'
					);
					product[property] = value;
				} else if (property) {
					product[c.quantity] = 0;
					product[c.id] = this.cart.items[i][c.id];
					this.cart.items[i][property] = value;
				}
				// Update the item
				this.insertItem(product);
				break;
			case 'discount':
				target.blur();
				this.saveCart(target);
				break;
			case 'empty':
				this.emptyCart();
				break;
			case 'purchase':
				container = $(target).closest('.' + c.product)[0];
				SKU = this.options.generateSKU ? [] : false;
				// Make sure a product container exists.
				if (!container) {
					return false;
				}
				// If the product container has an ID, that is used as the
				// ID for the item in the shopping cart.
				if (container.id) {
					product[c.id] = container.id;
				}
				// Get properties from the container's data attributes.
				$.each(container.attributes, function (prop, elem) {
					prop = elem.nodeName;
					if (prop.substring(0, 5) === 'data-') {
						prop = prop.substring(5);
						if ($.inArray(prop, o.properties) > -1 && !product[prop]) {
							product[prop] = elem.nodeValue;
						}
					}
				});
				// Get properties from the container's child elements that
				// have relevant class names. An <img> tag uses the source,
				// any form element (e.g., <input>) uses the value, and all
				// other elements use the HTML text.
				$('[class]', container).each(function () {
					var dom = this, node = this.nodeName.toLowerCase();
					elem = $(dom);
					$.each(this.className.split(/\s+/), function (i, prop) {
						if ($.inArray(prop, o.properties) > -1 && !product[prop]) {
							product[prop] = elem.is(':radio') || elem.is(':checkbox') ? (dom.checked ? dom.value : '')
								: elem.is(':input') ? dom.value
									: elem.is('img') ? dom.src
										: elem.text();
							if (node === 'select' || ((dom.type === 'radio' || dom.type === 'checkbox') && dom.checked)) {
								if (node === 'select') {
									elem = elem.find('option[value="' + product[prop] + '"]');
									priceMod += elem.data(c.price) ? parseFloat(elem.data(c.price)) : 0;
								} else if (elem.data(c.price)) {
									priceMod += parseFloat(elem.data(c.price));
								}
								if (SKU) {
									SKU.push(
										prop.replace(/(\:|\|)/g, '').substring(0, o.generateLimit)
											+ product[prop].replace(/(\:|\|)/g, '').substring(0, o.generateLimit)
									);
								}
							}
						}
					});
				});
				// A stock-keeping unit can be generated based on chosen
				// options for the product. Options used are those based on
				// designated select menus, radio buttons and checkboxes.
				if (SKU) {
					SKU = SKU.join('|').toUpperCase();
					product[c.id] = !SKU ? product[c.id]
						: product[c.id] ? product[c.id] + ':' + SKU
							: SKU;
				}
				// Convert the product's price to a float number. This
				// removes any invalid characters, like "$" or ",".
				if (product[c.price]) {
					product[c.price] = parseFloat(String(product[c.price])
						.replace(/[^\d\.]/g, '').match(/\d*(?:\.\d\d)?/));
					product[c.price] += priceMod;
				}
				// Force the product's quantity, limit and stock properties to
				// integers.
				product[c.quantity] = this.forceInt(product[c.quantity], 1);
				product[c.limit] = this.forceInt(product[c.limit], 0);
				product[c.stock] = this.forceInt(product[c.stock], 0);
				// Update or add a new item to the cart.
				this.insertItem(product);
				break;
			case 'remove':
				id = $(target).closest('li[data-id]').data('id');
				i = this.itemExists(id);
				if (i !== false) {
					product[c.id] = id;
					product[c.quantity] = -this.cart.items[i][c.quantity];
					this.insertItem(product);
				}
				break;
			case 'shipping':
				this.cart.shippingMethod = target.value;
				this.shipping = $(target).is('select')
					? $('option[value="' + target.value + '"]', target).data('rate')
					: $(target).data('rate');
				o.shippingChanged.call(this);
				this.saveCart();
				break;
			}
		},

		/**
		 * Sets the shopping cart storage method.
		 *
		 * @since   2.0
		 * @param   string  methods  A comma-separated string of storage methods
		 * @return  string  Returns the name of the storage method
		 */
		setStorageMethod: function (methods) {
			var method, storageURL = this.options.storageURL;
			$.each(methods.split(','), function (i, type) {
				type = type.replace(/^\s*(.+)\s*$/, '$1');
				switch (type) {
				case 'cookie':
					// Test for cookies.
					if (!method && navigator.cookieEnabled) {
						method = 'storageCookie';
					}
					break;
				case 'local':
					// Test for localStorage.
					if (!method && !!window.localStorage) {
						var isAvailable = true;
						try {
							window.localStorage.setItem('plum_shop_test', 'plum');
							window.localStorage.removeItem('plum_shop_test');
							method = 'storageLocal';
						} catch (e) {
							isAvailable = false;
							method = null;
						}
					}
					break;
				case 'session':
					// Test for server-side session storage.
					if (!method && storageURL) {
						method = 'storageSession';
					}
					break;
				}
			});
			if (method && typeof this[method] === 'function') {
				return this[method];
			}
		},

		/**
		 * Attempts to set or get the cart from a browser cookie.
		 *
		 * @since  1.0
		 * @param  bool  get  If this value is set, the cart is retrieved
		 */
		storageCookie: function (get) {
			var name = this.options.storageName, i, cart, cookie;
			// Retrieves the shopping cart from a cookie if it exists.
			if (get === true) {
				cookie = document.cookie.split(';');
				for (i in cookie) {
					if (cookie[i] !== undefined) {
						cart = cookie[i];
						while (cart.charAt(0) === ' ') {
							cart = cart.substring(1);
						}
						if (cart.indexOf(name + '=') === 0) {
							cart = decodeURIComponent(cart.substring((name + '=').length));
							this.setupCart(cart);
						}
					}
				}
			// Attempts to save the shopping cart to a cookie. Due to browser
			// limitations, the total length of the encoded cookie string can
			// not be longer than 4058 bytes (to allow for expiration overhead).
			} else {
				cart = encodeURIComponent(this.setCart(true));
				cart = name + '=' + cart + '; path=/';
				if (cart.length <= 4058) {
					document.cookie = cart;
					this.updateTotals(get);
				}
			}
		},

		/**
		 * Attempts to set or get the cart from the browser's local storage.
		 *
		 * @since  1.1
		 * @param  bool  get  If this value is set, the cart is retrieved
		 */
		storageLocal: function (get) {
			var name = this.options.storageName, cart;
			// Retrieves the cart from localStorage if the key exists
			if (get === true) {
				cart = window.localStorage.getItem(name);
				if (cart) {
					this.setupCart(cart);
				}
			// Saves the cart in the localStorage database
			} else {
				window.localStorage.setItem(name, this.setCart(true));
				this.updateTotals(get);
			}
		},

		/**
		 * Attempts to set or get the cart from a server session.
		 *
		 * @since  1.0
		 * @param  bool  get  If this value is set, the cart is retrieved
		 */
		storageSession: function (get) {
			var o = this.options, name = o.storageName, url = o.storageURL, cart = {};
			// Attempts to get the cart from a server session. This sends a GET
			// request to the defined storageURL option and querying the
			// storageName with a value of true. For example:
			// GET: http://example.com/shoppingcart.php?plum_shop=true
			if (get === true) {
				cart[name] = true;
				$.ajax({
					url: url,
					async: false,
					type: 'GET',
					data: cart,
					dataType: 'json',
					success: $.proxy(function (cart) {
						cart.items = cart.items || [];
						this.setupCart(cart);
					}, this)
				});
			// Attempts to save the cart to a server session by querying the
			// server with a POST request and a single variable containing the
			// storageName with a value of the shopping cart.
			} else {
				cart[name] = this.setCart();
				$.post(url, cart);
				this.updateTotals(get);
			}
		},

		/**
		 * Returns the shopping cart as a string or property object.
		 *
		 * @since   2.0
		 * @param   bool    stringify  If set, the cart is returned as a string
		 * @return  mixed   Returns the cart as a string or an object
		 */
		setCart: function (stringify) {
			var cart = {};
			$.each(this.cart, function (key, value) {
				if (typeof value !== 'function') { cart[key] = value; }
			});
			return stringify ? this.encodeJSON(cart) : cart;
		},

		/**
		 * Parses a JSON-encoded cart and checks to see if the cart has expired.
		 *
		 * @since  2.0
		 * @param  string  cart  The cart as a string
		 */
		setupCart: function (cart) {
			var self = this;
			cart = typeof cart === 'object' ? cart
				: /^\{".+\}$/.test(cart) ? $.parseJSON(cart)
				: {
					items: [],
					country: null,
					region: null,
					timeout: this.timeout(true),
					discountCode: null,
					shippingMethod: null
				};
			$.each(cart, function (key, value) { self.cart[key] = value; });
			this.cart.items = cart.items || [];
			this.cart.timeout = parseInt(cart.timeout, 10);
			this.cart.each(function () {
				this.price = Number(this.price);
				this.quantity = Number(this.quantity);
				this.stock = Number(this.stock);
			});
			this.timeout();
		},

		/**
		 * Gets or checks a "time to live" integer for the cart
		 *
		 * @since   1.5
		 * @param   bool  get  If true, a new timeout will be returned
		 * @return  int   The time in milliseconds when the cart should expire
		 */
		timeout: function (get) {
			var timeout = this.options.timeout, d;
			if (get) {
				d = new Date();
				d.setDate(d.getUTCDate() + timeout / 86400);
				return Date.parse(d.toUTCString());
			}
			if (
				!this.cart.timeout
				|| (this.timeout(true) > parseInt(this.cart.timeout, 10) + timeout * 1000)
			) {
				this.emptyCart(true);
			}
		},

		/**
		 * Updates relevant total amounts and builds the shipping menu.
		 *
		 * @since   1.2
		 */
		updateTotals: function (discountTarget) {
			var shop = this, c = shop.options.classes;
			// Calculate the cart amounts.
			shop.subtotal = parseFloat(shop.calcSubtotal().toFixed(2));
			//shop.shipping = parseFloat(shop.calcShipping().toFixed(2));
			//shop.tax = parseFloat(shop.calcTax().toFixed(2));
			//shop.discount = parseFloat(shop.calcDiscount(discountTarget).toFixed(2));
			shop.total = parseFloat(shop.calcTotal().toFixed(2));
			// Update the text amounts for each cart total-related field.
			$('.' + c.cartquantity).each(function () { this.innerHTML = shop.quantity.toString(); });
			$('.' + c.cartsubtotal).each(function () { this.innerHTML = shop.formatPrice(shop.subtotal); });
			//$('.' + c.cartshipping).each(function () { this.innerHTML = shop.formatPrice(shop.shipping); });
			//$('.' + c.carttax).each(function () { this.innerHTML = shop.formatPrice(shop.tax); });
			//$('.' + c.cartdiscount).each(function () { this.innerHTML = '-' + shop.formatPrice(shop.discount); });
			$('.' + c.carttotal).each(function () { this.innerHTML = shop.formatPrice(shop.total) });
		}

	};

	/**
	 * The custom checkout method.
	 *
	 * Either the defined "checkout" function in the option list, or an empty
	 * function is run with the "this" value referring to the entire Plum
	 * object. If the value of this call returns true, the cart will be emptied.
	 *
	 * @since  1.0
	 
	plum.shop.prototype.checkout.checkout = function () {
		if ((this.options.checkout || function () { }).call(this) === true) {
			this.emptyCart(true);
		}
	};
	*/

	/*! Amazon FPS extension for plum.shop | @since 1.3 
	plum.shop.prototype.checkout.amazon = function () {
		var o = this.options,
			c = o.classes,
			rates,
			rate = 0,
			vars = [],
			regexp = new RegExp(
				'^(?:' + c.id + '|' + c.limit + '|' + c.price + '|'
					+ c.quantity + '|' + c.taxable + '|' + c.title + '|'
					+ c.stock
					+ ')$'
			),
			merchant = o.amazonmerchant;
		// The Amazon merchant ID must be set.
		if (!/[A-Z0-9]{12,14}/.test(merchant)) {
			return false;
		}
		// Add the items to the shopping cart.
		this.cart.each(function (i) {
			var v, x = 1, d = [];
			i++;
			vars.push([ 'item_merchant_id_' + i, merchant ]);
			vars.push([ 'item_sku_' + i, this[c.id].substring(0, 40) ]);
			vars.push([ 'item_title_' + i, this[c.title] ]);
			vars.push([ 'item_price_' + i, this[c.price] ]);
			vars.push([ 'item_quantity_' + i, this[c.quantity] ]);
			// vars.push([ 'item_image_url_' + i, this.thumb ]);
			for (v in this) {
				if (this[v] !== undefined && !regexp.test(v)) {
					vars.push([ 'item_' + i + '.custom_attribute_' + x + '.' + v, this[v] ]);
					d.push(v + ': ' + this[v]);
				}
			}
			if (d.length) {
				vars.push([ 'item_description_' + i, d ]);
			}
		});
		// Discounts, tax and shipping
		if (this.discount) {
			vars.push([ 'cart_promotion_1', this.discount ]);
			vars.push([ 'cart_promotion_type_1', 'fixed_amount_off' ]);
		}
		if (!o.taxIncluded && this.tax) {
			rates = o.taxRate instanceof Array || typeof o.taxRate === 'number'
				? o.taxRate
				: o.taxRate[this.cart.country + (this.cart.region ? ':' + this.cart.region : '')];
			if (rates) {
				if (rates instanceof Array) {
					$.each(rates, function (a, b) { rate += b; });
				} else {
					rates = rate;
				}
				vars.push([ 'is_shipping_taxed', o.taxShipping ? true : false ]);
				vars.push([ 'tax_rate', rate ]);
			}
		}
		if (this.shipping) {
			vars.push([ 'shipping_method_service_level_1', 'standard' ]);
			vars.push([ 'shipping_method_price_per_shipment_amount_1', this.shipping ]);
		}
		// Additional variables.
		vars.push([ 'currency_code', o.currencyCode ]);
		// Send the cart to Amazon for payment.
		this.checkout('https://payments' + (o.sandbox ? '-sandbox' : '') + '.amazon.com/checkout/' + merchant, vars);
	};
	*/
	/*! Google Checkout extension for plum.shop | @since 1.0 
	plum.shop.prototype.checkout.google = function (id) {
		var i = this.cart.items.length + 1,
			o = this.options,
			c = o.classes,
			rate = 0,
			rates,
			vars = [],
			regexp = new RegExp(
				'^(?:' + c.id + '|' + c.limit + '|' + c.price + '|'
					+ c.quantity + '|' + c.taxable + '|' + c.title + '|'
					+ c.stock
					+ ')$'
			),
			flow = 'checkout-flow-support.merchant-checkout-flow-support.',
			flowTax = flow + 'tax-tables.default-tax-table.tax-rules.default-tax-rule-1.',
			flowTaxEx = flow + 'tax-table.alternate-tax-tables.alternate-tax-table-1.',
			flowShipping = flow + 'shipping-methods.flat-rate-shipping-1.',
			merchant = o.googlemerchant;
		// The Google Checkout merchant ID must be set.
		if (!/^[\d]{10,15}$/.test(merchant)) {
			return false;
		}
		// Add the items to the shopping cart.
		this.cart.each(function (i) {
			var x = [], v;
			i++;
			vars.push([ 'item_merchant_id_' + i, this[c.id] ]);
			vars.push([ 'item_name_' + i, this[c.title] || '' ]);
			vars.push([ 'item_quantity_' + i, this[c.quantity] ]);
			vars.push([ 'item_price_' + i, this[c.price] ]);
			vars.push([ 'item_currency_' + i, o.currencyCode ]);
			vars.push([ 'shopping-cart.items.item-' + i + '.tax-table-selector', ])
			for (v in this) {
				if (this[v] !== undefined && !regexp.test(v)) {
					x.push(v + ': ' + this[v]);
				}
			}
			vars.push([ 'item_description_' + i, x.length ? x.join(', ') : '' ]);
		});
		// Discounts, tax and shipping
		if (this.discount) {
			vars.push([ 'item_merchant_id_' + i, this.cart.discountCode || 0 ]);
			vars.push([ 'item_name_' + i, this.cart.discountCode || this.format(-this.discount) ]);
			vars.push([ 'item_description_' + i, this.cart.discountCode ]);
			vars.push([ 'item_quantity_' + i, 1 ]);
			vars.push([ 'item_price_' + i, -this.discount ]);
			vars.push([ 'item_currency_' + i, o.currencyCode ]);
		}
		// Tax will only be applied if the user has an assigned country or region.
		if (!o.taxIncluded && this.tax && typeof o.taxRate === 'object') {
			rates = o.taxRate[this.cart.country + (this.cart.region ? ':' + this.cart.region : '')];
			if (rates) {
				if (rates instanceof Array) {
					$.each(rates, function (a, b) { rate += b; });
				} else {
					rate = rates;
				}
				vars.push([ flowTax + 'shipping-taxed', o.taxShipping ? true : false ]);
				vars.push([ flowTax + 'rate', rate ]);
				// Tax exempt table
				vars.push([ flowTaxEx + 'name', 'tax_exempt' ]);
				vars.push([ flowTaxEx + 'standalone', 'true' ]);
				flowTaxEx += 'alternate-tax-rules.alternate-tax-rule-1.';
				vars.push([ flowTaxEx + 'rate', '0.00' ]);
				if (this.cart.region) {
					vars.push([ flowTax + 'tax-areas.us-state-area-1.state', this.cart.region ]);
					vars.push([ flowTaxEx + 'tax-areas.us-state-area-1.state', this.cart.region ]);
				} else {
					vars.push([ flowTax + 'tax-area.postal-area.country-code', this.cart.country ]);
					vars.push([ flowTaxEx + 'tax-area.postal-area.country-code', this.cart.country ]);
				}
			}
		}
		if (this.shipping) {
			vars.push([ flowShipping + 'name', this.cart.shippingMethod ]);
			vars.push([ flowShipping + 'price', this.shipping ]);
			vars.push([ flowShipping + 'price.currency', o.currencyCode ]);
		}
		// Add an invoice ID if once exists.
		if (id) {
			vars.push([ 'shopping-cart.merchant-private-data', 'invoice: ' + id ]);
		}
		// Send the cart to Google for payment.
		this.checkout((o.sandbox
			? 'https://sandbox.google.com/checkout/api/checkout/v2/checkoutForm/Merchant/'
			: 'https://checkout.google.com/api/checkout/v2/checkoutForm/Merchant/'
		) + merchant, vars);
	};
	*/
	/*! PayPal extension for plum.shop | @since 1.0 
	plum.shop.prototype.checkout.paypal = function (id) {
		var i = 0,
			o = this.options,
			c = o.classes,
			vars = [],
			regexp = new RegExp(
				'^(?:' + c.id + '|' + c.limit + '|' + c.price + '|'
					+ c.quantity + '|' + c.taxable + '|' + c.title + '|'
					+ c.stock + ')$'
			),
			merchant = { user: o.paypaluser, domain: o.paypaldomain };
		if (!merchant.user || !merchant.domain) {
			return false;
		}
		// Add the items to the cart.
		this.cart.each(function () {
			var v, x = 0;
			i++;
			vars.push([ 'item_number_' + i, this[c.id] ]);
			vars.push([ 'item_name_' + i, this[c.title] || this[c.id] ]);
			vars.push([ 'quantity_' + i, this[c.quantity] ]);
			vars.push([ 'amount_' + i, this[c.price] ]);
			for (v in this) {
				if (this[v] !== undefined && !regexp.test(v) && x < 7) {
					vars.push([ 'on' + x + '_' + i, v ]);
					vars.push([ 'os' + x++ + '_' + i, this[v] ]);
				}
			}
		});
		// Discounts, tax and shipping
		if (this.discount) {
			vars.push([ 'discount_amount_cart', this.discount ]);
		}
		if (!o.taxIncluded && this.tax) {
			vars.push([ 'tax_cart', this.tax ]);
		}
		if (this.shipping) {
			vars.push([ 'custom', 'shippingMethod: ' + this.cart.shippingMethod ]);
			vars.push([ 'handling_cart', this.shipping ]);
		}
		// Additional variables.
		vars.push([ 'cmd', '_cart' ]);
		vars.push([ 'lc', o.language ]);
		vars.push([ 'upload', '1' ]);
		vars.push([ 'charset', 'utf-8' ]);
		vars.push([ 'currency_code', o.currencyCode ]);
		vars.push([ 'business', o.paypaluser + '@' + o.paypaldomain ]);
		if (o.headerurl) {
			vars.push([ 'cpp_header_image', o.headerurl ]);
		}
		if (o.cancelurl) {
			vars.push([ 'cancel_return', o.cancelurl ]);
		}
		if (o.returnurl) {
			vars.push([ 'return', o.returnurl ]);
		}
		if (o.notifyurl) {
			vars.push([ 'notify_url', o.notifyurl ]);
		}
		// Add an invoice ID if one exists.
		if (id) {
			vars.push([ 'invoice', id ]);
		}
		// Send the cart to PayPal for payment.
		this.checkout('https://www.' + (o.sandbox ? 'sandbox.' : '') + 'paypal.com/cgi-bin/webscr', vars);
	};
	*/
	/*! Skrill extension for plum.shop | @since 1.1 
	plum.shop.prototype.checkout.skrill = function (id) {
		var i = 0,
			o = this.options,
			c = o.classes,
			vars = [],
			regexp = new RegExp('^(?:' + c.limit + '|' + c.price + '|'
				+ c.taxable + '|' + c.title + '|' + c.stock + ')$'),
			merchant = { user: o.skrilluser, domain: o.skrilldomain };
		if (!merchant.user || !merchant.domain) {
			return false;
		}
		// Add the items to the shopping cart.
		this.cart.each(function () {
			var v, x = [];
			i++;
			vars.push([ 'detail' + i + '_description', this[c.title] ]);
			for (v in this) {
				if (this[v] !== undefined && !regexp.test(v)) {
					x.push(v + ': ' + this[v]);
				}
			}
			vars.push([ 'detail' + i + '_text', x.join(', ') ]);
		});
		// Discounts, tax & shipping (Skrill is silly, so they need to be hacked in)
		i = 2;
		if (this.discount) {
			vars.push([ 'amount' + i + '_description', this.cart.discountCode || '' ]);
			vars.push([ 'amount' + i++, (-this.discount).toFixed(2) ]);
		}
		if (!o.taxIncluded && this.tax) {
			vars.push([ 'amount' + i + '_description', 'Tax' ]);
			vars.push([ 'amount' + i++, this.tax.toFixed(2) ]);
		}
		if (this.shipping) {
			vars.push([ 'amount' + i + '_description', this.cart.shippingMethod ]);
			vars.push([ 'amount' + i++, this.shipping.toFixed(2) ]);
		}
		vars.push([ 'amount', this.total.toFixed(2) ]);
		// Additional variables.
		vars.push([ 'language', o.language ]);
		vars.push([ 'currency', o.currencyCode ]);
		vars.push([ 'pay_to_email', merchant.user + '@' + merchant.domain ]);
		if (o.headerurl) {
			vars.push([ 'logo_url', o.headerurl ]);
		}
		if (o.cancelurl) {
			vars.push([ 'cancel_url', o.cancelurl ]);
		}
		if (o.returnurl) {
			vars.push([ 'return_url', o.returnurl ]);
		}
		if (o.notifyurl) {
			vars.push([ 'status_url', o.notifyurl ]);
		}
		// Add an invoice ID if one exists.
		if (id) {
			vars.push([ 'transaction_id', id ]);
		}
		// Send the cart to Moneybookers for payment.
		this.checkout('https://www.moneybookers.com/app/payment.pl', vars);
	};
	*/
}(jQuery));


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
	//geolocation: true,
	//taxRate: { 'US': [ 0.08 ] },
	discountCodes: { '10PERCENT': '10%', '10DOLLARS': 10 },
	sandbox: true,
	shippingRate: {
		'USPS': 0.10,
		'UPS Ground': 0.15,
		'FedEx Express': 0.18
	},
	storage: 'session',
	storageURL: 'shopping-cart.php',
	//paypaluser: 'hello',
	//paypaldomain: 'robocreatif.com',
	//googlemerchant: '177633614003403',
	//amazonmerchant: 'A18WCVD7H429AV',
	//skrilluser: 'hello',
	//skrilldomain: 'robocreatif.com',
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