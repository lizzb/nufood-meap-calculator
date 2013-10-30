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