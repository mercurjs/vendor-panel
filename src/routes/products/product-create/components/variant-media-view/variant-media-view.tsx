import { useContext, useState } from "react"
import { Button } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { StackedFocusModal } from "../../../../../components/modals"
import { EditVariantMediaForm } from "../edit-variant-media-form/edit-variant-media-form"
import { VariantMediaGallery } from "./components/variant-media-gallery/variant-media-gallery"
import { VariantMediaViewContext } from "./variant-media-view-context"

type VariantMediaViewProps = {
    variantIndex: number
    variantTitle?: string
    onSubmit?: () => void
    onClose?: () => void
    onSaveMedia?: (variantIndex: number, media: any[]) => void
    initialMedia?: any[]
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

export const VariantMediaView = ({ variantIndex, variantTitle, onSubmit, onClose, onSaveMedia, initialMedia }: VariantMediaViewProps) => {
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
                    {renderView(view, variantIndex, variantTitle, contextValue, onSaveMedia, initialMedia)}
                </StackedFocusModal.Body>
                {view === View.EDIT && (
                    <FooterButtons />
                )}
            </StackedFocusModal.Content>
        </VariantMediaViewContext.Provider>
    )
}

const FooterButtons = () => {
    const { t } = useTranslation()
    const context = useContext(VariantMediaViewContext)
    
    if (!context) return null
    
    return (
        <StackedFocusModal.Footer>
            <div className="flex justify-end gap-x-2">
                <Button variant="secondary" size="small" onClick={context.onCancel}>
                    {t("actions.cancel")}
                </Button>
                <Button size="small" onClick={context.onSubmit}>
                    {t("actions.save")}
                </Button>
            </div>
        </StackedFocusModal.Footer>
    )
}

const renderView = (view: View, variantIndex: number, variantTitle?: string, contextValue?: any, onSaveMedia?: (variantIndex: number, media: any[]) => void, initialMedia?: any[]) => {
    switch (view) {
        case View.GALLERY:
            return <VariantMediaGallery variantId={`variant-${variantIndex}`} variantTitle={variantTitle} goToEdit={contextValue?.goToEdit} variantMedia={initialMedia} />
        case View.EDIT:
            return <EditVariantMediaForm variantIndex={variantIndex} variantTitle={variantTitle} onSubmit={contextValue?.onSubmit} onCancel={contextValue?.onCancel} onSaveMedia={onSaveMedia} initialMedia={initialMedia} />
    }
}
