import { FC, useRef } from 'react'
import React, { useState, useContext, useEffect, Fragment } from 'react'
import {
  Input,
  Button,
  ToastContext,
  Layout,
  PageBlock,
  Alert,
  Spinner,
  Dropdown,
  Checkbox
} from 'vtex.styleguide'
import {
  AddressRules,
  AddressContainer,
  PostalCodeGetter,
  CountrySelector,
  AddressForm,
} from 'vtex.address-form'
import { StyleguideInput } from 'vtex.address-form/inputs'
import { addValidation } from 'vtex.address-form/helpers'
import { useCssHandles } from 'vtex.css-handles'
import { useQuery, useMutation } from 'react-apollo'
import { useIntl, FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import 'vtex.country-codes/locales'

import { organizationRequestMessages as messages } from './utils/messages'
import storageFactory from '../utils/storage'
import { getSession } from '../modules/session'
// import { validateEmail } from '../modules/formValidators'
// import { getEmptyAddress, isValidAddress } from '../utils/addresses'
import { getEmptyAddress } from '../utils/addresses'
import CREATE_ORGANIZATION_REQUEST from '../graphql/createOrganizationRequest.graphql'
import GET_ORGANIZATION_REQUEST from '../graphql/getOrganizationRequest.graphql'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'

import '../styles.global.css'
import createOrganization from '../requests/createOrganization'
import attachFileToEntity from '../utils/attachFileToEntity'
import { masterData, types } from '../config/masterdata'

const localStore = storageFactory(() => localStorage)
let requestId = localStore.getItem('b2b-organizations_orgRequestId') ?? ''

const useSessionResponse = () => {
  const [session, setSession] = useState<any>()

  const sessionPromise = getSession()

  useEffect(() => {
    if (!sessionPromise) {
      return
    }

    sessionPromise.then(sessionResponse => {
      const { response } = sessionResponse

      setSession(response)
    })
  }, [sessionPromise])

  return session
}

const isAuthenticated = true

const CSS_HANDLES = [
  'newOrganizationContainer',
  'newOrganizationInput',
  'newOrganizationAddressForm',
  'newOrganizationButtonsContainer',
  'newOrganizationButtonSubmit',
] as const

const CreateNewOrganizationRequest = (props: any) => {
  return (
    <Fragment>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button variation="primary" {...props}>
          <FormattedMessage id="store/b2b-organizations.request-new-organization.submit-button.create-new-request" />
        </Button>
      </div>
    </Fragment>
  )
}

interface ModalMessage {
  title: string,
  message: string,
  buttonText: string,
  buttonLink: string,
  active: boolean
}


function formataCNPJ(cnpj: string) {
  //retira os caracteres indesejados...
  cnpj = cnpj.replace(/[^\d]/g, "");

  //realizar a formatação...
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formataCPF(cpf: string) {
  //retira os caracteres indesejados...
  cpf = cpf.replace(/[^\d]/g, "");

  //realizar a formatação...
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formataPhone(phone: string) {
  //retira os caracteres indesejados...
  phone = phone.replace(/[^\d]/g, "");

  //realizar a formatação...
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

function formataPhoneEmpresa(phone: string) {
  //retira os caracteres indesejados...
  phone = phone.replace(/[^\d]/g, "");

  //realizar a formatação...
  return phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4");
}

function removeLettersAndSymbols(text: string) {
  //retira os caracteres indesejados...
  return text.replace(/[^\d]/g, "");

}

const ModalOrganizationMessage = (props: any) => {
  const settings: ModalMessage = props.settings
  return (<Fragment>
    {settings.active ?
      <div className='modal-organization__shadow'>
        <article className='modal-organization__box'>
          <header className='modal-organization__header'>
            {settings.title}
          </header>
          <p className='modal-organization__message'>{settings.message}</p>
          <footer className='modal-organization__footer'>
            <a className='modal-organization__button' onClick={() => { props.toggleActiveModal() }} href={settings.buttonLink != '' ? settings.buttonLink : undefined} >{settings.buttonText}</a>
          </footer>
        </article>
      </div>
      : null}
  </Fragment>)
}

const PendingItem = ({ children }: { children: string }) => {
  return <span className='b db tc mb1' style={{ color: '#494343' }}>{children}</span>
}

const organizationAreaOthersValue = 'others'

const RequestOrganizationForm: FC = () => {
  const { formatMessage, formatDate } = useIntl()
  const {
    culture: { country },
  } = useRuntime()

  const countryStateInputInterval: { current: number | null } = useRef(null)

  const [modalSettings, setModalSettings] = useState<ModalMessage>(
    {
      title: 'Cadastro enviado!',
      message: 'Vamos analisar os dados enviados e liberar o seu cadastro. Aguarde nosso e-mail com mais informações e liberar seu cadastro em até 24 horas. Por enquanto, você já pode comprar itens de USO LIVRE.',
      buttonText: 'Voltar para a loja',
      buttonLink: '/',
      active: false
    }
  )

  const [permission, setPermission] = useState<boolean>(false)


  const { showToast } = useContext(ToastContext)
  const sessionResponse: any = useSessionResponse()
  const handles = useCssHandles(CSS_HANDLES)
  const { data } = useQuery(GET_LOGISTICS, { ssr: false })
  const { data: existingRequestData, refetch, loading } = useQuery(
    GET_ORGANIZATION_REQUEST,
    {
      variables: { id: requestId },
      skip: !requestId,
    }
  )

  const [pendings, setPendings] = useState<string[]>([])


  const [createOrganizationRequest] = useMutation(CREATE_ORGANIZATION_REQUEST)

  const [addressState, setAddressState] = useState(() =>
    addValidation(getEmptyAddress(country))
  )

  const { acronym, image } = masterData[types.ORGANIZATION]

  const formStateModel = {
    organizationName: '',
    organizationIE: '',
    organizationICMS: null,
    organizationArea: '',
    organizationAreaOthers: '',
    organizationPhone: '',
    newsletter: false,
    firstName: '',
    tradeName: '',
    lastName: '',
    email: '',
    cpf: '',
    telephone: '',
    defaultCostCenterName: '',
    businessDocument: '',
    isSubmitting: false,
    submitted: true,
    file: null
  }

  const [formState, setFormState] = useState<any>(formStateModel)

  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    if (!sessionResponse || hasProfile) return

    if (sessionResponse.namespaces?.profile?.isAuthenticated?.value) {
      setFormState({
        ...formState,
        firstName: sessionResponse.namespaces.profile.firstName?.value,
        lastName: sessionResponse.namespaces.profile.lastName?.value,
        email: sessionResponse.namespaces.profile.email?.value,
      })
      setHasProfile(true)
    }
  }, [sessionResponse])

  const clearCountryStateInterval = () => {
    if (countryStateInputInterval.current) clearInterval(countryStateInputInterval.current)
  }

  const countryStateInputScript = () => {
    countryStateInputInterval.current = setInterval(() => {
      const countryState = document.querySelector('.vtex-address-form__state') as HTMLDivElement
      if (!countryState) return
      countryState.style.display = 'none'
      const newGridTemplateAreas = '"endereco endereco" "numero complemento" "bairro cidade" "destinatario destinatario"'
      if (countryState.parentElement) countryState.parentElement.style.gridTemplateAreas = newGridTemplateAreas
      clearCountryStateInterval()
    }, 1000)
  }

  useEffect(() => {
    countryStateInputScript()
    return function cleanUp() {
      clearCountryStateInterval()
    }
  }, [])

  useEffect(() => {
    type ValidationType = {
      isValid: boolean,
      stringIfInvalid: string
    }

    const validations: ValidationType[] = [
      {
        isValid: formState.firstName?.trim() !== '',
        stringIfInvalid: `${translateMessage(messages.userData)} > ${translateMessage(messages.firstName)}`
      },
      {
        isValid: formState.lastName?.trim() !== '',
        stringIfInvalid: `${translateMessage(messages.userData)} > ${translateMessage(messages.lastName)}`
      },
      {
        isValid: formState.email?.trim() !== '',
        stringIfInvalid: `${translateMessage(messages.userData)} > ${translateMessage(messages.email)}`
      },
      {
        isValid: formState.cpf !== '',
        stringIfInvalid: `${translateMessage(messages.userData)} > ${translateMessage(messages.cpf)}`
      },
      {
        isValid: formState.telephone !== '',
        stringIfInvalid: `${translateMessage(messages.userData)} > ${translateMessage(messages.telephone)}`
      },
      {
        isValid: formState.businessDocument !== '',
        stringIfInvalid: `${translateMessage(messages.organizationData)} > ${translateMessage(messages.cnpjLabel)}`
      },
      {
        isValid: formState.organizationName !== '',
        stringIfInvalid: `${translateMessage(messages.organizationData)} > ${translateMessage(messages.organizationName)}`
      },
      {
        isValid: formState.organizationIE !== '',
        stringIfInvalid: `${translateMessage(messages.organizationData)} > ${translateMessage(messages.stateRegistrationInitials)}`
      },
      {
        isValid: formState.organizationArea !== '' && (formState.organizationArea !== organizationAreaOthersValue || (formState.organizationArea == organizationAreaOthersValue && formState.organizationAreaOthers !== '')),
        stringIfInvalid: `${translateMessage(messages.organizationData)} > ${translateMessage(messages.occupationArea)}`
      },
      {
        isValid: formState.organizationPhone !== '',
        stringIfInvalid: `${translateMessage(messages.organizationData)} > ${translateMessage(messages.telephone
        )}`
      },
      {
        isValid: permission,
        stringIfInvalid: translateMessage(messages.acceptTermsAndConditions)
      },
    ]

    setPendings(() => validations.reduce((previous: string[], current: ValidationType) => {
      if (current.isValid) return previous
      return [...previous, current.stringIfInvalid]
    }, []))

  }, [formState, permission])

  const translateMessage = (message: MessageDescriptor) => {
    return formatMessage(message)
  }


  const toastMessage = (message: MessageDescriptor) => {
    const translatedMessage = translateMessage(message)
    const action = undefined

    showToast({ message: translatedMessage, action })
  }

  const translateCountries = () => {
    const { shipsTo = [] } = data?.logistics

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
  }
  const handleAddressChange = (changedAddress: AddressFormFields) => {
    const curAddress = addressState

    const newAddress = { ...curAddress, ...changedAddress }

    setAddressState(newAddress)
  }

  const handleNewOrganizationRequest = () => {
    localStore.removeItem('b2b-organizations_orgRequestId')
    setFormState({
      ...formStateModel,
      submitted: false,
    })
    setAddressState(() => addValidation(getEmptyAddress(country)))
  }
  const handleSubmit = async () => {
    setFormState({
      ...formState,
      isSubmitting: true,
      submitted: true,
    })

    const data = {
      name: formState.organizationName,
      cnpj: formState.businessDocument,
      phone: formState.organizationPhone,
      ie: formState.organizationIE,
      icms: formState.organizationICMS,
      area: formState.organizationArea,
      areaOthers: formState.organizationAreaOthers
    }

    createOrganization(data)
      .then(data => {
        const file = (document.querySelector('.file-button > input[type="file"]') as HTMLInputElement).files?.[0]
        if (file) attachFileToEntity(acronym, data.DocumentId, image, file)
      })

    const organizationRequest = {
      name: formState.organizationName,
      tradeName: formState.tradeName,
      b2bCustomerAdmin: {
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        cpf: formState.cpf,
        telephone: formState.telephone
      },
      defaultCostCenter: {
        name: formState.organizationName,
        ie: formState.organizationIE,
        icms: formState.organizationICMS,
        area: formState.organizationArea,
        areaOthers: formState.organizationAreaOthers,
        phone: removeLettersAndSymbols(formState.organizationPhone),
        newsletter: formState.newsletter,
        address: {
          addressId: addressState.addressId.value,
          addressType: addressState.addressType.value,
          city: addressState.city.value,
          complement: addressState.complement.value,
          country: addressState.country.value,
          receiverName: addressState.receiverName.value,
          geoCoordinates: addressState.geoCoordinates.value,
          neighborhood: addressState.neighborhood.value,
          number: addressState.number.value,
          postalCode: addressState.postalCode.value,
          reference: addressState.reference.value,
          state: addressState.state.value,
          street: addressState.street.value,
          addressQuery: addressState.addressQuery.value,
        },
        businessDocument: formState.businessDocument,
      },
    }


    createOrganizationRequest({
      variables: {
        input: organizationRequest,
      },
    })
      .then(response => {
        const statusRequest = response.data.createOrganizationRequest.status

        if (statusRequest === 'pending') {
          toastMessage(messages.toastPending)
          setFormState({
            ...formState,
            isSubmitting: false,
          })
        } else if (statusRequest === 'approved') {
          toastMessage(messages.toastApproved)
          setFormState({
            ...formState,
            isSubmitting: false,
          })
        } else {
          requestId = response.data.createOrganizationRequest.id
          localStore.setItem('b2b-organizations_orgRequestId', requestId)
          toastMessage(messages.toastSuccess)
          refetch({ id: requestId })
          window.scrollTo({ top: 0, behavior: 'smooth' })
          setFormState({
            ...formState,
            isSubmitting: false,
            submitted: true,
          })
          setModalSettings({
            title: 'Cadastro enviado!',
            message: 'Vamos analisar os dados enviados e liberar o seu cadastro. Aguarde nosso e-mail com mais informações e liberar seu cadastro em até 24 horas. Por enquanto, você já pode comprar itens de USO LIVRE.',
            buttonText: 'Voltar para a loja',
            buttonLink: '/',
            active: true
          })

        }
      })
      .catch(error => {
        console.error(error)
        toastMessage(messages.toastFailure)
        setFormState({
          ...formState,
          isSubmitting: false,
        })
      })
  }

  if (!data) return null
  const renderIfSubmitted =
    formState.submitted &&
      existingRequestData?.getOrganizationRequestById?.status ? (
      <PageBlock>
        {existingRequestData.getOrganizationRequestById.status ===
          'pending' && (
            <Fragment>
              <div className="mb5">
                <Alert type="warning">
                  <FormattedMessage
                    id="store/b2b-organizations.request-new-organization.pending-request"
                    values={{
                      created: formatDate(
                        existingRequestData.getOrganizationRequestById.created,
                        {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                        }
                      ),
                    }}
                  />
                </Alert>
              </div>
              <CreateNewOrganizationRequest
                onClick={handleNewOrganizationRequest}
              />
            </Fragment>
          )}
        {existingRequestData.getOrganizationRequestById.status ===
          'approved' && (
            <Fragment>
              <div className="mb5">
                <Alert type="success">
                  <FormattedMessage id="store/b2b-organizations.request-new-organization.approved-request" />
                </Alert>
              </div>
              <CreateNewOrganizationRequest
                onClick={handleNewOrganizationRequest}
              />
            </Fragment>
          )}
        {existingRequestData.getOrganizationRequestById.status ===
          'declined' && (
            <Fragment>
              <div className="mb5">
                <Alert type="error">
                  <FormattedMessage
                    id="store/b2b-organizations.request-new-organization.declined-request"
                    values={{
                      created: formatDate(
                        existingRequestData.getOrganizationRequestById.created,
                        {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                        }
                      ),
                    }}
                  />
                </Alert>
              </div>
              <CreateNewOrganizationRequest
                onClick={handleNewOrganizationRequest}
              />
            </Fragment>
          )}
      </PageBlock>
    ) : (
      <Fragment>
        <div className='customb2b-pageBody'>

          <PageBlock
            variation="full"
            title={formatMessage(messages.userData)}
            subtitle={formatMessage(messages.formContainerSubTitle)}
          >
            <div className='form-group-flex'>

              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage(messages.firstName)}
                  value={formState.firstName}
                  placeholder={"Nome"}

                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      firstName: e.target.value,
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage(messages.lastName)}
                  value={formState.lastName}
                  placeholder={translateMessage(messages.lastName)}

                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      lastName: e.target.value,
                    })
                  }}
                />
              </div>
            </div>
            <div
              className={`${handles.newOrganizationInput} mb5 flex flex-column`}
            >
              <Input
                size="large"
                label={translateMessage(messages.email)}
                value={formState.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormState({
                    ...formState,
                    email: e.target.value,
                  })
                }}
              />
            </div>
            <div className='form-group-flex'>

              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage(messages.cpf)}
                  value={formState.cpf}
                  maxLength={'14'}
                  placeholder={"000.000.000-00"}

                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {

                    setFormState({
                      ...formState,
                      cpf: formataCPF(e.target.value),
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage(messages.telephone)}
                  value={formState.telephone}
                  maxLength={'15'}

                  placeholder={"(00) 00000-000"}

                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      telephone: formataPhone(e.target.value),
                    })
                  }}
                />
              </div>
            </div>
          </PageBlock>
          <PageBlock
            variation="full"
            title={translateMessage(messages.organizationData)}
            subtitle={translateMessage(messages.organizationDataDescription)}
          >

            <div className='form-group-flex'>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  autocomplete="off"
                  size="large"
                  label={translateMessage(messages.cnpjLabel)}
                  value={formState.businessDocument}
                  placeholder={"00.000.000/0000-00"}
                  maxLength={'18'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {

                    setFormState({
                      ...formState,
                      businessDocument: formataCNPJ(e.target.value),
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
              </div>
            </div>
            <>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  autocomplete="off"
                  size="large"
                  label={translateMessage(messages.organizationName)}
                  value={formState.organizationName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      organizationName: e.target.value,
                      defaultCostCenterName: e.target.value,
                    })
                  }}
                  required
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  autocomplete="off"
                  size="large"
                  label={translateMessage(messages.tradeName)}
                  helpText={translateMessage(messages.tradeNameHelp)}
                  value={formState.tradeName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      tradeName: e.target.value,
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} ie-flex`}
              >
                <Input
                  autocomplete="off"
                  size="large"
                  label={"IE"}
                  readOnly={formState.organizationIE == "Isento"}
                  value={formState.organizationIE}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      organizationIE: e.target.value,
                    })
                  }}
                  required
                />
                <Checkbox
                  checked={formState.organizationIE == "Isento"}
                  id="Isento"
                  label={`${translateMessage(messages.free)}?`}
                  name="Isento"
                  onChange={() => {
                    formState.organizationIE == "Isento" ?
                      setFormState({
                        ...formState,
                        organizationIE: "",
                      })
                      : setFormState({
                        ...formState,
                        organizationIE: "Isento",
                      })
                  }}
                />
              </div>

              <div
                className={`${handles.newOrganizationInput} icms-flex`}
              >
                <label>Contribuinte ICMS</label>
                <div>
                  <Checkbox
                    checked={formState.organizationICMS}
                    id="option-0"
                    name="default-checkbox-group"
                    label={translateMessage(messages.yes)}
                    onChange={() => {
                      setFormState({
                        ...formState,
                        organizationICMS: true,
                      })
                    }}
                    value="option-0"
                  />
                  <Checkbox
                    checked={formState.organizationICMS === false}
                    id="option-0"
                    name="default-checkbox-group"
                    label={translateMessage(messages.no)}
                    onChange={() => {
                      setFormState({
                        ...formState,
                        organizationICMS: false,
                      })
                    }}
                    value="option-0"
                  />
                </div>
              </div>

              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Dropdown
                  size="large"
                  label={translateMessage(messages.occupationArea)}
                  options={[
                    { value: 'Clínica Médica', label: 'Clínica Médica' },
                    { value: 'Clínica Odontológica', label: 'Clínica Odontológica' },
                    { value: 'Estética', label: 'Estética' },
                    { value: 'Farmácia', label: 'Farmácia' },
                    { value: 'Hospital', label: 'Hospital' },
                    { value: 'Laboratório de Análises', label: 'Laboratório de Análises' },
                    { value: 'Instituição de Ensino', label: 'Instituição de Ensino' },
                    { value: 'Veterinária & Pet', label: 'Veterinária & Pet' },
                    { value: organizationAreaOthersValue, label: 'Outros' }
                  ]}
                  value={formState.organizationArea}
                  onChange={(__: any, value: string) => {
                    setFormState({
                      ...formState,
                      organizationArea: value,
                    })
                  }}
                  required
                />
              </div>

              {
                formState.organizationArea === organizationAreaOthersValue &&
                <div
                  className={`${handles.newOrganizationInput} mb5 flex flex-column`}
                >
                  <Input
                    autocomplete="off"
                    size="large"
                    label={translateMessage(messages.occupationAreaDescription)}
                    maxLength={'50'}
                    value={formState.organizationAreaOthers}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFormState({
                        ...formState,
                        organizationAreaOthers: e.target.value,
                      })
                    }}
                    required
                  />
                </div>
              }


              <div className='form-group-flex'>

                <div
                  className={`${handles.newOrganizationInput} mb5 flex flex-column`}
                >
                  <Input
                    autocomplete="off"
                    size="large"
                    label={translateMessage(messages.landline)}
                    placeholder={"+55 (11) 12345-1234"}
                    maxLength={'18'}
                    value={formState.organizationPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFormState({
                        ...formState,
                        organizationPhone: formataPhoneEmpresa(e.target.value),
                      })
                    }}
                    required
                  />
                </div>
                <div></div>
              </div>
            </>
          </PageBlock>
          <>
            <PageBlock
              variation="full"
              title={translateMessage(messages.registerBillingAddress)}
              subtitle={translateMessage(messages.registerBillingAddressDescription)}
            >
              <div
                className={`${handles.newOrganizationAddressForm} mb5 flex flex-column`}
              >
                <AddressRules
                  country={addressState?.country?.value}
                  shouldUseIOFetching
                  useGeolocation={false}
                >
                  <AddressContainer
                    address={addressState}
                    Input={StyleguideInput}
                    onChangeAddress={handleAddressChange}
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
              </div>


            </PageBlock>
            <PageBlock
              variation="full"
              title={translateMessage(messages.proofAttachment)}
              subtitle={translateMessage(messages.proofAttachmentDescription)}
            >
              <div className='file'>

                <div className='file-button'>
                  <label htmlFor={"documents"}>
                    <FormattedMessage id="store/b2b-organizations.request-new-organization.attach-file.label" />
                  </label>
                  <input type={"file"} accept={'image/*, .pdf'} id={"documents"} name={"documents"}
                    onChange={(ev) => {
                      setFormState({
                        ...formState,
                        file: ev.target?.files?.[0],
                      })

                    }}
                    multiple />
                </div>

                <span className='file-warning'>
                  <FormattedMessage id="store/b2b-organizations.request-new-organization.attach-file.acceptedFormats" />
                </span>
              </div>

              <div
                className={`${handles.newOrganizationInput}`}
              >
                <Checkbox
                  checked={formState.newsletter}
                  id="newsletter"
                  name="newsletter"
                  label={translateMessage(messages.newsletterLabel)}
                  onChange={() => {
                    setFormState({
                      ...formState,
                      newsletter: !formState.newsletter,
                    })

                  }}
                  value="newsletter"
                />
              </div>
              <div
                className={`${handles.newOrganizationInput}`}
              >
                <Checkbox
                  checked={permission}
                  id="permission"
                  name="permission"
                  label={translateMessage(messages.privacyPoliciesLabel)}
                  onChange={() => {
                    setPermission(!permission)
                  }}
                  value="permission"
                />
              </div>
            </PageBlock>
          </>
        </div>
        <div
          className={`${handles.newOrganizationButtonsContainer} mb5 flex flex-column items-end pt6`}
        >
          <div className="flex justify-content flex-row w-100 justify-center">
            <div
              className={`no-wrap w-100 flex flex-column items-center justify-center ${handles.newOrganizationButtonSubmit}`}
            >
              {
                pendings.length
                  ? <div className='ba bw1 b--dark-red w-100 pv4 ph6 mb6' style={{ borderColor: '#d89d9d', maxWidth: '550px' }}>
                    <span className='db tc b mb4' style={{ color: '#b30000' }}>
                      <FormattedMessage id="store/b2b-organizations.request-new-organization.required-fields-panel.title" />
                    </span>

                    {
                      pendings.map((pending: string) => <PendingItem key={pending}>{pending}</PendingItem>)
                    }
                  </div>
                  : false
              }
              <Button
                variation="primary"
                isLoading={formState.isSubmitting}
                onClick={() => {
                  handleSubmit()
                }}
                disabled={pendings.length}
              >
                Enviar Cadastro
              </Button>

            </div>
          </div>
        </div>
      </Fragment>
    )

  const renderIfAuthenticated = !isAuthenticated ? (
    <PageBlock>
      <div>
        <FormattedMessage id="store/b2b-organizations.not-authenticated" />
      </div>
    </PageBlock>
  ) : (
    renderIfSubmitted
  )

  return (
    <div className={`${handles.newOrganizationContainer} pv6 ph4 mw9 center`}>
      <Layout
        fullWidth
        pageHeader={
          <div className='customb2b-pageHeader'>
            <h1>
              <FormattedMessage id="store/b2b-organizations.request-new-organization.form-title" />
            </h1>
            <h3>
              <FormattedMessage id="store/b2b-organizations.request-new-organization.form-subtitle" />
            </h3>
            <h4>
              <FormattedMessage id="store/b2b-organizations.request-new-organization.form-title-description" />
            </h4>

          </div>
        }
      >
        {loading ? (
          <span style={{ display: 'flex', justifyContent: 'center' }}>
            <Spinner size={40} />
          </span>
        ) : (
          <Fragment>{renderIfAuthenticated}</Fragment>
        )}
      </Layout>
      <ModalOrganizationMessage settings={modalSettings} toggleActiveModal={() => {
        setModalSettings({
          title: '',
          message: '',
          buttonLink: '',
          buttonText: '',
          active: false
        })
      }} />
    </div>
  )
}

export default RequestOrganizationForm