import * as apollo from 'apollo-angular'
import { Apollo, ApolloModule } from 'apollo-angular'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { NgModule, ModuleWithProviders } from '@angular/core'
import { Auth } from 'aws-amplify'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { createAuthLink, AuthOptions } from 'aws-appsync-auth-link'
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link'

export const LOCAL_STORAGE_TOKEN_KEY = 'sputnik.api.token'

export class ApiProviderConfig {
	constructor (public url: string, public region: string, public auth?: AuthOptions) {}
}

@NgModule({
	imports: [
		ApolloModule,
	],
	providers: [
		Apollo,
	],
})
export class ApiProviderModule {
	static forRoot (config: ApiProviderConfig): ModuleWithProviders<ApiProviderModule> {
		return {
			ngModule: ApiProviderModule,
			providers: [
				{
					provide: ApiProviderConfig,
					useValue: config,
				},
			],
		}
	}

  protected token: string | null

  constructor (config: ApiProviderConfig, apollo: Apollo) {
  	this.token = window.localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) || null

  	config.auth = Object.assign({
  		type: 'AMAZON_COGNITO_USER_POOLS',
  		jwtToken: async () => {
  			if (this.token == null) {
  				const session = await Auth.currentSession()
  				this.token = session.getIdToken().getJwtToken()

  				window.localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, this.token)
  			}

  			return this.token
  		},
  	}, config.auth)

  	const links: ApolloLink[] = [
  		// TODO: implement better error handling and logging
  		onError(({ graphQLErrors, networkError }) => {
  			if (graphQLErrors) {
  				graphQLErrors.forEach(({ message, locations, path, ...errorProps }) => {
  					console.error(
  						`[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
  					)

  					if ((errorProps as any).errorType === 'UnauthorizedException') {
  						// likely "Token has expired."
  						console.error(`[UnauthorizedException]: ${message}`, 'Forcing page refresh')
  						window.localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
  						window.location.href = '/home/login'
  					}
  				})
  			}

  			if (networkError) {
  				console.error(`[Network Error]: ${networkError}`)
  			}
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
