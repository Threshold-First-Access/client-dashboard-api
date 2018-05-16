exports.up = (knex) =>
  knex.schema.table('appraisals', (table) => {
    table
      .uuid('client_id')
      .references('id')
      .inTable('company_apps')
      .nullable();
  });

exports.down = (knex) =>
  knex.schema.table('appraisals', (table) => {
    table.dropForeign('client_id').dropColumn('client_id');
  });
