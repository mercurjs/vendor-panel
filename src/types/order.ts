export type OrderPaymentStatus =
  | "pending"
  | "captured"
  | "partially_refunded"
  | "refunded"

export interface OrderCommission {
  commission_value: {
    amount: string
    currency_code: string
  }
}
