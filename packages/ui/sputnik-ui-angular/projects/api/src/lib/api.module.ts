import * as apollo from 'apollo-angular'
import { Apollo, ApolloModule } from 'apollo-angular'
import { InMemoryCache } from "apollo-cache-inmemory"
import { NgModule, ModuleWithProviders, NgZone, Provider } from '@angular/core'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { createAuthLink, AuthOptions } from 'aws-appsync-auth-link'
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link'
// import { ApiService } from './generated'

export class ApiProviderConfig {
  constructor(public url: string, public region: string, public auth?: AuthOptions) {}
}

@NgModule({
  imports: [
    ApolloModule,
  ],
  providers: [
    Apollo,
  ]
})
export class ApiProviderModule {
  static forRoot(config: ApiProviderConfig): ModuleWithProviders<ApiProviderModule> {
    return {
      ngModule: ApiProviderModule,
      providers: [
        {
          provide: ApiProviderConfig,
          useValue: config
        },
      ]
    }
  }

  constructor(config: ApiProviderConfig, apollo: Apollo) {
    config.auth = Object.assign({
      type: 'AMAZON_COGNITO_USER_POOLS',
      jwtToken: localStorage.getItem('token') || null,
    }, config.auth)

    const links: ApolloLink[] = [
      // TODO: implement better error handling and logging
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.error(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          )
        if (networkError) console.error(`[Network error]: ${networkError}`)
      }),
    ]

    // https://dev.to/danielbayerlein/migrate-apollo-from-v2-to-v3-in-conjunction-with-aws-appsync-16c0
    links.push(createAuthLink(config as Required<ApiProviderConfig>))
    links.push(createSubscriptionHandshakeLink(config as Required<ApiProviderConfig>))

    apollo.create({
      cache: new InMemoryCache(),
      link: ApolloLink.from(links),
    })
  }
}
