exports.up = (knex) =>
  knex.schema.table('users', (table) => {
    table.string('profile_pic').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('users', (table) => {
    table.dropColumn('profile_pic');
  });
