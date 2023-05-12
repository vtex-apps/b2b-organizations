import { defineMessages } from 'react-intl'

const storePrefix = 'store/b2b-organizations.'

export const costCenterMessages = defineMessages({
  toastUpdateSuccess: {
    id: `${storePrefix}costCenter-details.toast.update-success`,
  },
  toastUpdateFailure: {
    id: `${storePrefix}costCenter-details.toast.update-failure`,
  },
  toastDeleteFailure: {
    id: `${storePrefix}costCenter-details.toast.delete-failure`,
  },
  addressEdit: {
    id: `${storePrefix}costCenter-details.address.edit`,
  },
  addressDelete: {
    id: `${storePrefix}costCenter-details.address.delete`,
  },
  pageTitle: {
    id: `${storePrefix}costCenter-details.title`,
  },
  back: {
    id: `${storePrefix}back`,
  },
  costCenterName: {
    id: `${storePrefix}costCenter-details.costCenter-name`,
  },
  addresses: {
    id: `${storePrefix}costCenter-details.addresses`,
  },
  paymentTerms: {
    id: `${storePrefix}costCenter-details.payment-terms`,
  },
  addressesSubtitle: {
    id: `${storePrefix}costCenter-details.addresses.helpText`,
  },
  paymentTermsSubtitle: {
    id: `${storePrefix}costCenter-details.payment-terms.helpText`,
  },
  defaultAddress: {
    id: `${storePrefix}costCenter-details.default-address`,
  },
  duplicateAddress: {
    id: `${storePrefix}costCenter-details.duplicate-address`,
  },
  phoneNumber: {
    id: `${storePrefix}costCenter-details.phoneNumber`,
  },
  phoneNumberHelp: {
    id: `${storePrefix}costCenter-details.phoneNumber.helpText`,
  },
  stateRegistration: {
    id: `${storePrefix}costCenter-details.stateRegistration`,
  },
  stateRegistrationHelp: {
    id: `${storePrefix}costCenter-details.stateRegistration.helpText`,
  },
  businessDocument: {
    id: `${storePrefix}costCenter-details.businessDocument`,
  },
  businessDocumentHelp: {
    id: `${storePrefix}costCenter-details.businessDocument.helpText`,
  },
  deleteConfirm: {
    id: `${storePrefix}costCenter-details.button.delete-confirm`,
  },
  update: {
    id: `${storePrefix}costCenter-details.button.update`,
  },
  add: {
    id: `${storePrefix}costCenter-details.button.add`,
  },
  cancel: {
    id: `${storePrefix}costCenter-details.button.cancel`,
  },
})

export const organizationMessages = defineMessages({
  editUser: {
    id: `${storePrefix}organization-details.edit-user`,
  },
  save: {
    id: `${storePrefix}organization-details.button.save`,
  },
  cancel: {
    id: `${storePrefix}organization-details.button.cancel`,
  },
  removeUser: {
    id: `${storePrefix}organization-details.button.remove-user`,
  },
  email: {
    id: `${storePrefix}user-details.email`,
  },
  costCenter: {
    id: `${storePrefix}user-details.placeholder-costCenter`,
  },
  role: {
    id: `${storePrefix}user-details.placeholder-role`,
  },
  userCostCenter: {
    id: `${storePrefix}user-details.costCenter`,
  },
  userOrganization: {
    id: `${storePrefix}user-details.organization`,
  },
  userRole: {
    id: `${storePrefix}user-details.role`,
  },
  addUser: {
    id: `${storePrefix}organization-details.add-user`,
  },
  addUserHelp: {
    id: `${storePrefix}organization-details.add-user.helpText`,
  },
  add: {
    id: `${storePrefix}organization-details.button.add`,
  },
  name: {
    id: `${storePrefix}user-details.name`,
  },
  toastAddCostCenterSuccess: {
    id: `${storePrefix}organization-details.toast.add-costCenter-success`,
  },
  toastAddCostCenterFailure: {
    id: `${storePrefix}organization-details.toast.add-costCenter-failure`,
  },
  columnName: {
    id: `${storePrefix}organization-details.table.column-name.title`,
  },
  columnAddresses: {
    id: `${storePrefix}organization-details.table.column-addresses.title`,
  },
  pageTitle: {
    id: `${storePrefix}organization-details.title`,
  },
  back: {
    id: `${storePrefix}back`,
  },
  costCenters: {
    id: `${storePrefix}organization-details.costCenters`,
  },
  users: {
    id: `${storePrefix}organization-details.users`,
  },
  showRows: {
    id: `${storePrefix}showRows`,
  },
  checkItOut: {
    id: `${storePrefix}check-it-out`,
  },
  of: {
    id: `${storePrefix}of`,
  },
  invalidSchema: {
    id: `${storePrefix}invalid-schema`,
  },
  autocompleteSearching: {
    id: `${storePrefix}autocomplete-searching`,
  },
  autocompleteSearchingCostCenter: {
    id: `${storePrefix}autocomplete-searching.cost-center`,
  },
  new: {
    id: `${storePrefix}organization-details.button.new`,
  },
  columnEmail: {
    id: `${storePrefix}organization-users.column.email`,
  },
  columnRole: {
    id: `${storePrefix}organization-users.column.role`,
  },
  columnCostCenter: {
    id: `${storePrefix}organization-users.column.costCenter`,
  },
  columnOrganizationName: {
    id: `${storePrefix}organization-users.column.organizationName`,
  },
  searchPlaceholder: {
    id: `${storePrefix}organization-users.table.search.placeholder`,
  },
  emptyState: {
    id: `${storePrefix}organization-users.emptyState`,
  },
  toastAddUserSuccess: {
    id: `${storePrefix}organization-users.toast.add-success`,
  },
  toastUserDuplicated: {
    id: `${storePrefix}organization-users.toast.duplicated`,
  },
  toastUserDuplicatedOrganization: {
    id: `${storePrefix}organization-users.toast.duplicated-organization`,
  },
  toastAddUserFailure: {
    id: `${storePrefix}organization-users.toast.add-failure`,
  },
  toastUpdateUserSuccess: {
    id: `${storePrefix}organization-users.toast.update-success`,
  },
  toastUpdateUserFailure: {
    id: `${storePrefix}organization-users.toast.update-failure`,
  },
  toastRemoveUserSuccess: {
    id: `${storePrefix}organization-users.toast.remove-success`,
  },
  toastRemoveUserFailure: {
    id: `${storePrefix}organization-users.toast.remove-failure`,
  },
  toastImpersonateStarting: {
    id: `${storePrefix}organization-users.toast.impersonate-starting`,
  },
  toastImpersonateSuccess: {
    id: `${storePrefix}organization-users.toast.impersonate-success`,
  },
  toastImpersonateFailure: {
    id: `${storePrefix}organization-users.toast.impersonate-failure`,
  },
  toastImpersonateForbidden: {
    id: `${storePrefix}organization-users.toast.impersonate-forbidden`,
  },
  toastImpersonateIdMissing: {
    id: `${storePrefix}organization-users.toast.impersonate-id-missing`,
  },
  impersonate: {
    id: `${storePrefix}organization-users.impersonate`,
  },
  removeUserConfirm: {
    id: `${storePrefix}organization-details.button.remove-user-confirm`,
  },
  removeUserHelp: {
    id: `${storePrefix}organization-details.remove-user.helpText`,
  },
  salesAdminTitle: {
    id: `${storePrefix}organization-details.sales-admin-title`,
  },
  organizationsWithoutSalesManager: {
    id: `${storePrefix}organization-details.organizations-without-sales-manager-title`,
  },
  organizationsWithoutSalesManagerOK: {
    id: `${storePrefix}organization-details.organizations-without-sales-manager-ok`,
  },
  organizationsWithoutSalesManagerWarning: {
    id: `${storePrefix}organization-details.organizations-without-sales-manager-warning`,
  },
  tradeName: {
    id: `${storePrefix}organizations-details.tradeName`,
  },
  tradeNameHelp: {
    id: `${storePrefix}organizations-details.tradeName.helpText`,
  },
})

export const organizationRequestMessages = defineMessages({
  toastSuccess: {
    id: `${storePrefix}request-new-organization.submit.toast-success`,
  },
  toastFailure: {
    id: `${storePrefix}request-new-organization.submit.toast-failure`,
  },
  toastPending: {
    id: `${storePrefix}request-new-organization.submit.toast-duplicate-pending`,
  },
  toastApproved: {
    id: `${storePrefix}request-new-organization.submit.toast-duplicate-approved`,
  },
  pageTitle: {
    id: `${storePrefix}request-new-organization.title`,
  },
  helpText: {
    id: `${storePrefix}request-new-organization.helpText`,
  },
  organizationName: {
    id: `${storePrefix}request-new-organization.organization-name.label`,
  },
  tradeName: {
    id: `${storePrefix}request-new-organization.tradeName`,
  },
  tradeNameHelp: {
    id: `${storePrefix}request-new-organization.tradeName.helpText`,
  },
  b2bCustomerAdmin: {
    id: `${storePrefix}request-new-organization.b2b-customer-admin.title`,
  },
  b2bCustomerAdminHelpText: {
    id: `${storePrefix}request-new-organization.b2b-customer-admin.helpText`,
  },
  firstName: {
    id: `${storePrefix}request-new-organization.first-name.label`,
  },
  lastName: {
    id: `${storePrefix}request-new-organization.last-name.label`,
  },
  email: {
    id: `${storePrefix}request-new-organization.email.label`,
  },
  defaultCostCenter: {
    id: `${storePrefix}request-new-organization.default-cost-center.title`,
  },
  defaultCostCenterHelpText: {
    id: `${storePrefix}request-new-organization.default-cost-center.helpText`,
  },
  defaultCostCenterName: {
    id: `${storePrefix}request-new-organization.default-cost-center-name.label`,
  },
  phoneNumber: {
    id: `${storePrefix}request-new-organization.phoneNumber`,
  },
  phoneNumberHelp: {
    id: `${storePrefix}request-new-organization.phoneNumber.helpText`,
  },
  businessDocument: {
    id: `${storePrefix}request-new-organization.businessDocument`,
  },
  businessDocumentHelp: {
    id: `${storePrefix}request-new-organization.businessDocument.helpText`,
  },
  stateRegistration: {
    id: `${storePrefix}request-new-organization.stateRegistration`,
  },
  stateRegistrationHelp: {
    id: `${storePrefix}request-new-organization.stateRegistration.helpText`,
  },
})

export const userWidgetMessages = defineMessages({
  role: {
    id: `${storePrefix}user-widget.role`,
  },
  organization: {
    id: `${storePrefix}user-widget.organization`,
  },
  costCenter: {
    id: `${storePrefix}user-widget.costCenter`,
  },
  status: {
    id: `${storePrefix}user-widget.status`,
  },
  active: {
    id: `${storePrefix}user-widget.status.active`,
  },
  onHold: {
    id: `${storePrefix}user-widget.status.on-hold`,
  },
  inactive: {
    id: `${storePrefix}user-widget.status.inactive`,
  },
  manageOrganization: {
    id: `${storePrefix}user-widget.manage-organization`,
  },
  impersonating: {
    id: `${storePrefix}user-widget.impersonating`,
  },
  stopImpersonation: {
    id: `${storePrefix}stop-impersonation`,
  },
  setCurrentOrganization: {
    id: `${storePrefix}set-current-organization`,
  },
  selectCompany: {
    id: `${storePrefix}modal.select-company`,
  },
  search: {
    id: `${storePrefix}modal.search`,
  },
  join: {
    id: `${storePrefix}modal.join`,
  },
  changeOrganization: {
    id: `${storePrefix}change-organization`,
  },
  currentOrganization: {
    id: `${storePrefix}current-organization`,
  },
  organizationsFound: {
    id: `${storePrefix}organizations-found`,
  },
})
