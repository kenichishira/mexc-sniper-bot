module.exports = function sliceButton(arr, size) {
	const chunkedButton = [];

	for (let i = 0; i < arr.length; i += size) {
		chunkedButton.push(arr.slice(i, i + size));
	}
	return chunkedButton;
};
