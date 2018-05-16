exports.up = (knex) =>
  knex.schema.table('applications', (table) => {
    table
      .boolean('test')
      .notNullable()
      .defaultTo(false);
  });

exports.down = (knex) =>
  knex.schema.table('applications', (table) => {
    table.dropColumn('test');
  });
