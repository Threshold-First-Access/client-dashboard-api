/**
 * Create security grous table
 *
 * @param knex Knex instance
 */
exports.up = (knex) =>
  knex.schema.createTableIfNotExists('roles', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table
      .string('name')
      .unique()
      .notNullable();
    table.string('description').notNullable();
    table.timestamps();
  });

/**
 * Drop security table
 *
 * @param knex Knex instance
 */
exports.down = (knex) => knex.schema.dropTableIfExists('roles');
