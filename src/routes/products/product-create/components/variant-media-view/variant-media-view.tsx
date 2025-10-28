import { useState } from "react"
import { Button } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { StackedFocusModal } from "../../../../../components/modals"
import { EditVariantMediaForm } from "../edit-variant-media-form/edit-variant-media-form"
import { VariantMediaGallery } from "./components/variant-media-gallery/variant-media-gallery"
import { VariantMediaViewContext } from "./variant-media-view-context"

type VariantMediaViewProps = {
    variantId: string
    variantTitle?: string
    onSubmit?: () => void
    onClose?: () => void
}

enum View {
    GALLERY = "gallery",
    EDIT = "edit",
}

const getView = (currentView: string | undefined) => {
    if (currentView === View.EDIT) {
        return View.EDIT
    }
    return View.GALLERY
}

export const VariantMediaView = ({ variantId, variantTitle, onSubmit, onClose }: VariantMediaViewProps) => {
    const [currentView, setCurrentView] = useState<string | undefined>(View.EDIT)
    const view = getView(currentView)
    const { t } = useTranslation()

    const handleGoToView = (view: View) => {
        return () => {
            setCurrentView(view)
        }
    }

    const contextValue = {
        goToGallery: handleGoToView(View.GALLERY),
        goToEdit: handleGoToView(View.EDIT),
        onSubmit: onSubmit,
        onCancel: onClose,
        onClose: onClose,
    }

    return (
        <VariantMediaViewContext.Provider value={contextValue}>
            <StackedFocusModal.Content>
                <StackedFocusModal.Header>
                    {view === View.EDIT ? (
                        <Button variant="secondary" size="small" onClick={contextValue.goToGallery}>
                            {t("products.media.galleryLabel")}
                        </Button>
                    ) : (
                        <Button variant="secondary" size="small" onClick={contextValue.goToEdit}>
                            {t("products.media.editLabel")}
                        </Button>
                    )}
                </StackedFocusModal.Header>
                <StackedFocusModal.Body className="flex flex-col overflow-hidden">
                    {renderView(view, variantId, variantTitle, contextValue)}
                </StackedFocusModal.Body>
                {view === View.EDIT && (
                    <StackedFocusModal.Footer>
                        <div className="flex justify-end gap-x-2">
                            <Button variant="secondary" size="small" onClick={contextValue.onCancel}>
                                {t("actions.cancel")}
                            </Button>
                            <Button size="small" onClick={contextValue.onSubmit}>
                                {t("actions.save")}
                            </Button>
                        </div>
                    </StackedFocusModal.Footer>
                )}
            </StackedFocusModal.Content>
        </VariantMediaViewContext.Provider>
    )
}

const renderView = (view: View, variantId: string, variantTitle?: string, contextValue?: any) => {
    switch (view) {
        case View.GALLERY:
            return <VariantMediaGallery variantId={variantId} variantTitle={variantTitle} goToEdit={contextValue?.goToEdit} />
        case View.EDIT:
            return <EditVariantMediaForm variantId={variantId} variantTitle={variantTitle} onSubmit={contextValue?.onSubmit} onCancel={contextValue?.onCancel} />
    }
}
