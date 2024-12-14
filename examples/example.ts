import { Mpesa } from '../src/mpesa'

export const mpesa = new Mpesa({
    env: 'sandbox', // "sandbox" or "live"
    type: 4, // 2 or 4
    shortcode: 4657849,
    store: 4657849,
    key: 'MPESA_B2C_CONSUMER_KEY',
    secret: 'MPESA_B2C_CONSUMER_SECRET',
    username: 'USER_NAME',
    password: 'PASSWORD',
    certFolderPath: 'CERT_FOLDER_ABSOLUTE_PATH',
    passkey: 'MPESA_PASSKEY'
})

// Send a payment request through STK push
async function stkPush() {
    try {
        const { error, data } = await mpesa.stkPush({
            phone: '254712345678',
            product: `Shown in stk push message`,
            amount: 400,
            CallBackURL: `https://todo.com/api/v1/pay/stk/callback`, // Must be https secure
            description: `Description of this payment`
        })

        if (error) {
            throw new Error(error)
        }

        // Request has been accepted for processing, will receive callback request

        // Destructure the response
        const {
            MerchantRequestID,
            CheckoutRequestID,
            ResponseCode,
            ResponseDescription,
            CustomerMessage
        } = data
    } catch (error) {
        console.error(error)
    }
}

// Requires mpesa B2C account
// Check the status of a payment transaction
async function checkPaymentStatus(req: any) {
    try {
        const { code } = req.body

        const { data, error } = await mpesa.checkStatus({
            code,
            QueueTimeOutURL: `https://todo.com/api/v1/pay/status/timeout`,
            ResultURL: `https://todo.com/api/v1/pay/status/callback`
        })

        if (error) {
            throw new Error(error)
        }

        if (data) {
            // Request has been accepted for processing, will receive callback request
        }
    } catch (err: any) {
        console.error(err)
    }
}

// Requires mpesa B2C account
// Check mpesa all account balances
async function checkBalance() {
    try {
        const { data, error } = await mpesa.accountBalance({
            QueueTimeOutURL: `https://todo.com/api/v1/pay/balance/timeout`,
            ResultURL: `https://todo.com/api/v1/pay/balance/callback`
        })

        if (error) {
            throw new Error(error)
        }

        if (data) {
            // Request has been accepted for processing, will receive callback request
        }
    } catch (error) {
        console.error(error)
    }
}

// Requires mpesa B2C account
// Send money from business to customer
async function b2cPayment() {
    try {
        const { data, error } = await mpesa.sendB2C({
            PartyB: '254712345678',
            Amount: 5,
            CommandID: 'BusinessPayment',
            Occasion: 'Some message here',
            Remarks: `Some remarks here`,
            ResultURL: `https://todo.com/api/v1/pay/b2c/callback`,
            QueueTimeOutURL: `https://todo.com/api/v1/pay/b2c/timeout`
        })

        if (error) {
            throw new Error(error.message)
        }

        if (data.ResponseCode == '0') {
            // Request has been accepted for processing, will receive callback request
            const { ConversationID, OriginatorConversationID, ResponseCode, ResponseDescription } =
                data

        }
    } catch (error) {
        console.error(error)
    }
}
