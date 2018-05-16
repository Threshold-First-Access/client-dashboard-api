exports.up = (knex) =>
  knex.schema.table('users', (t) => {
    t.renameColumn('uuid', 'activation_code');
  });

exports.down = (knex) =>
  knex.schema.table('users', (t) => {
    t.renameColumn('activation_code', 'uuid');
  });
