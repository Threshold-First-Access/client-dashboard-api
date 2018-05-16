exports.up = (knex) => knex.schema.dropTable('groups');

exports.down = (knex) =>
  knex.schema.createTableIfNotExists('groups', (t) => {
    t.uuid('id');
    t.string('name').notNullable();
    t
      .uuid('application_id')
      .references('id')
      .inTable('applications')
      .onDelete('cascade');
    t.timestamps();
  });
