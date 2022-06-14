/* eslint-disable no-console */
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
} from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'
import { useIntl, FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
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

import { costCenterMessages as messages } from './utils/messages'
import { setGUID, getEmptyAddress, isValidAddress } from '../utils/addresses'
import GET_COST_CENTER from '../graphql/getCostCenter.graphql'
import GET_ORGANIZATION from '../graphql/getOrganization.graphql'
import UPDATE_COST_CENTER from '../graphql/updateCostCenter.graphql'
import DELETE_COST_CENTER from '../graphql/deleteCostCenter.graphql'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'

const CostCenterDetails: FunctionComponent = () => {
  const { formatMessage } = useIntl()

  const {
    culture: { country },
    route: { params },
    navigate,
  } = useRuntime()

  const showToast = useToast()

  const [loadingState, setLoadingState] = useState(false)
  const [costCenterName, setCostCenterName] = useState('')
  const [businessDocument, setBusinessDocument] = useState('')
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

  const { data, loading, refetch } = useQuery(GET_COST_CENTER, {
    variables: { id: params?.id },
    skip: !params?.id,
    ssr: false,
    fetchPolicy: 'network-only',
  })

  const [getOrganization, { data: organizationData }] = useLazyQuery(
    GET_ORGANIZATION
  )

  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })

  const [updateCostCenter] = useMutation(UPDATE_COST_CENTER)
  const [deleteCostCenter] = useMutation(DELETE_COST_CENTER)

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

    getOrganization({
      variables: { id: data.getCostCenterById.organization },
    })
  }, [data])

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
        businessDocument,
      },
    }

    updateCostCenter({ variables })
      .then(() => {
        showToast({
          type: 'success',
          message: formatMessage(messages.toastUpdateSuccess),
        })
        refetch()
        handleSetAddresses(_addresses)
        setLoadingState(false)
      })
      .catch(error => {
        console.error(error)
        showToast({
          type: 'error',
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
        navigate({
          page: 'admin.app.b2b-organizations.organization-details',
          params: { id: data.getCostCenterById.organization },
        })
      })
      .catch(error => {
        console.error(error)
        showToast({
          type: 'error',
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

      setAddresses(
        newAddresses.map(item => {
          if (newAddressState.checked) {
            item.checked = item === newAddress
          }

          return item
        })
      )

      setAddresses([...addresses, newAddress])
      handleCloseModals()
    } else {
      showToast({
        type: 'error',
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

    setAddresses(addressArray)
    handleCloseModals()
  }

  const handleDeleteAddress = () => {
    const { addressId } = deleteAddressModalState
    const addressArray = addresses

    const addressIndex = addresses.findIndex(
      address => address.addressId === addressId
    )

    addresses.splice(addressIndex, 1)
    setAddresses(addressArray)
    handleCloseModals()
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
            navigate({
              page: 'admin.app.b2b-organizations.organization-details',
              params: { id: data.getCostCenterById.organization },
            })
          }}
        >
          <span className="mr4">
            <Button
              variation="primary"
              isLoading={loadingState}
              disabled={!costCenterName || !addresses.length}
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
      </PageBlock>
      <PageBlock>
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
                disabled={!isValidAddress(newAddressState)}
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
