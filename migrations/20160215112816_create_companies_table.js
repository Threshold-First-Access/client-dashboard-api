/**
 * Knex migration for creating companies
 *
 * @param knex Instance of knex
 * @param Promise
 * @return {*}
 */
exports.up = (knex) =>
  knex.schema.createTableIfNotExists('companies', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table.string('name').notNullable();
    table
      .string('slug')
      .notNullable()
      .unique();
    table.string('logo_url').nullable();
    table.string('country').notNullable();
    table.string('country_name').notNullable();
    table.string('timezone').notNullable();
    table.string('currency').notNullable();
    table.string('language').notNullable();
    table.timestamps();
    table.unique(['country', 'name']);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('companies');
