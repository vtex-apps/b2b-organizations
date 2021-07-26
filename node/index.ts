/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ServiceContext,
  ParamsContext,
  RecorderState,
  IOContext,
} from '@vtex/api'
import { Service } from '@vtex/api'

import { schemaDirectives } from './directives'

import { resolvers } from './resolvers'

declare global {
  type Context = ServiceContext
  interface CustomIOContext extends IOContext {
    currentProfile: CurrentProfile
  }

  interface CurrentProfile {
    email: string
    userId: string
  }

  interface State {
    code: number
  }
}

export default new Service<Context, RecorderState, ParamsContext>({
  graphql: {
    resolvers: {
      Query: resolvers.Query,
      Mutation: resolvers.Mutation,
    },
    schemaDirectives,
  },
  routes: {},
})
