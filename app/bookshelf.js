/* eslint-disable import/no-extraneous-dependencies */

const knex = require('../app/config/database');
const bookshelf = require('bookshelf')(knex);

require('./plugin/audit')(bookshelf);

// Resolve circular dependencies with relations
bookshelf.plugin('registry');

// Hide attributes when calling toJSON
bookshelf.plugin('visibility');

// Add bookshelf-paranoia for soft-deletes.
bookshelf.plugin('bookshelf-paranoia');

// Cascade deletion to related records
bookshelf.plugin('bookshelf-cascade-delete');

// Enable bookshelf to use UUIDs as primary keys
bookshelf.plugin('bookshelf-uuid');

bookshelf.plugin('virtuals');

bookshelf.plugin('pagination');

module.exports = bookshelf;
