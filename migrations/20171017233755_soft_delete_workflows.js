exports.up = (knex) =>
  knex.schema.table('workflows', (table) => {
    table.timestamp('deleted_at').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('workflows', (table) => {
    table.dropColumn('deleted_at');
  });
