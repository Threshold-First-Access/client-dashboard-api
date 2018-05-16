exports.up = (knex) => {
  return knex.schema.createTableIfNotExists(
    'password_reset_requests',
    (table) => {
      table
        .bigincrements('id')
        .primary()
        .unsigned();
      table
        .bigInteger('user_id')
        .unsigned()
        .references('id')
        .inTable('users');
      table
        .string('reset_code')
        .notNullable()
        .unique();
      table.timestamp('used_at').nullable();
      table.timestamps();
    },
  );
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('password_reset_requests');
};
