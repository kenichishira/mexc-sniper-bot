const isValidNumber = (value, type = 'number') => {
	try {
		if (type === 'number') {
			return !isNaN(parseFloat(value)) && isFinite(value);
		}
	} catch (error) {
		return false;
	}
};

module.exports = { isValidNumber };
