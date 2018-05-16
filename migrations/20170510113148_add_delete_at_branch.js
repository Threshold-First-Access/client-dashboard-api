/**
 * Adds the delete_at column to braches
 *
 * The delete_at column is used by the bookshelf-paranoia plugin,
 * for soft deletes.
 */
exports.up = (knex) =>
  knex.schema.table('branches', (table) => {
    table.timestamp('deleted_at').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('branches', (table) => {
    table.dropColumn('deleted_at');
  });
