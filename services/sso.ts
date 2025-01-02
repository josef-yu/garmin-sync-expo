import { Oauth, Oauth1Token, Oauth2Token } from '@/services/oauth'

export interface SSOParameters {
  consumerKey: string
  consumerSecret: string
  domain?: string
}

export class SSO {
  private readonly SSO_URL = 'https://sso.garmin.com/sso'
  private readonly SSO_EMBED_URL = `${this.SSO_URL}/embed`
  private readonly SSO_EMBED_PARAMS = {
    id: 'gauth-widget',
    embedWidget: 'true',
    gauthHost: this.SSO_URL,
  }

  private readonly SIGNIN_PARAMS = {
    ...this.SSO_EMBED_PARAMS,
    gauthHost: this.SSO_EMBED_URL,
    service: this.SSO_EMBED_URL,
    source: this.SSO_EMBED_URL,
    redirectAfterAccountLoginUrl: this.SSO_EMBED_URL,
    redirectAfterAccountCreationUrl: this.SSO_EMBED_URL,
  }

  private readonly USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
  private readonly API_USER_AGENT = 'com.garmin.android.apps.connectmobile'

  private csrfToken?: string
  private readonly OauthClient: Oauth

  domain = 'garmin.com'

  oauth1_token?: Oauth1Token
  oauth2_token?: Oauth2Token

  constructor(params: SSOParameters) {
    this.OauthClient = new Oauth(params.consumerKey, params.consumerSecret)

    this.domain = params.domain ?? 'garmin.com'
  }

  get oauth2_expired() {
    if (typeof this.oauth2_token === 'undefined') {
      throw new Error('No token found!')
    }

    return this.oauth2_token.expires_at < Date.now()
  }

  get oauth2_refresh_expired() {
    if (typeof this.oauth2_token === 'undefined') {
      throw new Error('No token found!')
    }

    return this.oauth2_token.refresh_token_expires_at < Date.now()
  }

  get isLoggedIn() {
    return Boolean(this.oauth1_token && this.oauth2_token)
  }

  private async getCookies() {
    const params = new URLSearchParams(this.SSO_EMBED_PARAMS)
    await fetch(`${this.SSO_EMBED_URL}?${params}`)
  }

  private async getCSRFToken() {
    const params = new URLSearchParams(this.SIGNIN_PARAMS)
    const CSRF_RE = /name="_csrf"\s+value="(.+?)"/

    const response = await fetch(
      `https://sso.garmin.com/sso/signin?${params}`,
      {
        referrer: 'https://sso.garmin.com/sso/embed' + params,
        credentials: 'same-origin',
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      },
    )

    const getResponseText = await response.text()

    const matches = getResponseText.match(CSRF_RE)

    if (!matches?.length || matches.length <= 1) {
      throw new Error('No CSRF Token found in response!')
    }

    this.csrfToken = matches[1]
  }

  private async getTicket(username: string, password: string) {
    if (typeof this.csrfToken === 'undefined') {
      throw new Error('Cannot get ticket. CSRF Token is missing.')
    }

    const formData = new FormData()

    const data = {
      'MIME Type': 'application/x-www-form-urlencoded',
      username,
      password,
      embed: 'true',
      _csrf: this.csrfToken,
    }

    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value)
    }

    const params = new URLSearchParams(this.SIGNIN_PARAMS)

    const signInResponse = await fetch(
      `https://sso.garmin.com/sso/signin?${params}`,
      {
        referrer: `https://sso.garmin.com/sso/signin?${params}`,
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'User-Agent': this.USER_AGENT,
        },
        body: formData,
      },
    )

    const TITLE_RE = /<title>(.+?)<\/title>/

    const signInResponseText = await signInResponse.text()
    const statusMatches = signInResponseText.match(TITLE_RE)

    if (!statusMatches || statusMatches.length <= 1) {
      throw new Error('Cannot determine sign in status.')
    }

    if (statusMatches[1] !== 'Success') {
      throw new Error('Unsuccessful signin')
    }

    const TICKET_RE = /embed\?ticket=([^"]+)"/
    const ticketMatches = signInResponseText.match(TICKET_RE)

    if (!ticketMatches || ticketMatches.length <= 1) {
      throw new Error('No ticket found in response!')
    }

    return ticketMatches[1]
  }

  private async getOauth1Token(ticket: string) {
    const params = new URLSearchParams({
      ticket,
      'login-url': this.SSO_EMBED_URL,
      'accepts-mfa-tokens': 'true',
    })

    const url = `https://connectapi.garmin.com/oauth-service/oauth/preauthorized?${params}`

    const headers = this.OauthClient.buildAuthHeader({
      method: 'GET',
      url,
    })

    const oauthResponse = await fetch(url, {
      headers: {
        'User-Agent': this.API_USER_AGENT,
        ...headers,
      },
    })

    const oauthResponseText = await oauthResponse.text()
    const oauthResponseQueryString = new URLSearchParams(oauthResponseText)
    const oauth_token = oauthResponseQueryString.get('oauth_token')
    const oauth_token_secret =
      oauthResponseQueryString.get('oauth_token_secret')

    if (
      !oauth_token ||
      !oauth_token_secret ||
      typeof oauth_token !== 'string' ||
      typeof oauth_token_secret !== 'string'
    ) {
      throw new Error('Failed to get oauth1 token!')
    }

    this.oauth1_token = {
      oauth_token,
      oauth_token_secret,
    }

    return this.oauth1_token
  }

  private async getOauth2Token() {
    if (typeof this.oauth1_token === 'undefined') {
      throw new Error('Oauth1 token is required!')
    }

    const url =
      'https://connectapi.garmin.com/oauth-service/oauth/exchange/user/2.0'

    const oauth2Headers = this.OauthClient.buildAuthHeader(
      {
        method: 'POST',
        url,
      },
      {
        secret: this.oauth1_token.oauth_token_secret,
        key: this.oauth1_token.oauth_token,
      },
    )

    const oauth2Response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'User-Agent': this.API_USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...oauth2Headers,
      },
    })

    const oauth2Data = await oauth2Response.json()
    const now = Date.now()

    this.oauth2_token = {
      ...oauth2Data,
      expires_at: now + oauth2Data.expires_in,
      refresh_token_expires_at: now + oauth2Data.refresh_token_expires_in,
    }

    return this.oauth2_token
  }

  async refreshOauth2Token() {
    await this.getOauth2Token()
  }

  async login(username: string, password: string) {
    if (
      this.oauth1_token &&
      this.oauth2_token &&
      !this.oauth2_expired &&
      !this.oauth2_refresh_expired
    ) {
      return
    }

    await this.getCookies()
    await this.getCSRFToken()

    const ticket = await this.getTicket(username, password)

    if (!this.oauth1_token) await this.getOauth1Token(ticket)

    if (
      !this.oauth2_token ||
      (this.oauth2_token &&
        (this.oauth2_expired || this.oauth2_refresh_expired))
    )
      await this.getOauth2Token()
  }
}
