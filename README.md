# mpesa

A functional simple mpesa node sdk, with typescript support
**Star me on [Github](https://github.com/zenetralabs/mpesa)**

## Installation

#### npm

```bash
npm install @zenetralabs/mpesa
```

#### yarn

```bash
yarn add @zenetralabs/mpesa
```

#### pnpm

```bash
pnpm add @zenetralabs/mpesa
```

## Usage

#### mpesa Config Setup

To use the mpesa sdk, you need to initialize it with your credentials. Consider storing all these
credentials in a `.env` file and using `dotenv` to load them into your application.

```typescript
import { Mpesa } from '@zenetralabs/mpesa'

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

// STK Push code
// B2C code
// Check Transaction Status code
// etc
```

#### STK Push

STK Push is a service that allows you to receive payments on the go from your customers. It is a
simple and secure way to receive payments from customers using M-Pesa. The service is available on
the Paybill and Buy Goods and Services platforms.

```typescript
import { Mpesa } from '@zenetralabs/mpesa'

// mpesa Config setup here

const { error, data } = await mpesa.stkPush({
    phone: '254712345678',
    product: `Shown in stk push message`,
    amount: 400,
    CallBackURL: `https://todo.com/api/v1/pay/stk/callback`, // Must be https secure
    description: `Description of this payment`
})
```

#### B2C

B2C is a service that allows you to send money to any mpesa mobile number in Kenya.

```typescript
import { Mpesa } from '@zenetralabs/mpesa'

// mpesa Config setup here

const { data, error } = await mpesa.sendB2C({
    PartyB: '254712345678',
    Amount: 5,
    CommandID: 'BusinessPayment',
    Occasion: 'Some message here',
    Remarks: `Some remarks here`,
    ResultURL: `https://todo.com/api/v1/pay/b2c/callback`,
    QueueTimeOutURL: `https://todo.com/api/v1/pay/b2c/timeout`
})
```

#### Check Transaction Status

Check the status of a transaction using the `TransactionID` returned from the `B2C` or `STK Push`
request.

```typescript
import { Mpesa } from '@zenetralabs/mpesa'

// mpesa Config setup here

const { data, error } = await mpesa.checkStatus({
    code: 'SJDK98K8H',
    QueueTimeOutURL: `https://todo.com/api/v1/pay/status/timeout`,
    ResultURL: `https://todo.com/api/v1/pay/status/callback`
})
```

#### Check mpesa business accounts Balance

Check the balance of your business account

```typescript
import { Mpesa } from '@zenetralabs/mpesa'

// mpesa Config setup here

const { data, error } = await mpesa.accountBalance({
    QueueTimeOutURL: `https://todo.com/api/v1/pay/balance/timeout`,
    ResultURL: `https://todo.com/api/v1/pay/balance/callback`
})
```

## Note (VERY IMPORTANT):

Please note that most of this code is basic. If you need something more detailed
check out the [zenetra labs oss docs](https://oss.zenetralabs.com/mpesa) for more details.

If you need original mpesa docs please see
[mpesa api documentation](https://developer.safaricom.co.ke/docs) for more details.


## License

[MIT](https://github.com/zenetralabs/mpesa/blob/main/LICENSE)

**Powered by [Zenetra Labs](https://zenetralabs.com)**
