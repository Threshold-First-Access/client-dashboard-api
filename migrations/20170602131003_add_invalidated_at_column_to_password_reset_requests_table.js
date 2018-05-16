exports.up = (knex) =>
  knex.schema.table('password_reset_requests', (table) => {
    table.timestamp('invalidated_at').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('password_reset_requests', (table) => {
    table.dropColumn('invalidated_at');
  });
