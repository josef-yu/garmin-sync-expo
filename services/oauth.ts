import oauth1a, { RequestOptions, Token } from 'oauth-1.0a'
import crypto from 'crypto-js'

export class Oauth {
  client: OAuth

  constructor(consumer_key: string, consumer_secret: string) {
    this.client = new oauth1a({
      consumer: { key: consumer_key, secret: consumer_secret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.algo.HMAC.create(crypto.algo.SHA1, key)
          .update(base_string)
          .finalize()
          .toString(crypto.enc.Base64)
      },
    })
  }

  buildAuthHeader(request_options: RequestOptions, token?: Token) {
    const authorization = this.client.authorize(request_options, token)

    return this.client.toHeader(authorization)
  }
}

export interface Oauth1Token {
  oauth_token: string
  oauth_token_secret: string
}

export interface Oauth2Token {
  token_type: string
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
  refresh_token_expires_in: number
  refresh_token_expires_at: number
}
