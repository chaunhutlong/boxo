const deleteRelatedDocuments = function (schema, options) {
  const relatedSchemas = options.relatedSchemas;

  schema.pre('remove', async function (next) {
    try {
      const promises = [];
      for (const relatedSchema of relatedSchemas) {
        const relatedModel = this.model(relatedSchema.modelName);
        const relatedField = relatedSchema.fieldName || schema.modelName.toLowerCase() + 's';
        const filter = { [relatedField]: this._id };
        promises.push(relatedModel.deleteMany(filter));
      }
      await Promise.all(promises);
      next();
    } catch (error) {
      next(error);
    }
  });
};

module.exports = deleteRelatedDocuments;
