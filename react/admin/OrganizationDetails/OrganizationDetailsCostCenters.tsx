import type { ChangeEvent } from 'react'
import React, { Fragment, useState, useEffect } from 'react'
import {
  Button,
  Input,
  Modal,
  PageBlock,
  Table,
  Spinner,
} from 'vtex.styleguide'
import { FormattedMessage, useIntl } from 'react-intl'
import { useMutation, useQuery } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'
import { addValidation } from 'vtex.address-form/helpers'
import {
  AddressContainer,
  AddressForm,
  AddressRules,
  CountrySelector,
  PostalCodeGetter,
} from 'vtex.address-form'
import { StyleguideInput } from 'vtex.address-form/inputs'
import type { ToastProps } from '@vtex/admin-ui'

import GET_COST_CENTERS from '../../graphql/getCostCentersByOrganizationId.graphql'
import type { CellRendererProps } from '../OrganizationDetails'
import { organizationMessages as messages } from '../utils/messages'
import { getEmptyAddress, isValidAddress } from '../../utils/addresses'
import CREATE_COST_CENTER from '../../graphql/createCostCenter.graphql'
import GET_LOGISTICS from '../../graphql/getLogistics.graphql'
import { validatePhoneNumber } from '../../modules/formValidators'
import GET_B2B_CUSTOM_FIELDS from '../../graphql/getB2BCustomFields.graphql'
import CustomFieldInput from '../OrganizationDetailsCustomField'

interface CostCenterSimple {
  id: string
  name: string
  addresses: Address[]
}

const OrganizationDetailsCostCenters = ({
  setLoadingState,
  showToast,
  loadingState,
}: {
  setLoadingState: (state: boolean) => void
  showToast: (toast: ToastProps) => void
  loadingState: boolean
}) => {
  /**
   * Hooks
   */
  const {
    culture: { country },
    route: { params },
    navigate,
  } = useRuntime()

  const { formatMessage } = useIntl()

  /**
   * States
   */
  const [costCenterPaginationState, setCostCenterPaginationState] = useState({
    page: 1,
    pageSize: 25,
  })

  const [newCostCenterModalState, setNewCostCenterModalState] = useState(false)
  const [newCostCenterName, setNewCostCenterName] = useState('')
  const [newCostCenterPhoneNumber, setNewCostCenterPhoneNumber] = useState('')
  const [
    newCostCenterBusinessDocument,
    setNewCostCenterBusinessDocument,
  ] = useState('')

  const [
    newCostCenterStateRegistration,
    setNewCostCenterStateRegistration,
  ] = useState('')

  const [newCostCenterAddressState, setNewCostCenterAddressState] = useState(
    addValidation(getEmptyAddress(country))
  )

  /**
   * Mutations
   */
  const [createCostCenter] = useMutation(CREATE_COST_CENTER)
  const {
    data: costCentersData,
    refetch: refetchCostCenters,
    loading,
  } = useQuery(GET_COST_CENTERS, {
    variables: { ...costCenterPaginationState, id: params?.id },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    skip: !params?.id,
    ssr: false,
  })

  //! CUSTOM FIELDS
  const {
    data: defaultCustomFieldsData,
    loading: defaultCustomFieldsDataLoading,
  } = useQuery(GET_B2B_CUSTOM_FIELDS, {
    ssr: false,
  })

  const [
    costCenterCustomFieldsState,
    setCostCenterCustomFieldsState,
  ] = useState<CustomField[]>([])

  useEffect(() => {
    if (defaultCustomFieldsDataLoading) return

    const costCenterFieldsToDisplay = defaultCustomFieldsData?.getB2BSettings.costCenterCustomFields.filter(
      (item: CustomField) => item.useOnRegistration
    )

    setCostCenterCustomFieldsState(costCenterFieldsToDisplay)
  }, [defaultCustomFieldsData])

  const handleCostCenterCustomFieldsUpdate = (
    index: number,
    customField: CustomField
  ) => {
    const newCustomFields = [...costCenterCustomFieldsState]

    newCustomFields[index] = customField
    setCostCenterCustomFieldsState(newCustomFields)
  }
  //! CUSTOM FIELDS

  /**
   * Functions
   */
  const handleCostCentersRowsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e

    setCostCenterPaginationState({
      page: 1,
      pageSize: +value,
    })

    refetchCostCenters({
      id: params?.id,
      page: 1,
      pageSize: +value,
    })
  }

  const handleAddNewCostCenter = () => {
    setLoadingState(true)
    const newAddress = {
      addressId: newCostCenterAddressState.addressId.value,
      addressType: newCostCenterAddressState.addressType.value,
      city: newCostCenterAddressState.city.value,
      complement: newCostCenterAddressState.complement.value,
      country: newCostCenterAddressState.country.value,
      receiverName: newCostCenterAddressState.receiverName.value,
      geoCoordinates: newCostCenterAddressState.geoCoordinates.value,
      neighborhood: newCostCenterAddressState.neighborhood.value,
      number: newCostCenterAddressState.number.value,
      postalCode: newCostCenterAddressState.postalCode.value,
      reference: newCostCenterAddressState.reference.value,
      state: newCostCenterAddressState.state.value,
      street: newCostCenterAddressState.street.value,
      addressQuery: newCostCenterAddressState.addressQuery.value,
    }

    const variables = {
      organizationId: params.id,
      input: {
        name: newCostCenterName,
        addresses: [newAddress],
        businessDocument: newCostCenterBusinessDocument,
        customFields: costCenterCustomFieldsState,
        stateRegistration: newCostCenterStateRegistration,
      },
    }

    createCostCenter({ variables })
      .then(() => {
        setNewCostCenterModalState(false)
        setLoadingState(false)
        showToast({
          variant: 'positive',
          message: formatMessage(messages.toastAddCostCenterSuccess),
        })
        refetchCostCenters({ ...costCenterPaginationState, id: params?.id })
      })
      .catch(error => {
        setNewCostCenterModalState(false)
        setLoadingState(false)
        console.error(error)
        showToast({
          variant: 'critical',
          message: formatMessage(messages.toastAddCostCenterFailure),
        })
      })
  }

  const handleCostCentersPrevClick = () => {
    if (costCenterPaginationState.page === 1) return

    const newPage = costCenterPaginationState.page - 1

    setCostCenterPaginationState({
      ...costCenterPaginationState,
      page: newPage,
    })

    refetchCostCenters({
      ...costCenterPaginationState,
      id: params?.id,
      page: newPage,
    })
  }

  const handleCostCentersNextClick = () => {
    const newPage = costCenterPaginationState.page + 1

    setCostCenterPaginationState({
      ...costCenterPaginationState,
      page: newPage,
    })

    refetchCostCenters({
      ...costCenterPaginationState,
      id: params?.id,
      page: newPage,
    })
  }

  const getCostCenterSchema = () => ({
    properties: {
      name: {
        title: formatMessage(messages.detailsColumnName),
      },
      addresses: {
        title: formatMessage(messages.columnAddresses),
        cellRenderer: ({
          rowData: { addresses },
        }: CellRendererProps<CostCenterSimple>) => (
          <span>{addresses.length}</span>
        ),
      },
    },
  })

  const handleNewCostCenterAddressChange = (
    changedAddress: AddressFormFields
  ) => {
    const curAddress = newCostCenterAddressState

    const newAddress = { ...curAddress, ...changedAddress }

    setNewCostCenterAddressState(newAddress)
  }

  const handleCloseModal = () => {
    setNewCostCenterModalState(false)
    setNewCostCenterName('')
    setNewCostCenterAddressState(addValidation(getEmptyAddress(country)))
  }

  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })

  const translateCountries = () => {
    const { shipsTo = [] } = logisticsData?.logistics ?? {}

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
  }

  /**
   * View
   */
  return (
    <Fragment>
      <PageBlock title={formatMessage(messages.costCenters)}>
        <Table
          fullWidth
          schema={getCostCenterSchema()}
          loading={loading}
          items={costCentersData?.getCostCentersByOrganizationId?.data}
          onRowClick={({
            rowData: { id },
          }: CellRendererProps<CostCenterSimple>) => {
            if (!id) return

            navigate({
              page: 'admin.app.b2b-organizations.costCenter-details',
              params: { id },
            })
          }}
          pagination={{
            onNextClick: handleCostCentersNextClick,
            onPrevClick: handleCostCentersPrevClick,
            onRowsChange: handleCostCentersRowsChange,
            currentItemFrom:
              (costCenterPaginationState.page - 1) *
                costCenterPaginationState.pageSize +
              1,
            currentItemTo:
              costCentersData?.getCostCentersByOrganizationId?.pagination
                ?.total <
              costCenterPaginationState.page *
                costCenterPaginationState.pageSize
                ? costCentersData?.getCostCentersByOrganizationId?.pagination
                    ?.total
                : costCenterPaginationState.page *
                  costCenterPaginationState.pageSize,
            textShowRows: formatMessage(messages.showRows),
            textOf: formatMessage(messages.of),
            totalItems:
              costCentersData?.getCostCentersByOrganizationId?.pagination
                ?.total ?? 0,
            rowsOptions: [25, 50, 100],
          }}
          toolbar={{
            newLine: {
              label: formatMessage(messages.new),
              handleCallback: () => setNewCostCenterModalState(true),
            },
          }}
        />
      </PageBlock>
      <Modal
        centered
        bottomBar={
          <div className="nowrap">
            <span className="mr4">
              <Button
                variation="tertiary"
                onClick={() => handleCloseModal()}
                disabled={loadingState}
              >
                {formatMessage(messages.cancel)}
              </Button>
            </span>
            <span>
              <Button
                variation="primary"
                onClick={() => handleAddNewCostCenter()}
                isLoading={loadingState}
                disabled={
                  !newCostCenterName ||
                  !isValidAddress(newCostCenterAddressState) ||
                  (newCostCenterPhoneNumber &&
                    !validatePhoneNumber(newCostCenterPhoneNumber))
                }
              >
                {formatMessage(messages.add)}
              </Button>
            </span>
          </div>
        }
        isOpen={newCostCenterModalState}
        onClose={() => handleCloseModal()}
        closeOnOverlayClick={false}
      >
        <p className="f3 f1-ns fw3 gray">
          <FormattedMessage id="admin/b2b-organizations.organization-details.add-costCenter" />
        </p>
        <div className="w-100 mv6">
          <Input
            autocomplete="off"
            size="large"
            label={formatMessage(messages.costCenterName)}
            value={newCostCenterName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterName(e.target.value)
            }}
            required
          />
        </div>
        <div className="w-100 mv6">
          <Input
            autocomplete="off"
            size="large"
            label={formatMessage(messages.phoneNumber)}
            helpText={formatMessage(messages.phoneNumberHelp)}
            value={newCostCenterPhoneNumber}
            error={
              newCostCenterPhoneNumber &&
              !validatePhoneNumber(newCostCenterPhoneNumber)
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterPhoneNumber(e.target.value)
            }}
          />
        </div>
        <div className="w-100 mv6">
          <Input
            autocomplete="off"
            size="large"
            label={formatMessage(messages.businessDocument)}
            helpText={formatMessage(messages.businessDocumentHelp)}
            value={newCostCenterBusinessDocument}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterBusinessDocument(e.target.value)
            }}
          />
        </div>
        {/* //! Custom fields */}
        {defaultCustomFieldsDataLoading ? (
          <div className="mb5 flex flex-column">
            <Spinner />
          </div>
        ) : (
          <>
            {costCenterCustomFieldsState?.map(
              (customField: CustomField, index: number) => {
                return (
                  <CustomFieldInput
                    key={`${customField.name}`}
                    index={index}
                    handleUpdate={handleCostCenterCustomFieldsUpdate}
                    customField={customField}
                  />
                )
              }
            )}
          </>
        )}
        {/* //! Custom fields */}
        <div className="w-100 mv6">
          <Input
            autocomplete="off"
            size="large"
            label={formatMessage(messages.stateRegistration)}
            helpText={formatMessage(messages.stateRegistrationHelp)}
            value={newCostCenterStateRegistration}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterStateRegistration(e.target.value)
            }}
          />
        </div>
        <div className="w-100 mv6">
          <FormattedMessage id="admin/b2b-organizations.organization-details.add-costCenter.helpText" />
        </div>
        <AddressRules
          country={newCostCenterAddressState?.country?.value}
          shouldUseIOFetching
          useGeolocation={false}
        >
          <AddressContainer
            address={newCostCenterAddressState}
            Input={StyleguideInput}
            onChangeAddress={handleNewCostCenterAddressChange}
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
    </Fragment>
  )
}

export default OrganizationDetailsCostCenters
