exports.up = (knex) =>
  knex.schema.table('companies', (table) => {
    table
      .boolean('test_mode_enabled')
      .notNullable()
      .defaultTo(false);
  });

exports.down = (knex) =>
  knex.schema.table('companies', (table) => {
    table.dropColumn('test_mode_enabled');
  });
