/*jslint browser: true, white: true*/
/*global Main, Order, Payment, Keypad, User, ItemManager, API, $, Selection, Screen, ParseFloat*/

var Order = {

	items: {},

	/**
	 * Initialize the Order screen
	 *
	 * -Add click event for the pay button
	 * -Add click event for the clear button
	 */

	init: function(){

		"use strict";

		$('show_payment').addEvent('click', function(){

			Payment.show(this.items);
		}.bind(this));

		$('clear_order').addEvent('click', this.clear);
	},

	/**
	 * Select an item in the order screen
	 *
	 * @param event
	 */

	selectItem: function(event){

		"use strict";

		var target = Selection.findElement(event.target, 'OrderItem');

		// Set selected status for this item

		Selection.select(target);

		// Add keypad event to update the count for this item

		Keypad.addEvent(function(value){

			Order.setCount(target.get('data-id'), value);
			Selection.deselect(target);
		});
	},

	/**
	 * Add item to the order.
	 *
	 * @param id
	 * @param name
	 * @param price
	 */

	addItem: function(id, name, price){

		"use strict";

		Selection.deselectAll();
		var order_item = null;

		// If item already exists in the current order

		if(this.items[id]){

			// Increase count

			this.items[id].count += 1;

			this.setCount(id, this.items[id].count);

			order_item = $('order_item_' + id);
		}

		// If this item does not exist in the current order

		else{

			// Add item to current items

			this.items[id] = {
				name: name,
				price: parseFloat(price, 10),
				count: 1
			};

			order_item = $('order_item_dummy').clone();

			order_item.set({
				'id': 'order_item_' + id,
				'data-id': id,
				'events': {
					'click': this.selectItem
				}
			});

			order_item.getElements('.Name').set('text', name);
			order_item.getElements('.SinglePrice').set('text', this.items[id].price.toFixed(2));

			order_item.getElements('.Remove').addEvent('click', function(){

				Order.removeItem(id);
			});

			order_item.inject('order_item_dummy', 'before').show();

			// Set the count

			this.setCount(id, 1);
		}

		// Select this item in the order

		Selection.select(order_item);

		this.calculateTotal();

		// Add keypad event to update the count for this item

		Keypad.addEvent(function(value){

			Order.setCount(id, value);
			Selection.deselect(order_item);
		});
	},

	/**
	 * Update the counter to value for item with id
	 *
	 * @param id
	 * @param value
	 */

	setCount: function(id, value){

		"use strict";

		// Remove item if value is zero

		if(value === 0 || value === '0'){

			delete this.items[id];
			$('order_item_' + id).destroy();
			return;
		}

		// Set the count

		this.items[id].count = value;
		$('order_item_' + id).getElements('.Count').set('text', value);
		$('order_item_' + id).getElements('.TotalPrice').set(
			'text',
			(value * this.items[id].price).toFixed(2)
		);
		this.calculateTotal();
	},

	/**
	 * Calculate the total
	 */

	calculateTotal: function(){

		"use strict";

		var total = 0;

		Object.keys(this.items).each(function(key){

			if(this.items[key]){

				total += (this.items[key].count * this.items[key].price);
			}
		}.bind(this));

		$('order_total').getElements('.Price').set('text', total.toFixed(2));
	},

	/**
	 * Remove an item from the order
	 *
	 * @param id
	 */

	removeItem: function(id){

		"use strict";

		if(this.items[id]){

			this.items[id].count -= 1;

			this.setCount(id, this.items[id].count);
		}

		this.calculateTotal();
	},

	/**
	 * Clear current order
	 */

	clear: function(){

		"use strict";

		Object.keys(Order.items).each(function(key){

			delete Order.items[key];
			$('order_item_' + key).destroy();
		});

		Order.calculateTotal();
	}
};