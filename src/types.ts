export type MpesaResponseType = { data: any; error: any }

export type ResponseTypeType = 'Completed' | 'Cancelled'

export type B2BCommandsType =
    | 'BusinessPayBill'
    | 'BusinessBuyGoods'
    | 'DisburseFundsToBusiness'
    | 'BusinessToBusinessTransfer'
    | 'MerchantToMerchantTransfer'

export type B2CCommandsType = 'BusinessPayment' | 'SalaryPayment' | 'PromotionPayment'

export type MpesaConfigType = {
    env: 'sandbox' | 'live'
    type: number
    shortcode: number
    store: number | null
    key: string
    secret: string
    username: string
    password: string
    passkey: string
    certFolderPath: string
}

export type MpesaSTKResponseType = {
    MerchantRequestID: string | null
    CheckoutRequestID: string | null
    ResponseCode: number | null
    ResponseDescription: string | null
    CustomerMessage: string | null
    errorCode?: number | null
    errorMessage?: string | null
}
