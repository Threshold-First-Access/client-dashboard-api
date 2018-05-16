exports.up = (knex) =>
  knex.schema.table('workflows', (table) => {
    table
      .boolean('test_mode_enabled')
      .notNullable()
      .defaultTo(false);
  });

exports.down = (knex) =>
  knex.schema.table('workflows', (table) => {
    table.dropColumn('test_mode_enabled');
  });
