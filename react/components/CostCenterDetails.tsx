import type { FunctionComponent } from 'react'
import React, { useEffect, useState, useContext, useCallback } from 'react'
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
  Toggle,
  ToastContext,
} from 'vtex.styleguide'
import { useIntl, FormattedMessage } from 'react-intl'
import { AddressRules, AddressSummary } from 'vtex.address-form'
import { useCssHandles } from 'vtex.css-handles'

import { costCenterMessages as messages } from './utils/messages'
import storageFactory from '../utils/storage'
import { setGUID } from '../utils/addresses'
import { validatePhoneNumber } from '../modules/formValidators'
import { useSessionResponse } from '../modules/session'
import NewAddressModal from './NewAddressModal'
import EditAddressModal from './EditAddressModal'
import DeleteAddressModal from './DeleteAddressModal'
import DeleteCostCenterModal from './DeleteCostCenterModal'
import GET_COST_CENTER from '../graphql/getCostCenterStorefront.graphql'
import GET_ORGANIZATION from '../graphql/getOrganizationStorefront.graphql'
import UPDATE_COST_CENTER from '../graphql/updateCostCenter.graphql'
import DELETE_COST_CENTER from '../graphql/deleteCostCenter.graphql'
import GET_PERMISSIONS from '../graphql/getPermissions.graphql'
import GET_B2B_SETTINGS from '../graphql/getB2BSettings.graphql'

interface RouterProps {
  match: Match
  history: any
}

interface Match {
  isExact: boolean
  params: any
  path: string
  url: string
}

interface PaymentTerm {
  id: string
  name: string
}

const CSS_HANDLES = ['businessDocument', 'stateRegistration'] as const

const localStore = storageFactory(() => localStorage)
let isAuthenticated =
  JSON.parse(String(localStore.getItem('b2b-organizations_isAuthenticated'))) ??
  false

const CostCenterDetails: FunctionComponent<RouterProps> = ({
  match: { params },
  history,
}) => {
  const { formatMessage } = useIntl()

  const sessionResponse: any = useSessionResponse()

  if (sessionResponse) {
    isAuthenticated =
      sessionResponse?.namespaces?.profile?.isAuthenticated?.value === 'true'

    localStore.setItem(
      'b2b-organizations_isAuthenticated',
      JSON.stringify(isAuthenticated)
    )
  }

  const handles = useCssHandles(CSS_HANDLES)
  const { showToast } = useContext(ToastContext)

  const toastMessage = (message: MessageDescriptor) => {
    const translatedMessage = formatMessage(message)

    const action = undefined

    showToast({ message: translatedMessage, duration: 5000, action })
  }

  const [permissionsState, setPermissionsState] = useState([] as string[])
  const [loadingState, setLoadingState] = useState(false)
  const [costCenterName, setCostCenterName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [businessDocument, setBusinessDocument] = useState('')
  const [stateRegistration, setStateRegistration] = useState('')
  const [addresses, setAddresses] = useState([] as Address[])
  const [paymentTerms, setPaymentTerms] = useState([] as PaymentTerm[])
  const [paymentTermOptions, setPaymentTermOptions] = useState(
    [] as PaymentTerm[]
  )

  const [settings, setSettings] = useState({
    businessReadOnly: false,
    stateReadOnly: false,
  })

  const [newAddressModalState, setNewAddressModalState] = useState({
    isOpen: false,
  })

  const [editAddressModalState, setEditAddressModalState] = useState({
    addressId: '',
    editAddress: null as Address | null,
    isOpen: false,
  })

  const [deleteAddressModalState, setDeleteAddressModalState] = useState({
    addressId: '',
    isOpen: false,
  })

  const [deleteCostCenterModalState, setDeleteCostCenterModalState] = useState({
    isOpen: false,
  })

  const { data, loading, refetch } = useQuery(GET_COST_CENTER, {
    variables: { id: params?.id },
    skip: !params?.id,
    ssr: false,
  })

  const [getOrganization, { data: organizationData }] = useLazyQuery(
    GET_ORGANIZATION
  )

  const { data: dataSettings } = useQuery(GET_B2B_SETTINGS, { ssr: false })

  const { data: permissionsData } = useQuery(GET_PERMISSIONS, { ssr: false })

  const [deleteCostCenter] = useMutation(DELETE_COST_CENTER)

  const [updateCostCenter] = useMutation(UPDATE_COST_CENTER)

  const handleSetAddresses = (_addresses: Address[]) => {
    setAddresses(
      _addresses.map((item, index) => {
        item.checked = index === 0

        return item
      })
    )
  }

  useEffect(() => {
    if (!data?.getCostCenterByIdStorefront) return
    const {
      organization: fetchedOrganization,
      name: fetchedName,
      addresses: fetchedAddresses,
      paymentTerms: fetchedPaymentTerms,
      phoneNumber: fetchedPhoneNumber = '',
      businessDocument: fetchedBusinessDocument = '',
      stateRegistration: fetchedStateRegistration = '',
    } = data.getCostCenterByIdStorefront

    setCostCenterName(fetchedName)
    handleSetAddresses(fetchedAddresses)
    setPaymentTerms(fetchedPaymentTerms ?? [])

    if (fetchedPhoneNumber) {
      setPhoneNumber(fetchedPhoneNumber)
    }

    if (fetchedBusinessDocument) {
      setBusinessDocument(fetchedBusinessDocument)
    }

    if (fetchedStateRegistration) {
      setStateRegistration(fetchedStateRegistration)
    }

    getOrganization({
      variables: { id: fetchedOrganization },
    })
  }, [data])

  useEffect(() => {
    if (!organizationData?.getOrganizationByIdStorefront) return

    const {
      paymentTerms: fetchedPaymentTermOptions,
    } = organizationData.getOrganizationByIdStorefront

    setPaymentTermOptions(fetchedPaymentTermOptions ?? [])

    // enable all available payment terms by default
    if (paymentTerms && !paymentTerms.length) {
      setPaymentTerms(fetchedPaymentTermOptions ?? [])
    }
  }, [organizationData])

  useEffect(() => {
    if (!permissionsData) return

    const { permissions = [] } = permissionsData.checkUserPermission ?? {}

    if (permissions?.length) {
      setPermissionsState(permissions)
    }
  }, [permissionsData])

  useEffect(() => {
    if (!dataSettings) {
      return
    }

    const { getB2BSettings } = dataSettings

    setSettings({
      businessReadOnly: getB2BSettings?.businessReadOnly,
      stateReadOnly: getB2BSettings?.stateReadOnly,
    })
  }, [dataSettings])

  const handleUpdateCostCenter = () => {
    setLoadingState(true)
    const _addresses = [...addresses]

    _addresses.sort(item => (item.checked ? -1 : 1))
    const variables = {
      id: params.id,
      input: {
        name: costCenterName,
        addresses: _addresses.map(item => {
          return {
            ...item,
            checked: undefined,
          }
        }),
        paymentTerms,
        phoneNumber,
        businessDocument,
        stateRegistration,
      },
    }

    updateCostCenter({ variables })
      .then(() => {
        toastMessage(messages.toastUpdateSuccess)
        refetch()
        handleSetAddresses(_addresses)
        setLoadingState(false)
      })
      .catch(error => {
        console.error(error)
        toastMessage(messages.toastUpdateFailure)
        setLoadingState(false)
      })
  }

  const handleDeleteCostCenter = () => {
    setLoadingState(true)
    deleteCostCenter({ variables: { id: params?.id } })
      .then(() => {
        history.push(
          `/organization/${data.getCostCenterByIdStorefront.organization}`
        )
      })
      .catch(error => {
        console.error(error)
        toastMessage(messages.toastDeleteFailure)
        setLoadingState(false)
      })
  }

  const handleCloseModals = () => {
    setDeleteAddressModalState({ addressId: '', isOpen: false })
    setEditAddressModalState({
      addressId: '',
      editAddress: null,
      isOpen: false,
    })
    setNewAddressModalState({ isOpen: false })
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
    setEditAddressModalState({ addressId, editAddress, isOpen: true })
  }

  const handleDeleteAddressModal = (addressId: string) => {
    setDeleteAddressModalState({ addressId, isOpen: true })
  }

  const handleDeleteCostCenterModal = () => {
    setDeleteCostCenterModalState({ isOpen: true })
  }

  const handleAddNewAddress = useCallback(
    (address: AddressFormFields) => {
      const uid = setGUID(address)

      const duplicated = data?.getCostCenterByIdStorefront?.addresses?.find(
        ({ addressId }: { addressId: string }) => addressId === uid
      )

      let isDuplicatedError = false

      if (duplicated !== undefined) {
        isDuplicatedError = duplicated.postalCode === address.postalCode.value
      }

      if (!isDuplicatedError) {
        const newAddress = {
          addressId: uid,
          addressType: address.addressType.value,
          city: address.city.value,
          complement: address.complement.value,
          country: address.country.value,
          receiverName: address.receiverName.value,
          geoCoordinates: address.geoCoordinates.value,
          neighborhood: address.neighborhood.value,
          number: address.number.value,
          postalCode: address.postalCode.value,
          reference: address.reference.value,
          state: address.state.value,
          street: address.street.value,
          addressQuery: address.addressQuery.value,
        } as Address

        const newAddresses = [...addresses, newAddress]

        const variables = {
          id: params.id,
          input: {
            addresses: newAddresses.map(item => {
              return {
                ...item,
                checked: undefined,
              }
            }),
          },
        }

        setLoadingState(true)

        updateCostCenter({
          variables,
        })
          .then(() => {
            toastMessage(messages.toastUpdateSuccess)
            refetch()

            setLoadingState(false)
            handleCloseModals()

            setAddresses(
              newAddresses.map(item => {
                if (address.checked) {
                  item.checked = item === newAddress
                }

                return item
              })
            )
          })
          .catch(error => {
            console.error(error)
            toastMessage(messages.toastUpdateFailure)
            setLoadingState(false)
          })
      } else {
        showToast({
          variant: 'critical',
          message: formatMessage(messages.duplicateAddress),
        })
      }
    },
    [addresses]
  )

  const handleCheckDefault = (address: Address) => {
    setAddresses(
      addresses.map(item => {
        item.checked = item === address

        return item
      })
    )
  }

  const handleEditAddress = (modifiedAddress: AddressFormFields) => {
    const { addressId } = editAddressModalState
    const addressArray = addresses

    const addressIndex = addresses.findIndex(
      address => address.addressId === addressId
    )

    addressArray[addressIndex] = {
      addressId: modifiedAddress.addressId.value,
      addressType: modifiedAddress.addressType.value,
      city: modifiedAddress.city.value,
      complement: modifiedAddress.complement.value,
      country: modifiedAddress.country.value,
      receiverName: modifiedAddress.receiverName.value,
      geoCoordinates: modifiedAddress.geoCoordinates.value,
      neighborhood: modifiedAddress.neighborhood.value,
      number: modifiedAddress.number.value,
      postalCode: modifiedAddress.postalCode.value,
      reference: modifiedAddress.reference.value,
      state: modifiedAddress.state.value,
      street: modifiedAddress.street.value,
      addressQuery: modifiedAddress.addressQuery.value,
    } as Address

    const variables = {
      id: params.id,
      input: {
        addresses: addressArray.map(item => {
          return {
            ...item,
            checked: undefined,
          }
        }),
      },
    }

    setLoadingState(true)

    updateCostCenter({
      variables,
    })
      .then(() => {
        toastMessage(messages.toastUpdateSuccess)
        refetch()

        setLoadingState(false)

        setAddresses(addressArray)
        handleCloseModals()
      })
      .catch(error => {
        console.error(error)
        toastMessage(messages.toastUpdateFailure)
        setLoadingState(false)
      })
  }

  const handleDeleteAddress = useCallback(() => {
    const { addressId } = deleteAddressModalState
    const addressArray = addresses

    const addressIndex = addresses.findIndex(
      address => address.addressId === addressId
    )

    addresses.splice(addressIndex, 1)

    const variables = {
      id: params.id,
      input: {
        addresses: addressArray.map(item => {
          return {
            ...item,
            checked: undefined,
          }
        }),
      },
    }

    setLoadingState(true)

    updateCostCenter({
      variables,
    })
      .then(() => {
        toastMessage(messages.toastUpdateSuccess)
        refetch()

        setLoadingState(false)

        setAddresses(addressArray)
        handleCloseModals()
      })
      .catch(error => {
        console.error(error)
        toastMessage(messages.toastUpdateFailure)
        setLoadingState(false)
      })
  }, [addresses])

  const handleTogglePaymentTerm = (id: string) => {
    let newTerms = paymentTerms
    const termOption = paymentTermOptions.find(term => term.id === id)

    if (!termOption) return
    const enabled = paymentTerms.find(term => term.id === id)

    if (enabled) {
      newTerms = paymentTerms.filter(term => term.id !== enabled.id)
    } else {
      newTerms.push(termOption)
    }

    // spread operator is used here so that react can see that the array has changed
    setPaymentTerms([...newTerms])
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

  if (!isAuthenticated) {
    return (
      <Layout
        fullWidth
        pageHeader={
          <PageHeader
            title={formatMessage(messages.pageTitle)}
            linkLabel={formatMessage(messages.back)}
            onLinkClick={() => {
              history.push(`/organization`)
            }}
          />
        }
      >
        <PageBlock>
          <FormattedMessage id="store/b2b-organizations.not-authenticated" />
        </PageBlock>
      </Layout>
    )
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
              history.push(`/organization`)
            }}
          />
        }
      >
        <PageBlock>
          {loading ? (
            <Spinner />
          ) : (
            <FormattedMessage id="store/b2b-organizations.costCenter-details.empty-state" />
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
            organizationData?.getOrganizationByIdStorefront?.name ??
            formatMessage(messages.back)
          }
          onLinkClick={() => {
            history.push(
              `/organization/${data.getCostCenterByIdStorefront.organization}`
            )
          }}
        >
          <span className="mr4">
            <Button
              variation="primary"
              isLoading={loadingState}
              disabled={
                !costCenterName ||
                !addresses.length ||
                (paymentTermOptions.length > 0 && paymentTerms.length === 0) ||
                (phoneNumber && !validatePhoneNumber(phoneNumber)) ||
                !permissionsState.includes('create-cost-center-organization')
              }
              onClick={() => handleUpdateCostCenter()}
            >
              <FormattedMessage id="store/b2b-organizations.costCenter-details.button.save" />
            </Button>
          </span>
          <Button
            variation="danger"
            onClick={() => handleDeleteCostCenterModal()}
            disabled={
              !permissionsState.includes('create-cost-center-organization') ||
              loadingState
            }
          >
            <FormattedMessage id="store/b2b-organizations.costCenter-details.button.delete" />
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
          readOnly={
            !permissionsState.includes('create-cost-center-organization')
          }
          required
        />
        <div className="mt6">
          <Input
            autocomplete="off"
            size="large"
            label={formatMessage(messages.phoneNumber)}
            value={phoneNumber}
            helpText={formatMessage(messages.phoneNumberHelp)}
            error={phoneNumber && !validatePhoneNumber(phoneNumber)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPhoneNumber(e.target.value)
            }}
            readOnly={
              !permissionsState.includes('create-cost-center-organization')
            }
          />
        </div>
        <div className={`${handles.businessDocument} mt6`}>
          <Input
            autocomplete="off"
            size="large"
            label={formatMessage(messages.businessDocument)}
            value={businessDocument}
            helpText={formatMessage(messages.businessDocumentHelp)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setBusinessDocument(e.target.value)
            }}
            readOnly={
              !permissionsState.includes('create-cost-center-organization') ||
              settings.businessReadOnly
            }
          />
        </div>
        <div className={`${handles.stateRegistration} mt6`}>
          <Input
            autocomplete="off"
            size="large"
            label={formatMessage(messages.stateRegistration)}
            value={stateRegistration}
            helpText={formatMessage(messages.stateRegistrationHelp)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setStateRegistration(e.target.value)
            }}
            readOnly={
              !permissionsState.includes('create-cost-center-organization') ||
              settings.stateReadOnly
            }
          />
        </div>
      </PageBlock>
      {paymentTermOptions.length > 0 && (
        <PageBlock
          title={formatMessage(messages.paymentTerms)}
          subtitle={formatMessage(messages.paymentTermsSubtitle)}
        >
          {paymentTermOptions.map((option, index) => {
            return (
              <div key={index} className="mv4">
                <Toggle
                  label={option.name}
                  semantic
                  checked={paymentTerms.some(term => term.id === option.id)}
                  onChange={() => handleTogglePaymentTerm(option.id)}
                  disabled={
                    !permissionsState.includes(
                      'create-cost-center-organization'
                    )
                  }
                />
              </div>
            )
          })}
        </PageBlock>
      )}
      <PageBlock
        title={formatMessage(messages.addresses)}
        subtitle={formatMessage(messages.addressesSubtitle)}
      >
        <div className="flex">
          {addresses.map((address: Address, index) => {
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
                          disabled={
                            !permissionsState.includes(
                              'create-cost-center-organization'
                            ) || loadingState
                          }
                        />
                      </div>
                    </div>
                    <div>
                      {permissionsState.includes(
                        'create-cost-center-organization'
                      ) && (
                        <ActionMenu
                          buttonProps={{
                            variation: 'tertiary',
                            icon: <IconOptionsDots color="currentColor" />,
                          }}
                          options={options(address.addressId)}
                        />
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
          {permissionsState.includes('create-cost-center-organization') && (
            <div className="w-25 ma3">
              <Card>
                <div className="flex justify-center">
                  <Button
                    variation="primary"
                    onClick={() => handleNewAddressModal()}
                  >
                    <FormattedMessage id="store/b2b-organizations.costCenter-details.address.new" />
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </PageBlock>

      <NewAddressModal
        isOpen={newAddressModalState.isOpen}
        loading={loadingState}
        handleAddNewAddress={handleAddNewAddress}
        handleCloseModals={handleCloseModals}
      />

      <EditAddressModal
        isOpen={editAddressModalState.isOpen}
        loading={loadingState}
        address={editAddressModalState.editAddress}
        handleEditAddress={handleEditAddress}
        handleCloseModals={handleCloseModals}
      />

      <DeleteAddressModal
        isOpen={deleteAddressModalState.isOpen}
        loading={loadingState}
        handleDeleteAddress={handleDeleteAddress}
        handleCloseModals={handleCloseModals}
      />

      <DeleteCostCenterModal
        isOpen={deleteCostCenterModalState.isOpen}
        loading={loadingState}
        handleDeleteCostCenter={handleDeleteCostCenter}
        handleCloseModals={handleCloseModals}
      />
    </Layout>
  )
}

export default CostCenterDetails
