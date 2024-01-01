class APIFeatures {
  constructor(model, query) {
    this.model = model;
    this.query = query;

    this.options = {where: {userId: query.user.id}};
  }

  // filter() {
  //   const queryObj = {...this.query};
  //   delete queryObj.sort;

  //   // Advanced filtering
  //   const where = {};

  //   this.options.where = where;

  //   return this;
  // }

  // limitFields() {
  //   let attributes = {};

  //   if (this.query.fields) {
  //     this.query.fields.split(',').forEach(field => {
  //       if (field.startsWith('-')) {
  //         attributes.exclude.push(field);
  //       } else {
  //         attributes = [attributes, field];
  //       }
  //     });
  //   }

  //   return this;
  // }

  sort() {
    if (this.query.sort) {
      const sortBy = this.query.sort.split(',').map(field => {
        if (field.startsWith('-')) {
          return [field.slice(1), 'DESC'];
        }
        return [field, 'ASC'];
      });
      this.options.order = sortBy;
    } else {
      this.options.order = [['createdAt', 'DESC']];
    }

    return this;
  }

  async getAll() {
    const results = await this.model.findAll(this.options);
    return results;
  }
}

module.exports = APIFeatures;
