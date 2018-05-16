exports.up = (knex) =>
  knex.schema
    .table('users', (table) => {
      table.boolean('active').defaultTo(false);
    })
    .table('products', (table) => {
      table.boolean('active').defaultTo(false);
    });

exports.down = (knex) =>
  knex.schema
    .table('users', (table) => {
      table.dropColumn('active');
    })
    .table('products', (table) => {
      table.dropColumn('active');
    });
