exports.up = (knex) => knex.schema.dropTable('applicants');

exports.down = (knex) =>
  knex.schema.createTableIfNotExists('applicants', (t) => {
    t
      .bigincrements('id')
      .primary()
      .unsigned();
    t.string('name').notNullable();
    t
      .uuid('application_id')
      .references('id')
      .inTable('applications')
      .onDelete('cascade');
    t.specificType('data', 'JSON').notNullable();
    t
      .boolean('eligible')
      .notNullable()
      .defaultTo(false);
    t
      .boolean('approved')
      .notNullable()
      .defaultTo(false);
    t.specificType('decision', 'JSON').nullable();
    t.timestamp('deleted_at').nullable();
    t.timestamps();
  });
