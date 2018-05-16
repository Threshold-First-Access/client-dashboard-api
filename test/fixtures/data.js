const faker = require('faker');

const userService = require('../../app/services/user');
const CompanyService = require('../../app/services/company');

const data = {};

data.userFixture = () => {
  return {
    company_id: null,
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    email: faker.internet.email(),
    password: 'Jxugd1hh!',
  };
};

data.companyFixture = () => {
  return {
    name: faker.company.companyName(),
    country: faker.random.arrayElement(['NG', 'GH', 'KE', 'TZ']),
  };
};

data.createData = () => {
  return CompanyService.create(data.companyFixture()).then((company) => {
    const user = data.userFixture();
    user.company_id = company.id;
    return userService.create(user);
  });
};

/**
 * Create a single user
 */
data.createUser = () =>
  userService.create({
    body: data.userFixture(),
    user: { id: 1 },
  });

module.exports = data;
