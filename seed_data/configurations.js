const schema =
  'eyJzY2hlbWEiOnsiYm9ycm93ZXIiOnsibmFtZSI6InNlY3Rpb25zLmZpcnN0X3NlY3Rpb24ubmFtZSIsImFtb3VudCI6InNlY3Rpb25zLmZpcnN0X3NlY3Rpb24uYXBwbGllZF9wcmluY2lwYWwifSwibWV0YSI6bnVsbCwibWV0YWRhdGEiOm51bGwsInNlY3Rpb25zIjp7ImZpcnN0X3NlY3Rpb24iOnsicmVxdWlyZWQiOnRydWUsInByb3BlcnRpZXMiOnsicHJldmlvdXNfbG9hbiI6eyJ0aXRsZSI6IkhhdmUgd2UgbG9hbmVkIHlvdSBiZWZvcmU/IiwidHlwZSI6IkJvb2xlYW5GaWVsZCJ9LCJuYW1lIjp7InR5cGUiOiJOYW1lRmllbGQiLCJzaW5nbGVfaW5wdXQiOnRydWUsInJlcXVpcmVkIjp0cnVlfSwiYXBwbGllZF9wcmluY2lwYWwiOnsidHlwZSI6Ik51bWJlckZpZWxkIiwicmVxdWlyZWQiOnRydWV9fX19fX0=';
module.exports = (ids) => [
  {
    id: ids.configurations[0],
    schema,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: ids.configurations[1],
    schema,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: ids.configurations[2],
    created_at: new Date(),
    updated_at: new Date(),
    schema,
  },
  {
    id: ids.configurations[3],
    created_at: new Date(),
    updated_at: new Date(),
    schema,
  },
  {
    id: ids.configurations[4],
    created_at: new Date(),
    updated_at: new Date(),
    schema,
  },
  {
    id: ids.configurations[5],
    created_at: new Date(),
    updated_at: new Date(),
    schema,
  },
  {
    id: ids.configurations[6],
    created_at: new Date(),
    updated_at: new Date(),
    schema,
  },
];
