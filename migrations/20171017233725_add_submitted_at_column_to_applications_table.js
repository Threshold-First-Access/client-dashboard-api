exports.up = (knex) =>
  knex.schema.table('applications', (table) => {
    table.timestamp('submitted_at').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('applications', (table) => {
    table.dropColumn('submitted_at');
  });
