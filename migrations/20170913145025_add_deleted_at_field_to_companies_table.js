exports.up = (knex) =>
  knex.schema.table('companies', (table) => {
    table.timestamp('deleted_at').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('companies', (table) => {
    table.dropColumn('deleted_at');
  });
