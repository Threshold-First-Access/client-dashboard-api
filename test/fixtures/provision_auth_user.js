const faker = require('faker');

const userFixture = require('./user');
const roleFixture = require('./role');
const bookshelf = require('../../app/bookshelf');

const roleData = {
  body: {
    name: faker.lorem.sentence(5, 10),
    description: 'Role for the test suites',
  },
};
// Create a new user
userFixture
  .create()
  .then((user) => {
    // Active user has been created. Create a role and add permissions to the role
    roleData.user = {
      id: user.id,
    };
    roleFixture.create(roleData).then((newRole) => {
      const role = newRole.toJSON();
      // Add permissions to the user's role
      roleFixture.addPermissions(newRole).then(() => {
        // Add user to new role
        roleFixture.addUser(role.id, user).then(() => process.exit());
      });
    });
  })
  .then(() =>
    bookshelf
      .knex('users')
      .where('email', '=', 'test.user@fa.com')
      .update({
        active: true,
        password:
          '$2a$10$sADu.5v2v9.FCsovvuPtLOpKPNeO/HNUo6dCr6nuJwa9tMyybcOju',
      }),
  );
