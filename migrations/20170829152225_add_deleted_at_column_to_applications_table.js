exports.up = (knex) =>
  knex.schema.table('applications', (table) => {
    table.timestamp('deleted_at').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('applications', (table) => {
    table.dropColumn('deleted_at');
  });
