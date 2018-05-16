/**
 * Migration for creating groups table
 */
exports.up = (knex) =>
  knex.schema.createTableIfNotExists('groups', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table.string('name').notNullable();
    table.timestamps();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('groups');
