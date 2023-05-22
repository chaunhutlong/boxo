/**
 * Parse base64 image
 * @param {string} dataString
 * @returns {{data: Buffer, type: *}[]|{error: string}}
 */
const parseBase64Image = (dataString) => {
  const [, type, data] = dataString.match(/^data:([A-Za-z-+/]+);base64,([^,]+)$/);

  if (!type || !data) {
    return { error: 'Invalid input string' };
  }

  return {
    type,
    data: Buffer.from(data, 'base64'),
  };
};

/**
 * Parse base64 images array
 * @param {string} dataString
 * @returns {{data: Buffer, type: *}[]|{error: string}}
 */
const parseBase64ImagesArray = (dataString) => {
  const regex = /data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,([^"]+)/g;

  const matches = Array.from(dataString.matchAll(regex), (match) => ({
    input: match[0],
    type: match[1],
    data: Buffer.from(match[2], 'base64'),
  }));

  if (!matches.length) {
    return { error: 'Invalid input string' };
  }

  return matches;
};

module.exports = {
  parseBase64Image,
  parseBase64ImagesArray,
};
