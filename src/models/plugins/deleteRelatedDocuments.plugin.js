require('regenerator-runtime/runtime');

const deleteRelatedDocuments = function (schema, options) {
  const { relatedSchemas } = options;

  schema.pre('remove', async function (next) {
    try {
      if (relatedSchemas && Array.isArray(relatedSchemas)) {
        const promises = relatedSchemas.map(async (relatedSchema) => {
          const relatedModel = this.model(relatedSchema.modelName);
          const relatedField = relatedSchema.fieldName || `${schema.modelName.toLowerCase()}s`;
          const filter = { [relatedField]: this._id };
          return relatedModel.deleteMany(filter);
        });

        await Promise.all(promises);
      }
      next();
    } catch (error) {
      next(error);
    }
  });
};

module.exports = deleteRelatedDocuments;
