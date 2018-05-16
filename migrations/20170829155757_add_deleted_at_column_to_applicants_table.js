exports.up = (knex) =>
  knex.schema.table('applicants', (table) => {
    table.timestamp('deleted_at').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('applicants', (table) => {
    table.dropColumn('deleted_at');
  });
