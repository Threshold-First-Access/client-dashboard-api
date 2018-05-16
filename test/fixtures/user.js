const faker = require('faker');
const userService = require('../../app/services/user');

const user = {
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  email: 'test.user@fa.com',
  password: 'TestUser123&',
};

module.exports = {
  /**
   * Create a new user
   */
  create() {
    return userService
      .create({
        body: user,
        user: { id: 4 },
      })
      .then((result) => result);
  },
};
