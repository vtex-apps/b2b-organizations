import type { FunctionComponent } from 'react'
import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useLazyQuery } from 'react-apollo'
import {
  Layout,
  PageHeader,
  PageBlock,
  Card,
  ActionMenu,
  IconOptionsDots,
  Button,
  Spinner,
  Input,
  Modal,
  ModalDialog,
  Toggle,
  Tag,
} from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'
import { useIntl, FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { useCssHandles } from 'vtex.css-handles'
import {
  AddressRules,
  AddressSummary,
  AddressForm,
  AddressContainer,
  CountrySelector,
  PostalCodeGetter,
} from 'vtex.address-form'
import { StyleguideInput } from 'vtex.address-form/inputs'
import { addValidation } from 'vtex.address-form/helpers'

import {
  costCenterMessages as messages,
  organizationCustomFieldsMessages as orgaizationMessages,
} from './utils/messages'
import { setGUID, getEmptyAddress, isValidAddress } from '../utils/addresses'
import { validatePhoneNumber } from '../modules/formValidators'
import GET_COST_CENTER from '../graphql/getCostCenter.graphql'
import GET_ORGANIZATION from '../graphql/getOrganization.graphql'
import UPDATE_COST_CENTER from '../graphql/updateCostCenter.graphql'
import SET_MARKETING_TAGS from '../graphql/setMarketingTags.graphql'
import GET_MARKETING_TAGS from '../graphql/getMarketingTags.graphql'
import DELETE_COST_CENTER from '../graphql/deleteCostCenter.graphql'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'
import GET_B2B_CUSTOM_FIELDS from '../graphql/getB2BCustomFields.graphql'
import { joinById } from './OrganizationDetails'
import CustomFieldInput from './OrganizationDetailsCustomField'

const CSS_HANDLES = ['businessDocument', 'stateRegistration'] as const

const CostCenterDetails: FunctionComponent = () => {
  const { formatMessage } = useIntl()

  const {
    culture: { country },
    route: { params },
    navigate,
  } = useRuntime()

  const handles = useCssHandles(CSS_HANDLES)
  const showToast = useToast()

  const [loadingState, setLoadingState] = useState(false)
  const [costCenterName, setCostCenterName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [businessDocument, setBusinessDocument] = useState('')
  const [stateRegistration, setStateRegistration] = useState('')
  const [addresses, setAddresses] = useState([] as Address[])
  const [newAddressModalState, setNewAddressModalState] = useState({
    isOpen: false,
  })

  const [editAddressModalState, setEditAddressModalState] = useState({
    addressId: '',
    isOpen: false,
  })

  const [deleteAddressModalState, setDeleteAddressModalState] = useState({
    addressId: '',
    isOpen: false,
  })

  const [deleteCostCenterModalState, setDeleteCostCenterModalState] = useState({
    isOpen: false,
  })

  const [newAddressState, setNewAddressState] = useState(() =>
    addValidation(getEmptyAddress(country))
  )

  const [editAddressState, setEditAddressState] = useState(() =>
    addValidation(getEmptyAddress(country))
  )

  const [customFieldsState, setCustomFieldsState] = useState<CustomField[]>([])

  const [tags, setTags] = useState([] as string[])
  const [tagName, setTagName] = useState('')

  const { data, loading, refetch } = useQuery(GET_COST_CENTER, {
    variables: { id: params?.id },
    skip: !params?.id,
    ssr: false,
    fetchPolicy: 'network-only',
  })

  const { data: defaultCustomFieldsData } = useQuery(GET_B2B_CUSTOM_FIELDS, {
    variables: { id: params?.id },
    skip: !params?.id,
    ssr: false,
  })

  const [getOrganization, { data: organizationData }] = useLazyQuery(
    GET_ORGANIZATION
  )

  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })

  useQuery(GET_MARKETING_TAGS, {
    skip: !params?.id,
    ssr: false,
    fetchPolicy: 'network-only',
    variables: {
      costId: params?.id,
      fetchPolicy: 'network-only',
      skip: !params?.id,
      ssr: false,
    },
    onCompleted: _tags => {
      setTags(_tags?.getMarketingTags?.tags || [])
    },
  })

  const [updateCostCenter] = useMutation(UPDATE_COST_CENTER)
  const [deleteCostCenter] = useMutation(DELETE_COST_CENTER)
  const [setMarktingTags] = useMutation(SET_MARKETING_TAGS)

  const translateCountries = () => {
    const { shipsTo = [] } = logisticsData?.logistics ?? {}

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
  }

  const handleSetAddresses = (_addresses: Address[]) => {
    setAddresses(
      _addresses.map((item, index) => {
        item.checked = index === 0

        return item
      })
    )
  }

  const handleCheckDefault = (address: Address) => {
    setAddresses(
      addresses.map(item => {
        item.checked = item === address

        return item
      })
    )
  }

  useEffect(() => {
    if (!data?.getCostCenterById?.addresses?.length) return

    handleSetAddresses(data.getCostCenterById.addresses)
    setCostCenterName(data.getCostCenterById.name)

    if (data.getCostCenterById.businessDocument) {
      setBusinessDocument(data.getCostCenterById.businessDocument)
    }

    if (data.getCostCenterById.stateRegistration) {
      setStateRegistration(data.getCostCenterById.stateRegistration)
    }

    if (data.getCostCenterById.phoneNumber) {
      setPhoneNumber(data.getCostCenterById.phoneNumber)
    }

    getOrganization({
      variables: { id: data.getCostCenterById.organization },
    })
  }, [data])

  const navigateToParentOrganization = () => {
    navigate({
      page: 'admin.app.b2b-organizations.organization-details',
      params: { id: data.getCostCenterById.organization },
    })
  }

  const handleUpdateCostCenter = () => {
    setLoadingState(true)
    const _addresses = [...addresses]

    _addresses.sort(item => (item.checked ? -1 : 1))
    const variables = {
      id: params.id,
      input: {
        name: costCenterName,
        addresses: _addresses.map(item => {
          delete item.checked

          return item
        }),
        phoneNumber,
        businessDocument,
        customFields: customFieldsState,
        stateRegistration,
      },
    }

    setMarktingTags({
      variables: { tags, costId: params?.id },
    }).catch(error => console.error(error))

    updateCostCenter({ variables })
      .then(() => {
        showToast({
          variant: 'positive',
          message: formatMessage(messages.toastUpdateSuccess),
        })
        refetch()
        handleSetAddresses(_addresses)
        setLoadingState(false)
      })
      .catch(error => {
        console.error(error)
        showToast({
          variant: 'critical',
          message: formatMessage(messages.toastUpdateFailure),
        })
        setLoadingState(false)
      })
  }

  const handleDeleteCostCenter = () => {
    // TODO: add modal dialog
    setLoadingState(true)
    deleteCostCenter({ variables: { id: params?.id } })
      .then(() => {
        navigateToParentOrganization()
      })
      .catch(error => {
        console.error(error)
        showToast({
          variant: 'critical',
          message: formatMessage(messages.toastDeleteFailure),
        })
        setLoadingState(false)
      })
  }

  const handleCloseModals = () => {
    setDeleteAddressModalState({ addressId: '', isOpen: false })
    setEditAddressModalState({ addressId: '', isOpen: false })
    setEditAddressState(() => addValidation(getEmptyAddress(country)))
    setNewAddressModalState({ isOpen: false })
    setNewAddressState(() => addValidation(getEmptyAddress(country)))
    setDeleteCostCenterModalState({ isOpen: false })
  }

  const handleNewAddressModal = () => {
    setNewAddressModalState({ isOpen: true })
  }

  const handleEditAddressModal = (addressId: string) => {
    const editAddress = addresses.find(
      address => address.addressId === addressId
    )

    if (!editAddress) return

    setEditAddressState(() => addValidation(editAddress))
    setEditAddressModalState({ addressId, isOpen: true })
  }

  const handleDeleteAddressModal = (addressId: string) => {
    setDeleteAddressModalState({ addressId, isOpen: true })
  }

  const handleDeleteCostCenterModal = () => {
    setDeleteCostCenterModalState({ isOpen: true })
  }

  const handleNewAddressChange = (changedAddress: AddressFormFields) => {
    const curAddress = newAddressState

    const newAddress = { ...curAddress, ...changedAddress }

    setNewAddressState(newAddress)
  }

  const handleAddNewAddress = () => {
    const uid = setGUID(newAddressState)

    const duplicated = data?.getCostCenterById?.addresses?.find(
      (item: any) => item.addressId === uid
    )

    setLoadingState(true)

    let isDuplicatedError = false

    if (duplicated !== undefined) {
      isDuplicatedError =
        duplicated.postalCode === newAddressState.postalCode.value
    }

    if (!isDuplicatedError) {
      const newAddress = {
        addressId: uid,
        addressType: newAddressState.addressType.value,
        city: newAddressState.city.value,
        complement: newAddressState.complement.value,
        country: newAddressState.country.value,
        receiverName: newAddressState.receiverName.value,
        geoCoordinates: newAddressState.geoCoordinates.value,
        neighborhood: newAddressState.neighborhood.value,
        number: newAddressState.number.value,
        postalCode: newAddressState.postalCode.value,
        reference: newAddressState.reference.value,
        state: newAddressState.state.value,
        street: newAddressState.street.value,
        addressQuery: newAddressState.addressQuery.value,
        checked: false,
      }

      const newAddresses = [...addresses, newAddress]

      const variables = {
        id: params.id,
        input: {
          addresses: newAddresses
            .sort(item => (item.checked ? -1 : 1))
            .map(item => {
              return {
                ...item,
                checked: undefined,
              }
            }),
        },
      }

      updateCostCenter({ variables })
        .then(() => {
          showToast({
            variant: 'positive',
            message: formatMessage(messages.toastUpdateSuccess),
          })
          refetch()
          handleSetAddresses(newAddresses)
          setLoadingState(false)
          handleCloseModals()
        })
        .catch(error => {
          console.error(error)
          showToast({
            variant: 'critical',
            message: formatMessage(messages.toastUpdateFailure),
          })
          setLoadingState(false)
        })

      setAddresses(
        newAddresses.map(item => {
          if (newAddressState.checked) {
            item.checked = item === newAddress
          }

          return item
        })
      )
    } else {
      showToast({
        variant: 'critical',
        message: formatMessage(messages.duplicateAddress),
      })
    }
  }

  const handleEditAddressChange = (changedAddress: AddressFormFields) => {
    const curAddress = editAddressState

    const newAddress = { ...curAddress, ...changedAddress }

    setEditAddressState(newAddress)
  }

  const handleEditAddress = () => {
    const { addressId } = editAddressModalState
    const addressArray = addresses

    const addressIndex = addresses.findIndex(
      address => address.addressId === addressId
    )

    addressArray[addressIndex] = {
      addressId: editAddressState.addressId.value,
      addressType: editAddressState.addressType.value,
      city: editAddressState.city.value,
      complement: editAddressState.complement.value,
      country: editAddressState.country.value,
      receiverName: editAddressState.receiverName.value,
      geoCoordinates: editAddressState.geoCoordinates.value,
      neighborhood: editAddressState.neighborhood.value,
      number: editAddressState.number.value,
      postalCode: editAddressState.postalCode.value,
      reference: editAddressState.reference.value,
      state: editAddressState.state.value,
      street: editAddressState.street.value,
      addressQuery: editAddressState.addressQuery.value,
    }

    setLoadingState(true)

    const variables = {
      id: params.id,
      input: {
        addresses: addressArray
          .sort(item => (item.checked ? -1 : 1))
          .map(item => {
            return {
              ...item,
              checked: undefined,
            }
          }),
      },
    }

    updateCostCenter({ variables })
      .then(() => {
        showToast({
          variant: 'positive',
          message: formatMessage(messages.toastUpdateSuccess),
        })
        refetch()
        handleSetAddresses(addressArray)
        setLoadingState(false)
        handleCloseModals()
      })
      .catch(error => {
        console.error(error)
        showToast({
          variant: 'critical',
          message: formatMessage(messages.toastUpdateFailure),
        })
        setLoadingState(false)
      })
  }

  const handleDeleteAddress = () => {
    const { addressId } = deleteAddressModalState
    const addressArray = addresses

    const addressIndex = addresses.findIndex(
      address => address.addressId === addressId
    )

    addresses.splice(addressIndex, 1)

    setLoadingState(true)

    const variables = {
      id: params.id,
      input: {
        addresses: addresses.map(item => {
          return {
            ...item,
            checked: undefined,
          }
        }),
      },
    }

    updateCostCenter({ variables })
      .then(() => {
        showToast({
          variant: 'positive',
          message: formatMessage(messages.toastUpdateSuccess),
        })
        refetch()
        handleSetAddresses(addressArray)
        setLoadingState(false)
        handleCloseModals()
      })
      .catch(error => {
        console.error(error)
        showToast({
          variant: 'critical',
          message: formatMessage(messages.toastUpdateFailure),
        })
        setLoadingState(false)
      })
  }

  const handleMarketingTags = (tagValue: string) => {
    setTags([...tags, tagValue])
    setTagName('')
  }

  const removeMarketingTag = (tagValue: string) => {
    setTags(tags.filter(_tag => _tag !== tagValue))
  }

  const options = (addressId: string) => [
    {
      label: formatMessage(messages.addressEdit),
      onClick: () => handleEditAddressModal(addressId),
    },
    {
      label: formatMessage(messages.addressDelete),
      onClick: () => handleDeleteAddressModal(addressId),
    },
  ]

  // CostCenter custom fields

  useEffect(() => {
    const customFieldsToShow = joinById(
      data?.getCostCenterById?.customFields || [],
      defaultCustomFieldsData?.getB2BSettings.costCenterCustomFields || []
    )

    setCustomFieldsState(customFieldsToShow)
  }, [
    data?.getCostCenterById?.customFields &&
      defaultCustomFieldsData?.getB2BSettings.costCenterCustomFields,
  ])

  const handleCustomFieldsUpdate = (
    index: number,
    customField: CustomField
  ) => {
    const newCustomFields = [...customFieldsState]

    newCustomFields[index] = customField
    setCustomFieldsState(newCustomFields)
  }

  if (!data) {
    return (
      <Layout
        fullWidth
        pageHeader={
          <PageHeader
            title={formatMessage(messages.pageTitle)}
            linkLabel={formatMessage(messages.back)}
            onLinkClick={() => {
              navigate({
                page: 'admin.app.b2b-organizations.organizations',
              })
            }}
          />
        }
      >
        <PageBlock>
          {loading ? (
            <Spinner />
          ) : (
            <FormattedMessage id="admin/b2b-organizations.costCenter-details.empty-state" />
          )}
        </PageBlock>
      </Layout>
    )
  }

  return (
    <Layout
      fullWidth
      pageHeader={
        <PageHeader
          title={formatMessage(messages.pageTitle)}
          linkLabel={
            organizationData?.getOrganizationById?.name ??
            formatMessage(messages.back)
          }
          onLinkClick={() => {
            navigateToParentOrganization()
          }}
        >
          <span className="mr4">
            <Button
              variation="primary"
              isLoading={loadingState}
              disabled={
                !costCenterName ||
                !addresses.length ||
                (phoneNumber && !validatePhoneNumber(phoneNumber))
              }
              onClick={() => handleUpdateCostCenter()}
            >
              <FormattedMessage id="admin/b2b-organizations.costCenter-details.button.save" />
            </Button>
          </span>
          <Button
            variation="danger"
            isLoading={loadingState}
            onClick={() => handleDeleteCostCenterModal()}
          >
            <FormattedMessage id="admin/b2b-organizations.costCenter-details.button.delete" />
          </Button>
        </PageHeader>
      }
    >
      <PageBlock>
        <Input
          autocomplete="off"
          size="large"
          label={formatMessage(messages.costCenterName)}
          value={costCenterName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setCostCenterName(e.target.value)
          }}
          required
        />
        <div className="mt6">
          <Input
            autocomplete="off"
            size="large"
            label={formatMessage(messages.phoneNumber)}
            helpText={formatMessage(messages.phoneNumberHelp)}
            error={phoneNumber && !validatePhoneNumber(phoneNumber)}
            value={phoneNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPhoneNumber(e.target.value)
            }}
          />
        </div>
        <div className={`${handles.businessDocument} mt6`}>
          <Input
            autocomplete="off"
            size="large"
            label={formatMessage(messages.businessDocument)}
            helpText={formatMessage(messages.businessDocumentHelp)}
            value={businessDocument}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setBusinessDocument(e.target.value)
            }}
          />
        </div>
        <div className={`${handles.stateRegistration} mt6`}>
          <Input
            autocomplete="off"
            size="large"
            label={formatMessage(messages.stateRegistration)}
            helpText={formatMessage(messages.stateRegistrationHelp)}
            value={stateRegistration}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setStateRegistration(e.target.value)
            }}
          />
        </div>
        <div className="w-100 mv6">
          <div className="flex items-end">
            <div className="col4">
              <Input
                autocomplete="off"
                size="large"
                label={formatMessage(messages.marketingTags)}
                value={tagName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setTagName(e.target.value)
                }}
              />
            </div>
            <span className="ml5">
              <Button
                variation="primary"
                onClick={() => handleMarketingTags(tagName)}
                disabled={!tagName || tagName.length === 0}
              >
                {formatMessage(messages.add)}
              </Button>
            </span>
          </div>
          <div className="flex mt5">
            {tags?.map((tag: string) => (
              <div className="ma3">
                <Tag onClick={() => removeMarketingTag(tag)}>{tag}</Tag>
              </div>
            ))}
          </div>
        </div>
      </PageBlock>
      <PageBlock title={formatMessage(messages.addresses)}>
        <div className="flex">
          {addresses.map((address: any, index) => {
            return (
              <div key={index} className="w-25 ma3">
                <Card>
                  <div className="flex justify-between">
                    <div>
                      <AddressRules
                        shouldUseIOFetching
                        country={address.country}
                        useGeolocation={false}
                      >
                        <AddressSummary canEditData={false} address={address} />
                      </AddressRules>
                      <div className="mt5">
                        <Toggle
                          label={formatMessage(messages.defaultAddress)}
                          semantic
                          onChange={() => handleCheckDefault(address)}
                          checked={address.checked}
                          disabled={loadingState}
                        />
                      </div>
                    </div>
                    <div>
                      <ActionMenu
                        buttonProps={{
                          variation: 'tertiary',
                          icon: <IconOptionsDots color="currentColor" />,
                        }}
                        options={options(address.addressId)}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
          <div className="w-25 ma3">
            <Card>
              <div className="flex justify-center">
                <Button
                  variation="primary"
                  onClick={() => handleNewAddressModal()}
                >
                  <FormattedMessage id="admin/b2b-organizations.costCenter-details.address.new" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageBlock>

      <PageBlock title={formatMessage(orgaizationMessages.customFieldsTitle)}>
        {customFieldsState?.map((customField: CustomField, index: number) => (
          <CustomFieldInput
            key={`${customField.name}`}
            customField={customField}
            index={index}
            handleUpdate={handleCustomFieldsUpdate}
          />
        ))}
      </PageBlock>

      {/* New Address Modal */}
      <Modal
        centered
        bottomBar={
          <div className="nowrap">
            <span className="mr4">
              <Button
                variation="tertiary"
                onClick={() => handleCloseModals()}
                disabled={loadingState}
              >
                {formatMessage(messages.cancel)}
              </Button>
            </span>
            <span>
              <Button
                variation="primary"
                onClick={() => handleAddNewAddress()}
                isLoading={loadingState}
                disabled={
                  (phoneNumber && !validatePhoneNumber(phoneNumber)) ||
                  !isValidAddress(newAddressState)
                }
              >
                {formatMessage(messages.add)}
              </Button>
            </span>
          </div>
        }
        isOpen={newAddressModalState.isOpen}
        onClose={() => handleCloseModals()}
        closeOnOverlayClick={false}
      >
        <AddressRules
          country={newAddressState?.country?.value}
          shouldUseIOFetching
          useGeolocation={false}
        >
          <AddressContainer
            address={newAddressState}
            Input={StyleguideInput}
            onChangeAddress={handleNewAddressChange}
            autoCompletePostalCode
          >
            <CountrySelector shipsTo={translateCountries()} />

            <PostalCodeGetter />

            <AddressForm
              Input={StyleguideInput}
              omitAutoCompletedFields={false}
              omitPostalCodeFields
            />
            <div className="mb6">
              <Toggle
                checked={newAddressState.checked}
                onChange={() =>
                  setNewAddressState((prevState: AddressFormFields) => ({
                    ...newAddressState,
                    checked: !prevState.checked,
                  }))
                }
                label={formatMessage(messages.defaultAddress)}
              />
            </div>
          </AddressContainer>
        </AddressRules>
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        centered
        bottomBar={
          <div className="nowrap">
            <span className="mr4">
              <Button
                variation="tertiary"
                onClick={() => handleCloseModals()}
                disabled={loadingState}
              >
                {formatMessage(messages.cancel)}
              </Button>
            </span>
            <span>
              <Button
                variation="primary"
                onClick={() => handleEditAddress()}
                isLoading={loadingState}
                disabled={!isValidAddress(editAddressState)}
              >
                {formatMessage(messages.update)}
              </Button>
            </span>
          </div>
        }
        isOpen={editAddressModalState.isOpen}
        onClose={() => handleCloseModals()}
        closeOnOverlayClick={false}
      >
        <AddressRules
          country={editAddressState?.country?.value}
          shouldUseIOFetching
          useGeolocation={false}
        >
          <AddressContainer
            address={editAddressState}
            Input={StyleguideInput}
            onChangeAddress={handleEditAddressChange}
            autoCompletePostalCode
          >
            <CountrySelector shipsTo={translateCountries()} />

            <PostalCodeGetter />

            <AddressForm
              Input={StyleguideInput}
              omitAutoCompletedFields={false}
              omitPostalCodeFields
            />
          </AddressContainer>
        </AddressRules>
      </Modal>

      {/* Delete Address Modal */}
      <ModalDialog
        centered
        confirmation={{
          onClick: () => handleDeleteAddress(),
          label: formatMessage(messages.deleteConfirm),
        }}
        cancelation={{
          onClick: () => handleCloseModals(),
          label: formatMessage(messages.cancel),
        }}
        loading={loadingState}
        isOpen={deleteAddressModalState.isOpen}
        onClose={() => handleCloseModals()}
        closeOnOverlayClick={false}
      >
        <p>
          <FormattedMessage id="admin/b2b-organizations.costCenter-details.delete-address-confirmation" />
        </p>
      </ModalDialog>

      {/* Delete Cost Center Modal */}
      <ModalDialog
        centered
        confirmation={{
          onClick: () => handleDeleteCostCenter(),
          label: formatMessage(messages.deleteConfirm),
        }}
        cancelation={{
          onClick: () => handleCloseModals(),
          label: formatMessage(messages.cancel),
        }}
        loading={loadingState}
        isOpen={deleteCostCenterModalState.isOpen}
        onClose={() => handleCloseModals()}
        closeOnOverlayClick={false}
      >
        <p>
          <FormattedMessage id="admin/b2b-organizations.costCenter-details.delete-costCenter-confirmation" />
        </p>
      </ModalDialog>
    </Layout>
  )
}

export default CostCenterDetails
