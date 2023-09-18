import { defineMessages } from 'react-intl'

const adminPrefix = 'admin/b2b-organizations.'

export const organizationMessages = defineMessages({
  statusActive: {
    id: `${adminPrefix}organization-details.status.active`,
  },
  statusOnHold: {
    id: `${adminPrefix}organization-details.status.on-hold`,
  },
  statusInactive: {
    id: `${adminPrefix}organization-details.status.inactive`,
  },
  toastUpdateSuccess: {
    id: `${adminPrefix}organization-details.toast.update-success`,
  },
  toastUpdateFailure: {
    id: `${adminPrefix}organization-details.toast.update-failure`,
  },
  toastAddCostCenterSuccess: {
    id: `${adminPrefix}organization-details.toast.add-costCenter-success`,
  },
  toastAddCostCenterFailure: {
    id: `${adminPrefix}organization-details.toast.add-costCenter-failure`,
  },
  detailsColumnName: {
    id: `${adminPrefix}organization-details.table.column-name.title`,
  },
  columnAddresses: {
    id: `${adminPrefix}organization-details.table.column-addresses.title`,
  },
  detailsPageTitle: {
    id: `${adminPrefix}organization-details.title`,
  },
  back: {
    id: `${adminPrefix}back`,
  },
  status: {
    id: `${adminPrefix}organization-details.status`,
  },
  costCenters: {
    id: `${adminPrefix}organization-details.costCenters`,
  },
  showRows: {
    id: `${adminPrefix}showRows`,
  },
  of: {
    id: `${adminPrefix}of`,
  },
  checkItOut: {
    id: `${adminPrefix}check-it-out`,
  },
  invalidSchema: {
    id: `${adminPrefix}invalid-schema`,
  },
  autocompleteSearching: {
    id: `${adminPrefix}autocomplete-searching`,
  },
  new: {
    id: `${adminPrefix}organization-details.button.new`,
  },
  collections: {
    id: `${adminPrefix}organization-details.collections`,
  },
  paymentTerms: {
    id: `${adminPrefix}organization-details.paymentTerms`,
  },
  priceTables: {
    id: `${adminPrefix}organization-details.price-tables`,
  },
  sellers: {
    id: `${adminPrefix}organization-details.sellers`,
  },
  salesChannel: {
    id: `${adminPrefix}organization-details.sales-channel`,
  },
  users: {
    id: `${adminPrefix}organization-details.users`,
  },
  selectedRows: {
    id: `${adminPrefix}selected-rows`,
  },
  removeFromOrg: {
    id: `${adminPrefix}organization-details.remove-from-org`,
  },
  addToOrg: {
    id: `${adminPrefix}organization-details.add-to-org`,
  },
  add: {
    id: `${adminPrefix}organization-details.button.add`,
  },
  cancel: {
    id: `${adminPrefix}organization-details.button.cancel`,
  },
  costCenterName: {
    id: `${adminPrefix}costCenter-details.costCenter-name`,
  },
  stateRegistration: {
    id: `${adminPrefix}costCenter-details.stateRegistration`,
  },
  stateRegistrationHelp: {
    id: `${adminPrefix}costCenter-details.stateRegistration.helpText`,
  },
  businessDocument: {
    id: `${adminPrefix}costCenter-details.businessDocument`,
  },
  businessDocumentHelp: {
    id: `${adminPrefix}costCenter-details.businessDocument.helpText`,
  },
  phoneNumber: {
    id: `${adminPrefix}costCenter-details.phoneNumber`,
  },
  phoneNumberHelp: {
    id: `${adminPrefix}costCenter-details.phoneNumber.helpText`,
  },
  editUser: {
    id: `${adminPrefix}organization-details.edit-user`,
  },
  save: {
    id: `${adminPrefix}organization-details.button.save`,
  },
  removeUser: {
    id: `${adminPrefix}organization-details.button.remove-user`,
  },
  default: {
    id: `${adminPrefix}organization-details.default`,
  },
  organizationNameRequired: {
    id: `${adminPrefix}organization-details.organization-name-required`,
  },
  tradeName: {
    id: `${adminPrefix}organization-details.tradeName`,
  },
  tradeNameHelp: {
    id: `${adminPrefix}organization-details.tradeName.helpText`,
  },
  email: {
    id: `${adminPrefix}user-details.email`,
  },
  costCenter: {
    id: `${adminPrefix}user-details.placeholder-costCenter`,
  },
  role: {
    id: `${adminPrefix}user-details.placeholder-role`,
  },
  userCostCenter: {
    id: `${adminPrefix}user-details.costCenter`,
  },
  userOrganization: {
    id: `${adminPrefix}user-details.organization`,
  },
  userRole: {
    id: `${adminPrefix}user-details.role`,
  },
  addUser: {
    id: `${adminPrefix}organization-details.add-user`,
  },
  addUserHelp: {
    id: `${adminPrefix}organization-details.add-user.helpText`,
  },
  name: {
    id: `${adminPrefix}user-details.name`,
  },
  columnEmail: {
    id: `${adminPrefix}organization-users.column.email`,
  },
  columnRole: {
    id: `${adminPrefix}organization-users.column.role`,
  },
  columnCostCenter: {
    id: `${adminPrefix}organization-users.column.costCenter`,
  },
  usersEmptyState: {
    id: `${adminPrefix}organization-users.emptyState`,
  },
  toastAddUserSuccess: {
    id: `${adminPrefix}organization-users.toast.add-success`,
  },
  toastUserDuplicatedOrganization: {
    id: `${adminPrefix}organization-users.toast.duplicated-organization`,
  },
  toastUserDuplicated: {
    id: `${adminPrefix}organization-users.toast.duplicated`,
  },
  toastAddUserFailure: {
    id: `${adminPrefix}organization-users.toast.add-failure`,
  },
  toastUpdateUserSuccess: {
    id: `${adminPrefix}organization-users.toast.update-success`,
  },
  toastUpdateUserFailure: {
    id: `${adminPrefix}organization-users.toast.update-failure`,
  },
  toastRemoveUserSuccess: {
    id: `${adminPrefix}organization-users.toast.remove-success`,
  },
  toastRemoveUserFailure: {
    id: `${adminPrefix}organization-users.toast.remove-failure`,
  },
  removeUserConfirm: {
    id: `${adminPrefix}organization-details.button.remove-user-confirm`,
  },
  removeUserHelp: {
    id: `${adminPrefix}organization-details.remove-user.helpText`,
  },
  addSingle: {
    id: `${adminPrefix}organizations-admin.add-single`,
  },
  addBulk: {
    id: `${adminPrefix}organizations-admin.add-bulk`,
  },
  toastAddOrgSuccess: {
    id: `${adminPrefix}organizations-admin.toast.add-organization-success`,
  },
  toastAddOrgFailure: {
    id: `${adminPrefix}organizations-admin.toast.add-organization-failure`,
  },
  tableColumnName: {
    id: `${adminPrefix}organizations-admin.table.column-name.title`,
  },
  columnStatus: {
    id: `${adminPrefix}organizations-admin.table.column-status.title`,
  },
  view: {
    id: `${adminPrefix}organizations-admin.table.view.label`,
  },
  tablePageTitle: {
    id: `${adminPrefix}organizations-admin.title`,
  },
  organizationsEmptyState: {
    id: `${adminPrefix}organizations-admin.table.empty-state`,
  },
  searchPlaceholder: {
    id: `${adminPrefix}organizations-admin.table.search.placeholder`,
  },
  clearFilters: {
    id: `${adminPrefix}organizations-admin.table.clearFilters.label`,
  },
  filterStatus: {
    id: `${adminPrefix}organizations-admin.table.statusFilter.label`,
  },
  filtersAll: {
    id: `${adminPrefix}organizations-admin.table.filters.all`,
  },
  filtersNone: {
    id: `${adminPrefix}organizations-admin.table.filters.none`,
  },
  filtersIncludes: {
    id: `${adminPrefix}organizations-admin.table.filters.includes`,
  },
  organizationName: {
    id: `${adminPrefix}organizations-admin.add-organization.organization-name`,
  },
  defaultCostCenterName: {
    id: `${adminPrefix}organizations-admin.add-organization.default-costCenter-name`,
  },
  organizationsTitle: {
    id: `${adminPrefix}organizations.navigation.label`,
  },
})

export const costCenterMessages = defineMessages({
  toastUpdateSuccess: {
    id: `${adminPrefix}costCenter-details.toast.update-success`,
  },
  toastUpdateFailure: {
    id: `${adminPrefix}costCenter-details.toast.update-failure`,
  },
  toastDeleteFailure: {
    id: `${adminPrefix}costCenter-details.toast.delete-failure`,
  },
  addressEdit: {
    id: `${adminPrefix}costCenter-details.address.edit`,
  },
  addressDelete: {
    id: `${adminPrefix}costCenter-details.address.delete`,
  },
  pageTitle: {
    id: `${adminPrefix}costCenter-details.title`,
  },
  back: {
    id: `${adminPrefix}back`,
  },
  costCenterName: {
    id: `${adminPrefix}costCenter-details.costCenter-name`,
  },
  phoneNumber: {
    id: `${adminPrefix}costCenter-details.phoneNumber`,
  },
  phoneNumberHelp: {
    id: `${adminPrefix}costCenter-details.phoneNumber.helpText`,
  },
  stateRegistration: {
    id: `${adminPrefix}costCenter-details.stateRegistration`,
  },
  stateRegistrationHelp: {
    id: `${adminPrefix}costCenter-details.stateRegistration.helpText`,
  },
  businessDocument: {
    id: `${adminPrefix}costCenter-details.businessDocument`,
  },
  businessDocumentHelp: {
    id: `${adminPrefix}costCenter-details.businessDocument.helpText`,
  },
  addresses: {
    id: `${adminPrefix}costCenter-details.addresses`,
  },
  add: {
    id: `${adminPrefix}costCenter-details.button.add`,
  },
  cancel: {
    id: `${adminPrefix}costCenter-details.button.cancel`,
  },
  update: {
    id: `${adminPrefix}costCenter-details.button.update`,
  },
  deleteConfirm: {
    id: `${adminPrefix}costCenter-details.button.delete-confirm`,
  },
  defaultAddress: {
    id: `${adminPrefix}costCenter-details.default-address`,
  },
  duplicateAddress: {
    id: `${adminPrefix}costCenter-details.duplicate-address`,
  },
  marketingTags: {
    id: `${adminPrefix}costCenter-details.marketing-tags`,
  },
})

export const organizationRequestMessages = defineMessages({
  toastCreatedSuccess: {
    id: `${adminPrefix}organization-request-details.toast.created-success`,
  },
  toastUpdateSuccess: {
    id: `${adminPrefix}organization-request-details.toast.update-success`,
  },
  toastUpdateFailure: {
    id: `${adminPrefix}organization-request-details.toast.update-failure`,
  },
  detailsPageTitle: {
    id: `${adminPrefix}organization-request-details.title`,
  },
  back: {
    id: `${adminPrefix}back`,
  },
  addNote: {
    id: `${adminPrefix}organization-request-details.add-note.label`,
  },
  columnName: {
    id: `${adminPrefix}organization-requests-admin.table.column-name.title`,
  },
  columnAdmin: {
    id: `${adminPrefix}organization-requests-admin.table.column-admin.title`,
  },
  columnStatus: {
    id: `${adminPrefix}organization-requests-admin.table.column-status.title`,
  },
  columnCreated: {
    id: `${adminPrefix}organization-requests-admin.table.column-created.title`,
  },
  view: {
    id: `${adminPrefix}organization-requests-admin.table.view.label`,
  },
  tablePageTitle: {
    id: `${adminPrefix}organization-requests-admin.title`,
  },
  emptyState: {
    id: `${adminPrefix}organization-requests-admin.table.empty-state`,
  },
  showRows: {
    id: `${adminPrefix}showRows`,
  },
  of: {
    id: `${adminPrefix}of`,
  },
  searchPlaceholder: {
    id: `${adminPrefix}organization-requests-admin.table.search.placeholder`,
  },
  clearFilters: {
    id: `${adminPrefix}organization-requests-admin.table.clearFilters.label`,
  },
  statusFilter: {
    id: `${adminPrefix}organization-requests-admin.table.statusFilter.label`,
  },
  filtersAll: {
    id: `${adminPrefix}organization-requests-admin.table.filters.all`,
  },
  filtersNone: {
    id: `${adminPrefix}organization-requests-admin.table.filters.none`,
  },
  filtersIncludes: {
    id: `${adminPrefix}organization-requests-admin.table.filters.includes`,
  },
})

export const organizationSettingsMessages = defineMessages({
  toastUpdateSuccess: {
    id: `${adminPrefix}organization-settings-admin.toast.update-success`,
  },
  toastUpdateFailure: {
    id: `${adminPrefix}organization-settings-admin.toast.update-failure`,
  },
  tablePageTitle: {
    id: `${adminPrefix}organization-settings-admin.title`,
  },
  customFieldsTitle: {
    id: `${adminPrefix}organization-settings-admin.customFieldsTitle`,
  },
  emptyState: {
    id: `${adminPrefix}organization-requests-admin.table.empty-state`,
  },
  autoApprove: {
    id: `${adminPrefix}organization-settings-admin.autoApprove`,
  },
  businessReadOnly: {
    id: `${adminPrefix}organization-settings-admin.businessReadOnly`,
  },
  stateReadOnly: {
    id: `${adminPrefix}organization-settings-admin.stateReadOnly`,
  },
  saveSettings: {
    id: `${adminPrefix}organization-settings-admin.saveSettings`,
  },
  selectedPaymentsTableTitle: {
    id: `${adminPrefix}organization-settings-admin.selectedPaymentsTableTitle`,
  },
  availablePaymentsTableTitle: {
    id: `${adminPrefix}organization-settings-admin.availablePaymentsTableTitle`,
  },
  selectedPriceTablesTitle: {
    id: `${adminPrefix}organization-settings-admin.selectedPriceTablesTitle`,
  },
  availablePriceTablesTitle: {
    id: `${adminPrefix}organization-settings-admin.availablePriceTablesTitle`,
  },
  bindingTitle: {
    id: `${adminPrefix}organization-settings-select.binding.title`,
  },
  bindingAvailable: {
    id: `${adminPrefix}organization-settings-select.binding.available`,
  },
  bindingSelected: {
    id: `${adminPrefix}organization-settings-select.binding.selected`,
  },
  selectedRows: {
    id: `${adminPrefix}selected-rows`,
  },
  removeFromBinding: {
    id: `${adminPrefix}organization-settings-select.remove-from-binding`,
  },
  addToBinding: {
    id: `${adminPrefix}organization-settings-select.add-to-binding`,
  },
  showModal: {
    id: `${adminPrefix}organization-settings-showModal`,
  },
  clearCart: {
    id: `${adminPrefix}organization-settings-clearCart`,
  },
})

export const organizationCustomFieldsMessages = defineMessages({
  customFieldsTitle: {
    id: `${adminPrefix}custom-fields.title`,
  },
  customFieldsTitleSingular: {
    id: `${adminPrefix}custom-fields.name-singular`,
  },
  customFieldsExplanation: {
    id: `${adminPrefix}custom-fields.explanation`,
  },
  customFieldsTableFieldName: {
    id: `${adminPrefix}custom-fields.table.field-name`,
  },
  customFieldsTableFieldType: {
    id: `${adminPrefix}custom-fields.table.field-type`,
  },
  customFieldsTableDropdownPreview: {
    id: `${adminPrefix}custom-fields.table.dropdown-preview`,
  },
  customFieldsTableUseOnRegistration: {
    id: `${adminPrefix}custom-fields.table.use-on-registration`,
  },
  customFieldsAddField: {
    id: `${adminPrefix}custom-fields.add-field`,
  },
  customFieldsRemoveField: {
    id: `${adminPrefix}custom-fields.remove-field`,
  },
  customFieldsAddDropdownLine: {
    id: `${adminPrefix}custom-fields.table.add-dropdown-line`,
  },
  customFieldsRemoveDropdownLine: {
    id: `${adminPrefix}custom-fields.table.remove-dropdown-line`,
  },
  customFieldsDropdownLineValue: {
    id: `${adminPrefix}custom-fields.table.dropdown-line-value`,
  },
  customFieldsDropdownLineLabel: {
    id: `${adminPrefix}custom-fields.table.dropdown-line-label`,
  },
  customFieldsTextLabel: {
    id: `${adminPrefix}custom-fields.table.text-label`,
  },
  customFieldsDropdownLabel: {
    id: `${adminPrefix}custom-fields.table.dropdown-label`,
  },
})
