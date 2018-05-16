exports.up = (knex) =>
  knex.schema.table('users', (t) => {
    t.dateTime('expiry_at').defaultTo(null);
  });

exports.down = (knex) =>
  knex.schema.table('users', (t) => {
    t.dropColumn('expiry_at');
  });
