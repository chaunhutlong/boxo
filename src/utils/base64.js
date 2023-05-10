const parseBase64Image = (dataString) => {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

  const response = {};

  if (matches.length !== 3) {
    return { error: 'Invalid input string' };
  }
  response.base64String = matches[0];
  response.type = matches[1];
  response.data = Buffer.from(matches[2], 'base64');

  return response;
};

const parseBase64ImagesList = (dataString) => {
  const matches = dataString.match(/data:([A-Za-z-+\/]+);base64,(.+)$/gm);

  console.log(matches);

  if (!matches || matches.length === 0) {
    return [];
  }

  return matches.map(parseBase64Image);
};

module.exports = {
  parseBase64Image,
  parseBase64ImagesList,
};
