exports.up = (knex) =>
  knex.raw('ALTER TABLE contracts CONVERT TO CHARACTER SET utf8');

exports.down = (knex) =>
  knex.raw('ALTER TABLE contracts CONVERT TO CHARACTER SET utf8');
