/**
 @description Define errors available in project
 * */

const create = require('custom-error-generator');

module.exports = {
  InvalidVersion: create('InvalidVersion', { code: 'INVALID_VERSION' }),

  MethodNotImplemented: create('MethodNotImplemented', {
    code: 'METHOD_NOT_IMPLEMENTED',
  }),

  InvalidParams: create('InvalidParamsError', { code: 'INVALID_PARAMS' }),

  InternalServerError: create('InternalServerError', {
    code: 'INTERNAL_SERVER_ERROR',
  }),

  UserAlreadyCreated: create('UserAlreadyCreated', {
    code: 'USER_ALREADY_CREATED',
  }),

  UserAlreadyActive: create('UserAlreadyActive', {
    code: 'USER_ALREADY_ACTIVE',
  }),

  UserNotFound: create('UserNotFound', { code: 'USER_NOT_FOUND' }),

  PasswordAlreadyUsed: create('PasswordAlreadyUsed', {
    code: 'PASSWORD_ALREADY_USED',
  }),

  RoleNotFound: create('RoleNotFound', { code: 'ROLE_NOT_FOUND' }),

  PermissionNotFound: create('PermissionNotFound', {
    code: 'PERMISSION_NOT_FOUND',
  }),

  RoleAlreadyCreated: create('RoleAlreadyCreated', {
    code: 'ROLE_ALREADY_CREATED',
  }),

  UserAlreadyExists: create('UserAlreadyExists', {
    code: 'USER_ALREADY_EXISTS',
  }),

  CompanyAlreadyCreated: create('CompanyAlreadyCreated', {
    code: 'COMPANY_ALREADY_CREATED',
  }),

  CompanyNotFound: create('CompanyNotFound', { code: 'COMPANY_NOT_FOUND' }),

  BranchNotFound: create('BranchNotFound', { code: 'BRANCH_NOT_FOUND' }),

  ProductExistsAlready: create('ProductExistsAlready', {
    code: 'ENTITY_ALREADY_EXISTS',
  }),

  InvalidType: create('InvalidType', { code: 'INVALID_TYPE' }),

  InvalidOption: create('InvalidOption', { code: 'INVALID_OPTION' }),

  DeactivatedUser: create('DeactivatedUser', { code: 'DEACTIVATED_USER' }),

  BranchHasActiveUsers: create('BranchHasActiveUsers', {
    code: 'BRANCH_HAS_ACTIVE_USERS',
  }),

  WorkflowNotFound: create('WorkflowNotFound', { code: 'WORKFLOW_NOT_FOUND' }),

  ApplicationNotFound: create('ApplicationNotFound', {
    code: 'APPLICATION_NOT_FOUND',
  }),

  ProductNotFound: create('ProductNotFound', { code: 'PRODUCT_NOT_FOUND' }),

  GroupNotFound: create('GroupNotFound', { code: 'GROUP_NOT_FOUND' }),

  DuplicateSlug: create('DuplicateSlug', { code: 'DUPLICATE_SLUG' }),

  InvalidPasswordResetCode: create('InvalidPasswordResetCode', {
    code: 'INVALID_PASSWORD_RESET_CODE',
  }),

  ConfiguratonNotFound: create('ConfiguratonNotFound', {
    code: 'CONFIGURATION_NOT_FOUND',
  }),

  ActionForbidden: create('ActionForbidden', { code: 'ACTION_FORBIDDEN' }),

  ContractNotFound: create('ContractNotFound', { code: 'CONTRACT_NOT_FOUND' }),

  InvalidDecisionObject: create('InvalidDecisionObject', {
    code: 'INVALID_DECISION_OBJECT',
  }),

  IncompleteApplication: create('IncompleteApplication', {
    code: 'INCOMPLETE_APPLICATION',
  }),

  CompletedAppraisal: create('CompletedAppraisal', {
    code: 'COMPLETED_APPRAISAL',
  }),

  InvalidAppraisal: create('InvalidAppraisal', {
    code: 'INVALID_APPRAISAL',
  }),

  InvalidS3Policy: create('InvalidS3Policy', { code: 'INVALID_S3_POLICY' }),

  AnalysisSchemaNotFound: create('AnalysisSchemaNotFound', {
    code: 'ANALYSIS_SCHEMA_NOT_FOUND',
  }),

  UnsupportedProduct: create('UnsupportedProduct', {
    code: 'UNSUPPORTED_PRODUCT',
  }),

  TokenNotFound: create('TokenNotFound', {
    code: 'TOKEN_NOT_FOUND',
  }),

  InvalidDateRange: create('InvalidDateRange', {
    code: 'INVALID_DATE_RANGE',
  }),
};
