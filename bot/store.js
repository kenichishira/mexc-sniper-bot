// change the storemangaement class as per requirements
class StoreManagement {
	data = new Map();

	// Add data to the store
	add(key, item) {
		//regular add item
		this.data.set(key.toString(), item);
	}

	// Get data by key
	get(key) {
		return this.data.get(key.toString());
	}

	update(key, value) {
		if (this.data.has(key.toString())) {
			this.data.set(key.toString(), value);
		} else {
			console.log(`Item with key ${key} not found.`);
		}
	}

	// Remove data by key
	remove(key) {
		if (this.data.has(key.toString())) {
			this.data.delete(key.toString());
			console.log(`Item with key ${key} removed.`);
		} else {
			console.log(`Item with key ${key} not found.`);
		}
	}

	// Display all items in the store
	display() {
		console.log('Items in the store: ', this.data);

		this.data.forEach((item, key) => {
			console.log(`Key: ${key}, Value: ${JSON.stringify(item)}`);
		});
	}
}

const store = new StoreManagement();

module.exports = store;
