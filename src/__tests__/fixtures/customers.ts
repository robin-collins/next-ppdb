/**
 * Test Fixtures: Customers
 *
 * Sample customer data for testing
 */

export const testCustomers = [
  {
    surname: 'Smith',
    firstname: 'John',
    address1: '123 Main St',
    address2: '',
    town: 'Springfield',
    postcode: 1234,
    phone1: '555-0101',
    phone2: '',
    phone3: '',
    email: 'john.smith@example.com',
  },
  {
    surname: 'Johnson',
    firstname: 'Sarah',
    address1: '456 Oak Ave',
    address2: 'Apt 2B',
    town: 'Riverside',
    postcode: 2345,
    phone1: '555-0102',
    phone2: '555-0103',
    phone3: '',
    email: 'sarah.johnson@example.com',
  },
  {
    surname: 'Williams',
    firstname: 'Michael',
    address1: '789 Pine Rd',
    address2: '',
    town: 'Lakeside',
    postcode: 3456,
    phone1: '555-0104',
    phone2: '',
    phone3: '555-0105',
    email: 'michael.williams@example.com',
  },
  {
    surname: 'Brown',
    firstname: 'Emily',
    address1: '321 Elm St',
    address2: 'Unit 5',
    town: 'Hilltown',
    postcode: 4567,
    phone1: '555-0106',
    phone2: '555-0107',
    phone3: '555-0108',
    email: 'emily.brown@example.com',
  },
  {
    surname: 'Jones',
    firstname: 'David',
    address1: '654 Maple Dr',
    address2: '',
    town: 'Valleyview',
    postcode: 5678,
    phone1: '555-0109',
    phone2: '',
    phone3: '',
    email: 'david.jones@example.com',
  },
]

/**
 * Single customer for minimal test cases
 */
export const singleCustomer = {
  surname: 'Test',
  firstname: 'Customer',
  address1: '123 Test St',
  address2: '',
  town: 'Testville',
  postcode: 1000,
  phone1: '555-0100',
  phone2: '',
  phone3: '',
  email: 'test@example.com',
}

/**
 * Customer with edge case values
 */
export const edgeCaseCustomer = {
  surname: 'VeryLongSurname',
  firstname: 'VeryLongFirstname',
  address1: 'Very Long Address Line 1 That Tests Maximum Length',
  address2: 'Very Long Address Line 2 That Tests Maximum Length',
  town: 'VeryLongTownName',
  postcode: 9999,
  phone1: '555-999-9999',
  phone2: '555-888-8888',
  phone3: '555-777-7777',
  email: 'very.long.email.address@very-long-domain-name.com',
}

/**
 * Customer with minimal data
 */
export const minimalCustomer = {
  surname: 'A',
  firstname: 'B',
  address1: 'C',
  address2: '',
  town: 'D',
  postcode: 1,
  phone1: '5',
  phone2: '',
  phone3: '',
  email: 'a@b.c',
}

/**
 * Customer with empty optional fields
 */
export const customerWithEmptyFields = {
  surname: 'Empty',
  firstname: 'Fields',
  address1: '123 Empty St',
  address2: '',
  town: 'Emptyville',
  postcode: 1111,
  phone1: '555-0111',
  phone2: '',
  phone3: '',
  email: '',
}
