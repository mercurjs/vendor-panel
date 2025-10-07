import { Plus } from "@medusajs/icons"
import { useEffect, useRef, useState } from "react"
import { Controller, ControllerRenderProps } from "react-hook-form"
import { Thumbnail } from "../../common/thumbnail"
import { useDataGridCell, useDataGridCellError } from "../hooks"
import { DataGridCellProps, InputProps } from "../types"
import { DataGridCellContainer } from "./data-grid-cell-container"

export type MediaData = {
    id?: string
    url: string
    isThumbnail: boolean
    file?: File | null
}

export const DataGridMediaCell = <TData, TValue = MediaData[]>({
    context,
    onOpenMediaModal,
    disabled,
    ...rest
}: DataGridCellProps<TData, TValue> & {
    onOpenMediaModal?: () => void
    disabled?: boolean
}) => {
    const { field, control, renderProps } = useDataGridCell({
        context,
    })
    const errorProps = useDataGridCellError({ context })

    const { container, input } = renderProps

    return (
        <Controller
            control={control}
            name={field}
            render={({ field }) => {
                return (
                    <DataGridCellContainer
                        {...container}
                        {...errorProps}
                        outerComponent={
                            <OuterComponent
                                isAnchor={container.isAnchor}
                                onOpenMediaModal={onOpenMediaModal}
                                disabled={disabled}
                            />
                        }
                    >
                        <Inner field={field} inputProps={input} disabled={disabled} {...rest} />
                    </DataGridCellContainer>
                )
            }}
        />
    )
}

const OuterComponent = ({
    isAnchor,
    onOpenMediaModal,
    disabled,
}: {
    isAnchor: boolean
    onOpenMediaModal?: () => void
    disabled?: boolean
}) => {
    const buttonRef = useRef<HTMLButtonElement>(null)


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isAnchor && e.key === "Enter" && onOpenMediaModal && !disabled) {
                e.preventDefault()
                onOpenMediaModal()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isAnchor, onOpenMediaModal, disabled])

    return (
        <div className="absolute inset-y-0 right-4 z-[3] flex w-fit items-center justify-center">
            <button
                ref={buttonRef}
                type="button"
                onClick={onOpenMediaModal}
                className="transition-fg txt-compact-small-plus rounded-[4px] outline-none text-ui-fg-interactive hover:text-ui-fg-interactive-hover focus-visible:shadow-borders-focus flex items-center justify-center p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!onOpenMediaModal || disabled}
            >
                <Plus className={disabled ? "text-ui-fg-muted" : undefined} />
            </button>
        </div>
    )
}

const Inner = ({
    field,
    inputProps,
    disabled,
}: {
    field: ControllerRenderProps<any, string>
    inputProps: InputProps
    disabled?: boolean
}) => {
    const { ref, value, onChange: _, onBlur, ...fieldProps } = field
    const {
        ref: inputRef,
        onChange,
        onBlur: onInputBlur,
        onFocus,
    } = inputProps

    const [localValue, setLocalValue] = useState<MediaData[]>(value || [])

    useEffect(() => {
        setLocalValue(value || [])
    }, [value])

    const combinedRefs = useCombinedRefs(inputRef, ref)

    const handleOnChange = () => {
        onChange(localValue, value)
    }

    // TODO: Add uploaded media display

    // Get the primary thumbnail for display
    const thumbnailMedia = localValue.find(media => media.isThumbnail) || localValue[0]

    return (
        <div className={`flex size-full items-center gap-x-2 ${disabled ? 'opacity-50' : ''}`} {...fieldProps}>
            <div
                ref={combinedRefs}
                className={`flex items-center gap-2 justify-between h-full py-2.5 flex-1 ${disabled ? 'cursor-not-allowed' : 'cursor-default'}`}
                onFocus={disabled ? undefined : onFocus}
                onBlur={disabled ? undefined : () => {
                    onBlur()
                    onInputBlur()
                    handleOnChange()
                }}
                tabIndex={disabled ? -1 : -1}
            >
                <Thumbnail
                    src={thumbnailMedia?.url}
                    alt={thumbnailMedia?.url ? "Product image" : undefined}
                />
            </div>
        </div>
    )
}

// Helper function to combine refs
function useCombinedRefs<T extends HTMLElement>(...refs: React.Ref<T>[]): React.Ref<T> {
    return (value: T | null) => {
        refs.forEach(ref => {
            if (typeof ref === 'function') {
                ref(value)
            } else if (ref) {
                ; (ref as React.MutableRefObject<T | null>).current = value
            }
        })
    }
}
