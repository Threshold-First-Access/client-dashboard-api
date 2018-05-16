exports.up = (knex) =>
  knex.schema.alterTable('applicants', (t) =>
    t
      .string('name')
      .nullable()
      .alter(),
  );

exports.down = (knex) =>
  knex.schema.alterTable('applicants', (t) =>
    t
      .string('name')
      .defaultTo('')
      .alter(),
  );
