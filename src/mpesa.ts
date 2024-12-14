import crypto from 'crypto'
import { format } from 'date-fns'
import { Service } from './service'
import { MpesaResponseType, B2CCommandsType, MpesaConfigType, ResponseTypeType } from './types'

export class Mpesa {
    protected service: Service

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
        const defaults: MpesaConfigType = {
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

        if (!configs || !configs.store || configs.type == 4) {
            configs.store = configs.shortcode
        }

        this.config = { ...defaults, ...configs }

        this.service = new Service(this.config)
    }

    /**
     * @param phone The MSISDN sending the funds.
     * @param amount The amount to be transacted.
     * @param reference Used with M-Pesa PayBills.
     * @param description A description of the transaction.
     * @param remark Remarks
     *
     * @return Promise<MpesaResponseType> Response
     */
    public async stkPush({
        phone,
        amount,
        product,
        CallBackURL,
        description = 'description'
    }: {
        phone: string | number
        amount: number
        product: string
        CallBackURL: string
        description: string
    }): Promise<MpesaResponseType> {
        phone = '254' + String(phone).slice(-9)

        const timestamp = format(new Date(), 'yyyyMMddHHmmss')
        const password = Buffer.from(
            this.config.shortcode + this.config.passkey + timestamp
        ).toString('base64')

        const response = await this.service.post('mpesa/stkpush/v1/processrequest', {
            BusinessShortCode: this.config.shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType:
                Number(this.config.type) == 4 ? 'CustomerPayBillOnline' : 'CustomerBuyGoodsOnline',
            Amount: Number(amount),
            PartyA: phone,
            PartyB: this.config.store,
            PhoneNumber: phone,
            CallBackURL,
            AccountReference: product.toUpperCase(),
            TransactionDesc: description
        })

        if (response.MerchantRequestID) {
            return { data: response, error: null }
        }

        if (response.errorCode) {
            return { data: null, error: response }
        }

        return response
    }

    public async registerUrls(
        ConfirmationURL: string,
        ValidationURL: string,
        response_type: ResponseTypeType = 'Completed'
    ): Promise<MpesaResponseType> {
        const response = await this.service.post('mpesa/c2b/v1/registerurl', {
            ShortCode: this.config.store,
            ResponseTypeType: response_type,
            ConfirmationURL,
            ValidationURL
        })

        if (response.errorCode) {
            return { data: null, error: response }
        }

        if (response.MerchantRequestID) {
            return { data: response, error: null }
        }

        return response
    }

    /**
     * Transfer funds between two paybills
     * @param receiver Receiving party phone
     * @param amount Amount to transfer
     * @param command Command ID
     * @param occassion
     * @param remarks
     *
     * @return Promise<any>
     */
    public async sendB2C({
        PartyB,
        Amount,
        CommandID,
        QueueTimeOutURL,
        ResultURL,
        Remarks = '',
        Occasion = ''
    }: {
        PartyB: string | number
        Amount: number
        CommandID: B2CCommandsType
        QueueTimeOutURL: string
        ResultURL: string
        Remarks?: string
        Occasion?: string
    }): Promise<MpesaResponseType> {
        PartyB = '254' + String(PartyB).slice(-9)

        const response = await this.service.post('mpesa/b2c/v1/paymentrequest', {
            OriginatorConversationID: crypto.randomUUID(),
            InitiatorName: this.config.username,
            SecurityCredential: await this.service.generateSecurityCredential(),
            CommandID,
            Amount,
            PartyA: this.config.shortcode,
            PartyB,
            Remarks,
            QueueTimeOutURL,
            ResultURL,
            Occasion
        })

        if (response.OriginatorConversationID) {
            return { data: response, error: null }
        }

        if (response.ResultCode && response.ResultCode !== 0) {
            return {
                data: null,
                error: {
                    errorCode: response.ResultCode,
                    errorMessage: response.ResultDesc
                }
            }
        }

        if (response.errorCode) {
            return { data: null, error: response }
        }

        return response
    }

    /**
     * Get Status of a Transaction
     *
     * @param code - Mpesa Transaction code e.g OEI2AK4Q16
     * @param remarks - Remarks (Optional)
     * @param occassion - Occasion (Optional)
     * @param QueueTimeOutURL - URL to hit when the transaction times out
     * @param ResultURL - URL to hit when the transaction is complete
     *
     * @return Promise<any> Result
     */
    public async checkStatus({
        code,
        QueueTimeOutURL,
        ResultURL,
        remarks = 'Check transaction',
        occasion = 'Check transaction'
    }: {
        code: string
        QueueTimeOutURL: string
        ResultURL: string
        remarks?: string
        occasion?: string
    }): Promise<MpesaResponseType> {
        const response = await this.service.post('mpesa/transactionstatus/v1/query', {
            Initiator: this.config.username,
            SecurityCredential: await this.service.generateSecurityCredential(),
            CommandID: 'TransactionStatusQuery',
            TransactionID: code,
            PartyA: this.config.shortcode,
            IdentifierType: '4',
            ResultURL,
            QueueTimeOutURL,
            Remarks: remarks,
            Occasion: occasion
        })

        if (response.ResponseCode == 0) {
            return { data: response, error: null }
        }

        if (response.errorCode) {
            return { data: null, error: response }
        }

        return response
    }

    /**
     * Get Account Balance
     * @param resultURL - URL to hit when the transaction is complete
     * @param queueTimeOutURL - URL to hit when the transaction times out
     */
    public async accountBalance({
        ResultURL,
        QueueTimeOutURL
    }: {
        ResultURL: string
        QueueTimeOutURL: string
    }): Promise<MpesaResponseType> {
        const response = await this.service.post('mpesa/accountbalance/v1/query', {
            Initiator: this.config.username,
            SecurityCredential: await this.service.generateSecurityCredential(),
            CommandID: 'AccountBalance',
            PartyA: this.config.shortcode,
            IdentifierType: '4',
            Remarks: 'ok',
            QueueTimeOutURL,
            ResultURL
        })

        if (response.ResponseCode == 0) {
            return { data: response, error: null }
        }

        if (response.errorCode) {
            return { data: null, error: response }
        }

        return response
    }
}
