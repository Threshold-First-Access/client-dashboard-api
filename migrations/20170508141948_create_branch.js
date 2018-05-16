/**
 * Branches migration.
 *
 * @param knex instance of knex
 */
exports.up = (knex) =>
  knex.schema.createTableIfNotExists('branches', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table
      .bigInteger('company_id')
      .unsigned()
      .references('id')
      .inTable('companies');
    table.string('name').notNullable();
    table.boolean('active').defaultTo(true);
    table.timestamps();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('branches');
