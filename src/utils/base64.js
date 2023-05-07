const parseBase64Image = (dataString) => {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const response = {};

  if (matches.length !== 3) {
    return { error: 'Invalid input string' };
  }

  response.type = matches[1];
  response.data = Buffer.from(matches[2], 'base64');

  return response;
};

module.exports = {
  parseBase64Image,
};
