import { SSO, SSOParameters } from '@/services/sso'

export interface UserProfile {
  displayName: string
  fullName: string
}

type FetchMethod = 'POST' | 'GET'

interface RequestOptions {
  use_referrer?: boolean
}

export class Garmin {
  private readonly USER_AGENT = 'GCM-iOS-5.7.2.1'
  private readonly BASE_URL = 'https://connectapi.garmin.com'

  ssoClient: SSO
  userProfile?: UserProfile

  last_url?: string

  constructor(ssoParams: SSOParameters) {
    this.ssoClient = new SSO(ssoParams)
  }

  static async getConsumerKeys() {
    const OAUTH_CONSUMER_URL =
      'https://thegarth.s3.amazonaws.com/oauth_consumer.json'

    const response = await fetch(OAUTH_CONSUMER_URL)

    return await response.json()
  }

  get displayName() {
    if (!this.userProfile) {
      throw new Error('Not logged in yet!')
    }

    return this.userProfile.displayName
  }

  get fullName() {
    if (!this.userProfile) {
      throw new Error('Not logged in yet!')
    }

    return this.userProfile.fullName
  }

  async login(username: string, password: string) {
    await this.ssoClient.login(username, password)

    await this.getProfile()
  }

  private async sendRequest(
    url: string,
    method: FetchMethod,
    requestOptions?: RequestOptions,
  ) {
    const headers: Record<string, string> = {
      'User-Agent': this.USER_AGENT,
      method,
    }

    if (!this.ssoClient.oauth2_token || !this.ssoClient.oauth2_expired) {
      await this.ssoClient.refreshOauth2Token()
    }

    headers['Authorization'] =
      `${this.ssoClient.oauth2_token?.token_type} ${this.ssoClient.oauth2_token?.access_token}`

    if (requestOptions?.use_referrer && this.last_url) {
      headers['referer'] = this.last_url
    }

    const response = await fetch(url, {
      headers,
    })

    this.last_url = url

    console.log('status', response.status)
    console.log('statustext', response.statusText)
    console.log('headers', response.headers)

    const data = await response.json()
    return data
  }

  private async getRequest(url: string, requestOptions?: RequestOptions) {
    return this.sendRequest(url, 'GET', requestOptions)
  }

  async getProfile() {
    const url = `${this.BASE_URL}/userprofile-service/userprofile/userProfileBase `

    const response = await this.getRequest(url)

    if (!response.displayName) {
      console.log(response)
      throw new Error('Failed to get user profile')
    }

    this.userProfile = {
      ...response,
      fullName: `${response.firstName} ${response.lastName}`,
    }
  }

  async getStepsData(date: Date) {
    const params = new URLSearchParams({
      date: date.toLocaleDateString('en-CA'),
    })

    let url = `${this.BASE_URL}/wellness-service/wellness/dailySummaryChart/${this.displayName}?${params}`

    return await this.getRequest(url)
  }

  async getDailySteps(start: Date, end?: Date) {
    const startDate = start.toLocaleDateString('en-CA')
    const endDate = end?.toLocaleDateString('en-CA') ?? '0'

    let url = `${this.BASE_URL}/usersummary-service/stats/steps/daily/${startDate}/${endDate}`

    return await this.getRequest(url)
  }
}
