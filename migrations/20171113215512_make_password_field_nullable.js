exports.up = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t
      .string('password')
      .nullable()
      .defaultTo(null)
      .alter();
  });

exports.down = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t
      .string('password')
      .nullable()
      .alter();
  });
