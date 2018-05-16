exports.up = (knex) => {
  return knex.schema.createTableIfNotExists('workflows', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table
      .string('uuid')
      .notNullable()
      .unique();
    table.string('name').notNullable();
    table.string('slug').notNullable();
    table
      .bigInteger('product_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('products');
    table.timestamps();
    table.unique(['product_id', 'slug']);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('workflows');
};
