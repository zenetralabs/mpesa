import axios, { AxiosInstance } from 'axios'
import { MpesaConfigType } from './types'
import * as constants from 'constants'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

export class Service {
    private http: AxiosInstance
    public token: string | null = null

    /**
     * @param object config Configuration options
     */
    public config: MpesaConfigType = {
        env: 'sandbox',
        type: 4,
        shortcode: 174379,
        store: 174379,
        key: '9v38Dtu5u2BpsITPmLcXNWGMsjZRWSTG',
        secret: 'bclwIPkcRqw61yUt',
        username: 'apitest',
        password: '',
        certFolderPath: '',
        passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
    }
    /**
     * Setup global configuration for classes
     * @param Array configs Formatted configuration options
     *
     * @return void
     */
    constructor(configs: MpesaConfigType) {
        this.config = configs

        this.http = axios.create({
            baseURL:
                this.config.env === 'live'
                    ? 'https://api.safaricom.co.ke'
                    : 'https://sandbox.safaricom.co.ke',
            withCredentials: true
        })

        this.http.defaults.headers.common = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    }

    public async generateSecurityCredential() {
        return crypto
            .publicEncrypt(
                {
                    key: fs.readFileSync(
                        path.join(this.config.certFolderPath, this.config.env, 'cert.cer'),
                        'utf8'
                    ),
                    padding: constants.RSA_PKCS1_PADDING
                },

                Buffer.from(this.config.password)
            )
            .toString('base64')
    }

    /**
     * Perform a GET request to the M-PESA Daraja API
     * @param endpoint Daraja API URL Endpoint
     * @param credentials Formated Auth credentials
     *
     * @return string/bool
     */
    public async get(endpoint: string) {
        const auth =
            'Basic ' + Buffer.from(`${this.config.key}:${this.config.secret}`).toString('base64')

        return await this.http.get(endpoint, {
            headers: {
                Authorization: auth
            }
        })
    }

    /**
     * Perform a POST request to the M-PESA Daraja API
     * @param endpoint Daraja API URL Endpoint
     * @param Array data Formated array of data to send
     *
     * @return string/bool
     */
    public async post(endpoint: string, payload: any): Promise<any> {
        try {
            let data = await this.get('oauth/v1/generate?grant_type=client_credentials')
            this.token = data.data.access_token

            let response = await this.http.post(endpoint, payload, {
                headers: {
                    Authorization: 'Bearer ' + this.token
                }
            })

            return response.data
        } catch (err: any) {
            if (err.response.data) {
                return err.response.data
            } else {
                console.log(JSON.stringify(err))
                return { errorCode: 500, errorMessage: err.message }
            }
        }
    }
}
