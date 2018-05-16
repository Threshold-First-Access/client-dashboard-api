/**
 * user_id: ID of the person that performed an operation
 * action: The kind of operation that was performed - Create, Delete, Edit and Update
 * table: The table where an action was performed
 * data: The data that was used when the operation was performed.
 *
 * @param knex
 */
exports.up = (knex) =>
  knex.schema.createTableIfNotExists('transaction_audit', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table
      .bigInteger('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users');
    table
      .enum('action', ['create', 'delete', 'edit', 'update', 'read'])
      .notNullable();
    table.string('table').notNullable();
    table.text('data').notNullable();
    table.timestamps();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('transaction_audit');
