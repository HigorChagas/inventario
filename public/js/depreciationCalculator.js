const calculateDepreciation = (formattedDate, assetValueFormated) => {
  const monthlyFee = (0.20 / 360);
  const finalDate = new Date();
  const currentDate = new Date(formattedDate);
  const differenceInMilliseconds = finalDate - currentDate;
  const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
  let depreciatedValue;
  if (differenceInDays >= 1800) {
    depreciatedValue = assetValueFormated;
  } else {
    depreciatedValue = (assetValueFormated * monthlyFee * differenceInDays).toFixed(2);
  }
  return depreciatedValue;
};

module.exports = calculateDepreciation;
