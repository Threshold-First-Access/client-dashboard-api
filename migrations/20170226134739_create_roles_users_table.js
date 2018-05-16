exports.up = (knex) =>
  knex.schema.createTableIfNotExists('roles_users', (table) => {
    table
      .bigInteger('role_id')
      .unsigned()
      .references('id')
      .inTable('roles')
      .onDelete('cascade');
    table
      .bigInteger('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('cascade');
    table.timestamps();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('roles_users');
