exports.up = (knex) =>
  knex.schema.table('products', (table) => {
    table.timestamp('deleted_at').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('products', (table) => {
    table.dropColumn('deleted_at');
  });
