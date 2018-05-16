exports.up = (knex) =>
  knex.schema.table('applications', (table) => {
    table.timestamp('approval_at').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('applications', (table) => {
    table.dropColumn('approval_at');
  });
