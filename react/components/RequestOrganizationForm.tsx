import type { FC } from 'react'
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
import { validateEmail } from '../modules/formValidators'
import { getEmptyAddress, isValidAddress } from '../utils/addresses'
import CREATE_ORGANIZATION_REQUEST from '../graphql/createOrganizationRequest.graphql'
import GET_ORGANIZATION_REQUEST from '../graphql/getOrganizationRequest.graphql'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'

import api from './utils/api'

import '../styles.global.css'

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

const RequestOrganizationForm: FC = () => {
  const { formatMessage, formatDate } = useIntl()
  const {
    culture: { country },
  } = useRuntime()

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

  const [loadFunc, setLoadFunc] = useState<boolean>(false)
  const [lockFunc, setLockFunc] = useState<boolean>(true)


  const [createOrganizationRequest] = useMutation(CREATE_ORGANIZATION_REQUEST)

  const [addressState, setAddressState] = useState(() =>
    addValidation(getEmptyAddress(country))
  )

  const formStateModel = {
    organizationName: '',
    organizationType: '',
    organizationPublic: '',
    organizationIE: '',
    organizationICMS: false,
    organizationArea: '',
    organizationPhone: '',
    newsletter: false,
    firstName: '',
    lastName: '',
    email: '',
    cpf: '',
    telephone: '',
    defaultCostCenterName: '',
    businessDocument: '',
    isSubmitting: false,
    submitted: true,
  }

  const [formState, setFormState] = useState(formStateModel)

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

  const handleSefazApi = (cnpj: string) => {
    console.log("call sefaz before validate")
    if (cnpj.length == 18) {
      cnpj = cnpj.replace(".", "").replace(".", "").replace("/", "").replace("-", "")
    }
    if (cnpj.length == 14) {
      console.log("call sefaz after validate")
      //insert loading here
      setLoadFunc(true)
      api.post('/receita-federal/cnpj', {
        cnpj: cnpj
      }).then((data: any) => {
        //input all camps

        //unlock unseen inputs
        setLockFunc(false)

        //remove loading here
        setLoadFunc(false)

        console.log(data?.data)

        if (data?.data?.code == 200) {

          console.log(data?.data?.data)
          setFormState({
            ...formState,
            businessDocument: data?.data?.data[0]?.cnpj,
            organizationName: data?.data?.data[0]?.razao_social,

          })
          return data?.data
        }
      }).catch((err) => {
        //remove loading here
        setLoadFunc(false)

        console.error(err)
      })
    }
  }

  const handleAddressChange = (changedAddress: AddressFormFields) => {
    console.log(changedAddress)
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

  const handleSubmit = () => {
    setFormState({
      ...formState,
      isSubmitting: true,
      submitted: true,
    })

    const organizationRequest = {
      name: formState.organizationName,
      b2bCustomerAdmin: {
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        cpf: formState.cpf,
        telephone: formState.telephone
      },
      defaultCostCenter: {
        name: formState.organizationName,
        type: formState.organizationType,
        public: formState.organizationPublic,
        ie: formState.organizationIE,
        icms: formState.organizationICMS,
        area: formState.organizationArea,
        phone: formState.organizationPhone,
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

  return (
    <div className={`${handles.newOrganizationContainer} pv6 ph4 mw9 center`}>
      <Layout
        fullWidth
        pageHeader={
          <div className='customb2b-pageHeader'>
            <h1>
              Cadastre sua empresa e tenha acesso a benefícios exclusivos.
            </h1>
            <h3>
              Preencha o formulário abaixo para ter acesso ao nosso catálogo e realizar suas compras em nosso site.
            </h3>
            <h4>
              Seu cadastro passará por uma análise e você receberá o retorno em até 24 horas úteis.
            </h4>
          </div>
        }
      >
        {loading ? (
          <span style={{ display: 'flex', justifyContent: 'center' }}>
            <Spinner size={40} />
          </span>
        ) : (
          <Fragment>
            {!isAuthenticated ? (
              <PageBlock>
                <div>
                  <FormattedMessage id="store/b2b-organizations.not-authenticated" />
                </div>
              </PageBlock>
            ) : formState.submitted &&
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
                                existingRequestData.getOrganizationRequestById
                                  .created,
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
                                existingRequestData.getOrganizationRequestById
                                  .created,
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
                    title={"Dados do administrador"}
                    subtitle={"O usuário abaixo será atribuído como administrador da organização, e será notificado por e-mail quando o cadastro for aprovado."}
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
                          placeholder={"Último Nome"}

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
                          placeholder={"000.000.000-00"}

                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormState({
                              ...formState,
                              cpf: e.target.value,
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
                          placeholder={"(00) 00000-000"}

                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormState({
                              ...formState,
                              telephone: e.target.value,
                            })
                          }}
                        />
                      </div>
                    </div>
                  </PageBlock>
                  <PageBlock
                    variation="full"
                    title={"Dados da empresa"}
                    subtitle={"Os dados a serem informados devem ser os mesmos do cartão CNPJ."}
                  >

                    <div className='form-group-flex'>
                      <div
                        className={`${handles.newOrganizationInput} mb5 flex flex-column`}
                      >
                        <Input
                          autocomplete="off"
                          size="large"
                          label={"CNPJ"}
                          value={formState.businessDocument}
                          disabled={loadFunc}
                          placeholder={"00.000.000/0000-00"}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormState({
                              ...formState,
                              businessDocument: e.target.value,
                            })
                          }}
                        />
                      </div>
                      <div
                        className={`${handles.newOrganizationInput} mb5 flex flex-column`}
                      >
                        <Button onClick={() => {
                          const cnpj = formState.businessDocument
                          // I need to call sefaz API here >> and change certains states in form :D

                          handleSefazApi(cnpj)
                        }}> Consultar </Button>
                      </div>
                    </div>
                    {!lockFunc ?
                      <>
                        <div className='form-group-flex'>

                          <div
                            className={`${handles.newOrganizationInput} mb5 flex flex-column`}
                          >
                            <Dropdown
                              size="large"
                              label={"Público"}
                              options={[
                                { value: 'municipal', label: 'Municipal' },
                                { value: 'estadual', label: 'Estadual' },
                                { value: 'federal', label: 'Federal' }
                              ]}
                              value={formState.organizationPublic}
                              onChange={(__: any, value: string) => {
                                setFormState({
                                  ...formState,
                                  organizationPublic: value,
                                })
                              }}
                              required
                            />
                          </div>
                          <div></div>
                        </div>
                        <div className='form-group-flex'>

                          <div
                            className={`${handles.newOrganizationInput} mb5 flex flex-column`}
                          >
                            <Dropdown
                              size="large"
                              label={"Tipo de Pessoa Jurídica"}
                              options={[
                                { value: 'privado', label: 'Privado' },
                                { value: 'publica', label: 'Publica' }
                              ]}
                              value={formState.organizationType}
                              onChange={(__: any, value: string) => {
                                setFormState({
                                  ...formState,
                                  organizationType: value,
                                })
                              }}
                              required
                            />
                          </div>
                          <div></div>
                        </div>

                        <div
                          className={`${handles.newOrganizationInput} mb5 flex flex-column`}
                        >
                          <Input
                            autocomplete="off"
                            size="large"
                            label={"Razão Social"}
                            readonly={true}
                            value={formState.organizationName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setFormState({
                                ...formState,
                                organizationName: e.target.value,
                              })
                            }}
                            required
                          />
                        </div>
                        <div
                          className={`${handles.newOrganizationInput} ie-flex`}
                        >
                          <Input
                            autocomplete="off"
                            size="large"
                            label={"IE"}
                            disabled={formState.organizationIE == "Isento"}
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
                            label="Isento?"
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
                              label={"Sim"}
                              onChange={() => {
                                setFormState({
                                  ...formState,
                                  organizationICMS: true,
                                })
                              }}
                              value="option-0"
                            />
                            <Checkbox
                              checked={!formState.organizationICMS}
                              id="option-0"
                              name="default-checkbox-group"
                              label={"Não"}
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
                            label={"Área de atuação"}
                            options={[
                              { value: 'Option One', label: 'Option One' },
                              { value: 'Option Two', label: 'Option Two' },
                              { value: 'Option Three', label: 'Option Three' },
                              { value: 'Option Four', label: 'Option Four' },
                            ]}
                            value={'Option One'}
                            onChange={(__: any, value: string) => {
                              setFormState({
                                ...formState,
                                organizationType: value,
                              })
                            }}
                            required
                          />
                        </div>
                        <div className='form-group-flex'>

                          <div
                            className={`${handles.newOrganizationInput} mb5 flex flex-column`}
                          >
                            <Input
                              autocomplete="off"
                              size="large"
                              label={"Telefone"}
                              placeholder={"(00) 00000-0000"}
                              value={formState.organizationPhone}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setFormState({
                                  ...formState,
                                  organizationPhone: e.target.value,
                                })
                              }}
                              required
                            />
                          </div>
                          <div></div>
                        </div>
                      </>
                      : null
                    }
                  </PageBlock>
                  {!lockFunc ?
                    <>
                      <PageBlock
                        variation="full"
                        title={"Endereço"}
                        subtitle={"O endereço deve ser o mesmo do cadastro CNPJ, e será utilizado para entrega e cobrança."}
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
                        title={"Anexo de Comprovantes"}
                        subtitle={"Você pode anexar documentos para agilizar o processo de analise do cadastro da sua organização, como o Cartão CNPJ e outros (formatos aceitos: jpg, png ou pdf).\n\n Trabalhamos com itens de uso restrito, conforme legislação, por isso é necessário anexar o documento abaixo: Licença Sanitária Municipal Vigente"}
                      >
                        <div className='file-button'>
                          <label htmlFor={"documents"}>Escolher arquivos</label>
                          <input type={"file"} accept={'image/*, .pdf'} id={"documents"} name={"documents"} multiple />
                        </div>


                        <div
                          className={`${handles.newOrganizationInput}`}
                        >
                          <Checkbox
                            checked={formState.newsletter}
                            id="newsletter"
                            name="newsletter"
                            label={"Gostaria de receber newsletter com promoções mais sobre a Pardis"}
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
                            label={"Estou de acordo com os Termos e Condições e Políticas de Privacidade"}
                            onChange={() => {
                              setPermission(!permission)
                            }}
                            value="permission"
                          />
                        </div>
                      </PageBlock>
                    </>
                    : null
                  }
                </div>
                <div
                  className={`${handles.newOrganizationButtonsContainer} mb5 flex flex-column items-end pt6`}
                >
                  <div className="flex justify-content flex-row">
                    <div
                      className={`no-wrap ${handles.newOrganizationButtonSubmit}`}
                    >
                      {!lockFunc ?
                        <Button
                          variation="primary"
                          isLoading={formState.isSubmitting}
                          onClick={() => {
                            handleSubmit()
                          }}
                          disabled={
                            !formState.organizationName ||
                            !formState.defaultCostCenterName ||
                            !formState.firstName ||
                            !formState.lastName ||
                            !validateEmail(formState.email) ||
                            !isValidAddress(addressState) ||
                            !permission
                          }
                        >
                          Enviar Cadastro
                        </Button>
                        : null
                      }
                    </div>
                  </div>
                </div>
              </Fragment>
            )}
          </Fragment>
        )}
      </Layout>
    </div>
  )
}

export default RequestOrganizationForm
