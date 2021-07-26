/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import schemas from '../mdSchema'
import { toHash } from '../utils'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}

export const resolvers = {
  Routes: {},
  Mutation: {
    saveAppSettings: async (_: any, __: any, ctx: Context) => {
      const {
        clients: { apps },
      } = ctx

      const app: string = getAppId()

      const newSettings = {}

      try {
        await apps.saveAppSettings(app, newSettings)

        return { status: 'success', message: '' }
      } catch (e) {
        return { status: 'error', message: e }
      }
    },
  },
  Query: {
    getAppSettings: async (_: any, __: any, ctx: Context) => {
      const {
        clients: { apps, masterdata },
      } = ctx

      const app: string = getAppId()
      const settings = await apps.getAppSettings(app)

      if (!settings.adminSetup) {
        settings.adminSetup = {}
      }

      const currHash = toHash(schemas)

      if (
        !settings.adminSetup?.schemaHash ||
        settings.adminSetup?.schemaHash !== currHash
      ) {
        const updates: any = []

        schemas.forEach((schema) => {
          updates.push(
            masterdata
              .createOrUpdateSchema({
                dataEntity: schema.name,
                schemaName: schema.version,
                schemaBody: schema.body,
              })
              .then(() => true)
              .catch((e: any) => {
                if (e.response.status !== 304) {
                  throw e
                }

                return true
              })
          )
        })

        await Promise.all(updates)
          .then(() => {
            settings.adminSetup.schemaHash = currHash
          })
          .catch((e) => {
            if (e.response.status !== 304) {
              throw new Error(e)
            }
          })

        await apps.saveAppSettings(app, settings)
      }

      return settings
    },
  },
}
