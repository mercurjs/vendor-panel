import { useTranslation } from "react-i18next"
import { RouteFocusModal, StackedFocusModal, useStackedModal } from "../../../components/modals"
import { useSalesChannels } from "../../../hooks/api"
import { useStore } from "../../../hooks/api/store"
import { ProductCreateForm } from "./components/product-create-form/product-create-form"
import { VariantMediaView } from "./components/variant-media-view/variant-media-view"

export const ProductCreate = () => {
  const { t } = useTranslation()

  const { store, isPending: isStorePending } = useStore()

  const { sales_channels, isPending: isSalesChannelPending } =
    useSalesChannels()

  const ready =
    !!store && !isStorePending && !!sales_channels && !isSalesChannelPending

  return (
    <RouteFocusModal>
      <RouteFocusModal.Title asChild>
        <span className="sr-only">{t("products.create.title")}</span>
      </RouteFocusModal.Title>
      <RouteFocusModal.Description asChild>
        <span className="sr-only">{t("products.create.description")}</span>
      </RouteFocusModal.Description>
      {ready && (
        <ProductCreateFormWithModal
          defaultChannel={sales_channels[0]}
          store={store}
        />
      )}
    </RouteFocusModal>
  )
}

// Wrapper component that includes both form and modal
const ProductCreateFormWithModal = ({
  defaultChannel,
  store
}: {
  defaultChannel: any
  store: any
}) => {
  const { setIsOpen } = useStackedModal()

  return (
    <>
      <ProductCreateForm
        defaultChannel={defaultChannel}
        store={store}
        onOpenMediaModal={() => setIsOpen("variant-media-modal", true)}
      />

      {/* Always render modal, but control visibility */}
      <StackedFocusModal
        id="variant-media-modal"
        onOpenChangeCallback={(open) => {
          if (!open) {
            setIsOpen("variant-media-modal", false)
          }
        }}
      >
        <VariantMediaView
          variantId="new-variant"
          variantTitle="Sample Variant"
          onClose={() => setIsOpen("variant-media-modal", false)}
          onSubmit={() => setIsOpen("variant-media-modal", false)}
        />
      </StackedFocusModal>
    </>
  )
}



