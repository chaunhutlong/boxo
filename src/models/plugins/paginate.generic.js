const createSortingCriteria = (sortBy) => {
  const sortingCriteria = [];
  sortBy.split(',').forEach((sortOption) => {
    const [key, order] = sortOption.split(':');
    sortingCriteria.push((order === 'desc' ? '-' : '') + key);
  });
  return sortingCriteria.join(' ');
};

const getLimit = (limit) => {
  return limit && parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
};

const getPage = (page) => {
  return page && parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
};

const getSkip = (page, limit) => {
  return (page - 1) * limit;
};

const getCount = async (model, filter) => {
  const count = await model.countDocuments(filter).exec();
  return count;
};

const getDocs = async (model, filter, sort, skip, limit, populate) => {
  let docsPromise = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (populate) {
    populate.split(',').forEach((populateOption) => {
      docsPromise = docsPromise.populate(
        populateOption
          .split('.')
          .reverse()
          .reduce((a, b) => ({ path: b, populate: a }))
      );
    });
  }

  const docs = await docsPromise.exec();
  return docs;
};

module.exports = {
  createSortingCriteria,
  getLimit,
  getPage,
  getSkip,
  getCount,
  getDocs,
};
