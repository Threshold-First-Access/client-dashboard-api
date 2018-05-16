exports.up = (knex) =>
  knex.schema.createTableIfNotExists('tokens', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table
      .bigInteger('user_id')
      .unsigned()
      .references('id')
      .inTable('users');
    table.string('description').notNullable();
    table
      .string('token', 40)
      .unique()
      .notNullable();
    table.timestamps();
    table.timestamp('deleted_at').nullable();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('tokens');
