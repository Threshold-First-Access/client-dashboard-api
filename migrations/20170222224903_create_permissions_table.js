exports.up = (knex) =>
  knex.schema.createTableIfNotExists('permissions', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table.string('name').notNullable();
    table.string('permission').notNullable();
    table.string('scope').nullable();
    table
      .bigInteger('role_id')
      .unsigned()
      .references('id')
      .inTable('roles');
    table.timestamps();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('permissions');
