function validateDateFormat(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString.replace(" ", "T"));
  if (isNaN(date.getTime())) {
    return false;
  }

  return date.getTime();
}

// Example usage
// const dateString = "2024-10-07T13:00:00";
// console.log(validateDateFormat(dateString))

module.exports = validateDateFormat;
