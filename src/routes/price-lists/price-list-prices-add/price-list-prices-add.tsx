import { useParams } from "react-router-dom"
import { RouteFocusModal } from "../../../components/modals"
import { usePriceList } from "../../../hooks/api/price-lists"
import { usePriceListCurrencyData } from "../common/hooks/use-price-list-currency-data"
import { PriceListPricesAddForm } from "./components/price-list-prices-add-form"

export const PriceListProductsAdd = () => {
  const { id } = useParams<{ id: string }>()

  const { price_list, isPending, isError, error } = usePriceList(id!)
  const currencyData =
    usePriceListCurrencyData()

  const ready = currencyData.isReady && !isPending && !!price_list

  if (isError) {
    throw error
  }

  return (
    <RouteFocusModal>
      {ready && (
        <PriceListPricesAddForm
          priceList={price_list}
          currencies={currencyData.currencies}
          regions={currencyData.regions}
          pricePreferences={currencyData.pricePreferences}
        />
      )}
    </RouteFocusModal>
  )
}
