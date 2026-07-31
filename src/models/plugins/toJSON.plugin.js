/* eslint-disable no-param-reassign */

/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, and any path that has private: true
 *  - replaces _id with id
 */

const deleteAtPath = (obj, path, index) => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  // Safety check to ensure the nested object exists before trying to delete from it
  if (obj[path[index]]) {
    deleteAtPath(obj[path[index]], path, index + 1);
  }
};

const toJSON = (schema) => {
  let transform;
  if (schema.options.toJSON && schema.options.toJSON.transform) {
    transform = schema.options.toJSON.transform;
  }

  schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
    transform(doc, ret, options) {
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options && schema.paths[path].options.private) {
          deleteAtPath(ret, path.split('.'), 0);
        }
      });

      // FIXED: Ensure _id exists before calling toString()
      if (ret._id) {
        ret.id = ret._id.toString();
      }
      
      delete ret._id;
      delete ret.__v;
      
      // I kept this as a fallback, but you should still use `private: true` in your schema
      delete ret.password; 
      
      if (transform) {
        return transform(doc, ret, options);
      }
    },
  });
};

module.exports = toJSON;