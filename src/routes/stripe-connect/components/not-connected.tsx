import { ExclamationCircle } from "@medusajs/icons"
import { Button, Heading, Text } from "@medusajs/ui"
import { useCreateStripeAccount } from "../../../hooks/api"

export const NotConnected = () => {
  const { mutateAsync, isPending } = useCreateStripeAccount()

  return (
    <div className="flex items-center justify-center text-center my-32 flex-col">
      <ExclamationCircle />
      <Heading level="h2" className="mt-4">
        Not connected
      </Heading>
      <Text className="text-ui-fg-subtle" size="small">
        No stripe connection
      </Text>
      <Button
        isLoading={isPending}
        className="mt-4"
        onClick={() =>
          mutateAsync({
            context: {
              country: "US",
              // external_account: {
              //   object: 'bank_account',
              //   country: 'US',
              //   currency: 'usd',
              //   account_number: '000123456789',
              //   routing_number: '110000000',
              // },
            },
          })
        }
      >
        Connect Stripe
      </Button>
    </div>
  )
}
