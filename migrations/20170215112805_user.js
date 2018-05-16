/**
 * Sample migration for knex
 *
 * @param knex Instance of knex
 * @param Promise
 * @return {*}
 */
exports.up = (knex) =>
  knex.schema.createTableIfNotExists('users', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table
      .bigInteger('company_id')
      .unsigned()
      .references('id')
      .inTable('companies')
      .onDelete('cascade')
      .nullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table
      .string('email')
      .unique()
      .notNullable();
    table.enu('type', ['first_access', 'client']).notNullable();
    table.string('password').notNullable();
    table
      .enu('active', [1, 0])
      .notNullable()
      .defaultTo(0);
    table.timestamps();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('users');
