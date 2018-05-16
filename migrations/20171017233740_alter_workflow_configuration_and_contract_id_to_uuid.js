const dropForeignKeys = (knex) =>
  Promise.all([
    knex.schema.alterTable('groups', (t) => t.dropForeign('application_id')),
    knex.schema.alterTable('applicants', (t) =>
      t.dropForeign('application_id'),
    ),
    knex.schema.alterTable('configurations', (t) =>
      t.dropForeign('workflow_id'),
    ),
    knex.schema.alterTable('contracts', (t) => t.dropForeign('workflow_id')),
    knex.schema.alterTable('notes', (t) => t.dropForeign('application_id')),
    knex.schema.alterTable('applications', (t) => t.dropForeign('workflow_id')),
  ]);

const createForeignKeys = (knex) =>
  Promise.all([
    knex.schema.alterTable('applicants', (t) =>
      t
        .foreign('application_id')
        .references('id')
        .inTable('applications'),
    ),

    knex.schema.alterTable('groups', (t) =>
      t
        .foreign('application_id')
        .references('id')
        .inTable('applications'),
    ),

    knex.schema.alterTable('configurations', (t) =>
      t
        .foreign('workflow_id')
        .references('id')
        .inTable('workflows'),
    ),

    knex.schema.alterTable('notes', (t) =>
      t
        .foreign('application_id')
        .references('id')
        .inTable('applications'),
    ),

    knex.schema.alterTable('applications', (t) =>
      t
        .foreign('workflow_id')
        .references('id')
        .inTable('workflows'),
    ),

    knex.schema.alterTable('contracts', (t) =>
      t
        .foreign('workflow_id')
        .references('id')
        .inTable('workflows'),
    ),
  ]);

exports.up = (knex, Promise) =>
  dropForeignKeys(knex)
    .then(() =>
      Promise.all([
        knex.schema.alterTable('applications', (t) => t.uuid('id').alter()),
        knex.schema.alterTable('applications', (t) =>
          t.uuid('workflow_id').alter(),
        ),
        knex.schema.alterTable('contracts', (t) => t.uuid('id').alter()),
        knex.schema.alterTable('contracts', (t) =>
          t.uuid('workflow_id').alter(),
        ),
        knex.schema.alterTable('configurations', (t) => t.uuid('id').alter()),
        knex.schema.alterTable('configurations', (t) =>
          t.uuid('workflow_id').alter(),
        ),
        knex.schema.alterTable('groups', (t) =>
          t.uuid('application_id').alter(),
        ),
        knex.schema.alterTable('applicants', (t) => t.uuid('id').alter()),
        knex.schema.alterTable('applicants', (t) =>
          t.uuid('application_id').alter(),
        ),
        knex.schema.alterTable('workflows', (t) => t.uuid('id').alter()),
        knex.schema.alterTable('notes', (t) =>
          t.uuid('application_id').alter(),
        ),
      ]),
    )
    .then(() => createForeignKeys(knex));

exports.down = (knex, Promise) =>
  dropForeignKeys(knex)
    .then(() =>
      Promise.all([
        knex.schema.alterTable('applications', (t) => t.string('id').alter()),
        knex.schema.alterTable('applications', (t) =>
          t.string('workflow_id').alter(),
        ),
        knex.schema.alterTable('applicants', (t) => t.string('id').alter()),
        knex.schema.alterTable('contracts', (t) => t.string('id').alter()),
        knex.schema.alterTable('contracts', (t) =>
          t.string('workflow_id').alter(),
        ),
        knex.schema.alterTable('configurations', (t) => t.string('id').alter()),
        knex.schema.alterTable('configurations', (t) =>
          t.string('workflow_id').alter(),
        ),
        knex.schema.alterTable('workflows', (t) => t.string('id').alter()),
        knex.schema.alterTable('groups', (t) =>
          t.string('application_id').alter(),
        ),
        knex.schema.alterTable('applicants', (t) =>
          t.string('application_id').alter(),
        ),
        knex.schema.alterTable('notes', (t) =>
          t.string('application_id').alter(),
        ),
      ]),
    )
    .then(() => createForeignKeys(knex));
