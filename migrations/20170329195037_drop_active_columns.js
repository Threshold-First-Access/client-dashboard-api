exports.up = (knex) =>
  knex.schema
    .table('users', (table) => {
      table.dropColumn('active');
    })
    .table('products', (table) => {
      table.dropColumn('active');
    });

exports.down = (knex) =>
  knex.schema
    .table('users', (table) => {
      table
        .enu('active', [1, 0])
        .notNullable()
        .defaultTo(0);
    })
    .table('products', (table) => {
      table
        .enu('active', [1, 0])
        .notNullable()
        .defaultTo(0);
    });
