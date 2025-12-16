import {
  Combobox as PrimitiveCombobox,
  ComboboxDisclosure as PrimitiveComboboxDisclosure,
  ComboboxItem as PrimitiveComboboxItem,
  ComboboxItemCheck as PrimitiveComboboxItemCheck,
  ComboboxItemValue as PrimitiveComboboxItemValue,
  ComboboxPopover as PrimitiveComboboxPopover,
  ComboboxProvider as PrimitiveComboboxProvider,
  Separator as PrimitiveSeparator,
} from "@ariakit/react"
import {
  CheckMini,
  EllipseMiniSolid,
  PlusMini,
  TrianglesMini,
  XMarkMini,
} from "@medusajs/icons"
import { clx, Text, Badge } from "@medusajs/ui"
import { matchSorter } from "match-sorter"
import {
  ComponentPropsWithoutRef,
  CSSProperties,
  ForwardedRef,
  Fragment,
  ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"
import { useTranslation } from "react-i18next"

import { genericForwardRef } from "../../utilities/generic-forward-ref"

type ComboboxOption = {
  value: string
  label: string
  disabled?: boolean
}

type Value = string[] | string

const TABLUAR_NUM_WIDTH = 8
const TAG_BASE_WIDTH = 28

interface ComboboxProps<T extends Value = Value>
  extends Omit<ComponentPropsWithoutRef<"input">, "onChange" | "value"> {
  value?: T
  onChange?: (value?: T) => void
  searchValue?: string
  onSearchValueChange?: (value: string) => void
  options: ComboboxOption[]
  fetchNextPage?: () => void
  isFetchingNextPage?: boolean
  onCreateOption?: (value: string) => void
  noResultsPlaceholder?: ReactNode
  allowClear?: boolean
  forceHideInput?: boolean
}

const ComboboxImpl = <T extends Value = string>(
  {
    value: controlledValue,
    onChange,
    searchValue: controlledSearchValue,
    onSearchValueChange,
    options,
    className,
    placeholder,
    fetchNextPage,
    isFetchingNextPage,
    onCreateOption,
    noResultsPlaceholder,
    allowClear,
    forceHideInput,
    ...inputProps
  }: ComboboxProps<T>,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { t } = useTranslation()

  const comboboxRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const badgesContainerRef = useRef<HTMLDivElement>(null)
  const [visibleBadgesCount, setVisibleBadgesCount] = useState(0)

  useImperativeHandle(ref, () => comboboxRef.current!)

  const isValueControlled = controlledValue !== undefined
  const isSearchControlled = controlledSearchValue !== undefined

  const isArrayValue = Array.isArray(controlledValue)
  const emptyState = (isArrayValue ? [] : "") as T

  const [uncontrolledSearchValue, setUncontrolledSearchValue] = useState(
    controlledSearchValue || ""
  )
  const defferedSearchValue = useDeferredValue(uncontrolledSearchValue)

  const [uncontrolledValue, setUncontrolledValue] = useState<T>(emptyState)

  const searchValue = isSearchControlled
    ? controlledSearchValue
    : uncontrolledSearchValue
  const selectedValues = isValueControlled ? controlledValue : uncontrolledValue

  const handleValueChange = (newValues?: T) => {
    // check if the value already exists in options
    const exists = options
      .filter((o) => !o.disabled)
      .find((o) => {
        if (isArrayValue) {
          return newValues?.includes(o.value)
        }
        return o.value === newValues
      })

    // If the value does not exist in the options, and the component has a handler
    // for creating new options, call it.
    if (!exists && onCreateOption && newValues) {
      onCreateOption(newValues as string)
    }

    if (!isValueControlled) {
      setUncontrolledValue(newValues || emptyState)
    }

    if (onChange) {
      onChange(newValues)
    }

    setUncontrolledSearchValue("")
  }

  const handleSearchChange = (query: string) => {
    setUncontrolledSearchValue(query)

    if (onSearchValueChange) {
      onSearchValueChange(query)
    }
  }

  /**
   * Filter and sort the options based on the search value,
   * and whether the value is already selected.
   *
   * This is only used when the search value is uncontrolled.
   */
  const matches = useMemo(() => {
    if (isSearchControlled) {
      return []
    }

    if (forceHideInput) {
      return options
    }

    return matchSorter(options, defferedSearchValue, {
      keys: ["label"],
    })
  }, [options, defferedSearchValue, isSearchControlled, forceHideInput])

  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting) {
          fetchNextPage?.()
        }
      },
      { threshold: 1 }
    )
  )

  const lastOptionRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) {
        return
      }
      if (observer.current) {
        observer.current.disconnect()
      }
      if (node) {
        observer.current.observe(node)
      }
    },
    [isFetchingNextPage]
  )

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUncontrolledSearchValue("")
    }

    setOpen(open)
  }

  const hasValue = selectedValues?.length > 0

  const showTag = hasValue && isArrayValue
  const showSelected = showTag && !searchValue && !open

  const hideInput = forceHideInput || (!isArrayValue && hasValue && !open)
  const selectedLabel = options.find((o) => o.value === selectedValues)?.label

  const hidePlaceholder = showSelected || open

  // Calculate how many badges can fit (similar to MultiSelect)
  const calculateVisibleBadges = useCallback(() => {
    if (!isArrayValue || !Array.isArray(selectedValues) || selectedValues.length === 0 || !badgesContainerRef.current) {
      setVisibleBadgesCount(0)
      return
    }

    const container = badgesContainerRef.current
    if (!container || container.offsetWidth === 0) {
      setVisibleBadgesCount(0)
      return
    }

    const containerWidth = container.offsetWidth
    const padding = 16 // px-2 on both sides
    const gap = 8 // gap-2
    const availableWidth = containerWidth - padding

    // Estimate badge width based on option label length
    const estimateBadgeWidth = (label: string) => {
      const baseWidth = 32 // Base badge width (padding, icon, etc.)
      const charWidth = 8 // Approximate character width
      return baseWidth + Math.min(label.length * charWidth, 200) // Cap at 200px
    }

    let totalWidth = 0
    let count = 0

    for (let i = 0; i < selectedValues.length; i++) {
      const option = options.find(opt => opt.value === selectedValues[i])
      const optionLabel = option?.label || 'Unknown'
      const badgeWidth = estimateBadgeWidth(optionLabel)

      if (totalWidth + badgeWidth + (count > 0 ? gap : 0) <= availableWidth) {
        totalWidth += badgeWidth + (count > 0 ? gap : 0)
        count++
      } else {
        break
      }
    }

    setVisibleBadgesCount(count)
  }, [isArrayValue, selectedValues, options])

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      calculateVisibleBadges()
    })
  }, [calculateVisibleBadges])

  // Handle resize events
  useEffect(() => {
    if (!badgesContainerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleBadges()
    })

    resizeObserver.observe(badgesContainerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [calculateVisibleBadges])

  const tagWidth = useMemo(() => {
    if (!Array.isArray(selectedValues)) {
      return TAG_BASE_WIDTH + TABLUAR_NUM_WIDTH // There can only be a single digit
    }

    const count = selectedValues.length
    const digits = count.toString().length

    return TAG_BASE_WIDTH + digits * TABLUAR_NUM_WIDTH
  }, [selectedValues])

  const results = useMemo(() => {
    return isSearchControlled ? options : matches
  }, [matches, options, isSearchControlled])

  return (
    <PrimitiveComboboxProvider
      open={open}
      setOpen={handleOpenChange}
      selectedValue={selectedValues}
      setSelectedValue={(value) => handleValueChange(value as T)}
      value={uncontrolledSearchValue}
      setValue={(query) => {
        startTransition(() => handleSearchChange(query))
      }}
    >
      <div
        className={clx(
          "relative flex cursor-pointer items-center gap-x-2 overflow-hidden",
          "h-8 w-full rounded-md",
          "bg-ui-bg-field transition-fg shadow-borders-base",
          "has-[input:focus]:shadow-borders-interactive-with-active",
          "has-[:invalid]:shadow-borders-error has-[[aria-invalid=true]]:shadow-borders-error",
          "has-[:disabled]:bg-ui-bg-disabled has-[:disabled]:text-ui-fg-disabled has-[:disabled]:cursor-not-allowed",
          className
        )}
        style={
          {
            "--tag-width": `${tagWidth}px`,
          } as CSSProperties
        }
      >
        <div ref={badgesContainerRef} className="relative flex items-center gap-2 px-2 flex-1 min-w-0 overflow-hidden h-full">
          {isArrayValue && Array.isArray(selectedValues) && selectedValues.length > 0 ? (
            <>
              {selectedValues.slice(0, visibleBadgesCount).map((optionValue) => {
                const option = options.find(opt => opt.value === optionValue)
                return (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const newValues = (selectedValues as string[]).filter(val => val !== optionValue)
                      handleValueChange(newValues as T)
                    }}
                    className="flex-shrink-0 z-10 relative flex items-center self-center"
                    disabled={inputProps.disabled}
                  >
                    <Badge size="2xsmall" className="w-fit flex items-center">
                      <span className="text-ellipsis truncate max-w-[200px]">{option?.label || 'Unknown'}</span>
                      <XMarkMini />
                    </Badge>
                  </button>
                )
              })}
              {selectedValues.length > visibleBadgesCount && (
                <Badge size="2xsmall" className="w-fit flex-shrink-0 bg-transparent border-none text-ui-fg-subtle px-0 txt-compact-small-plus z-10 relative flex items-center self-center">
                  +{selectedValues.length - visibleBadgesCount}
                </Badge>
              )}
            </>
          ) : showTag ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                handleValueChange(isArrayValue ? ([] as unknown as T) : undefined)
              }}
              className="bg-ui-bg-base hover:bg-ui-bg-base-hover txt-compact-small-plus text-ui-fg-subtle focus-within:border-ui-fg-interactive transition-fg flex h-[28px] items-center rounded-[4px] border py-[3px] pe-1 ps-1.5 outline-none"
            >
              <span className="tabular-nums">{selectedValues.length}</span>
              <XMarkMini className="text-ui-fg-muted" />
            </button>
          ) : null}
          {hideInput && !isArrayValue && (
            <div className="pointer-events-none flex size-full items-center overflow-hidden">
              <Text size="small" leading="compact" className="truncate">
                {selectedLabel}
              </Text>
            </div>
          )}
          <PrimitiveCombobox
            autoSelect
            ref={comboboxRef}
            onFocus={() => setOpen(true)}
            className={clx(
              "txt-compact-small text-ui-fg-base !placeholder:text-ui-fg-muted transition-fg size-full cursor-pointer bg-transparent pe-8 outline-none focus:cursor-text",
              "hover:bg-ui-bg-field-hover",
              {
                "opacity-0": hideInput && !isArrayValue,
                "ps-2": !showTag && !isArrayValue,
                "absolute inset-0": isArrayValue && Array.isArray(selectedValues) && selectedValues.length > 0,
              }
            )}
            placeholder={isArrayValue && Array.isArray(selectedValues) && selectedValues.length > 0 ? undefined : (hidePlaceholder ? undefined : placeholder)}
            {...inputProps}
          />
        </div>
        {allowClear && controlledValue && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              handleValueChange(undefined)
            }}
            className="bg-ui-bg-base hover:bg-ui-bg-base-hover txt-compact-small-plus text-ui-fg-subtle focus-within:border-ui-fg-interactive transition-fg absolute end-[28px] top-0.5 z-[1] flex h-[28px] items-center rounded-[4px] border px-1.5 py-[2px] outline-none"
          >
            <XMarkMini className="text-ui-fg-muted" />
          </button>
        )}
        <PrimitiveComboboxDisclosure
          render={(props) => {
            return (
              <button
                {...props}
                type="button"
                className="text-ui-fg-muted transition-fg hover:bg-ui-bg-field-hover absolute end-0 flex size-8 items-center justify-center rounded-r outline-none"
              >
                <TrianglesMini />
              </button>
            )
          }}
        />
      </div>
      <PrimitiveComboboxPopover
        gutter={4}
        sameWidth
        ref={listboxRef}
        role="listbox"
        className={clx(
          "shadow-elevation-flyout bg-ui-bg-base z-50 rounded-[8px] p-1",
          "max-h-[200px] overflow-y-auto",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=start]:slide-in-from-end-2 data-[side=end]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2"
        )}
        style={{
          pointerEvents: open ? "auto" : "none",
        }}
        aria-busy={isPending}
      >
        {results.map(({ value, label, disabled }) => (
          <PrimitiveComboboxItem
            key={value}
            value={value}
            focusOnHover
            setValueOnClick={false}
            disabled={disabled}
            className={clx(
              "transition-fg bg-ui-bg-base data-[active-item=true]:bg-ui-bg-base-hover group flex cursor-pointer items-center gap-x-2 rounded-[4px] px-2 py-1",
              {
                "text-ui-fg-disabled": disabled,
                "bg-ui-bg-component": disabled,
              }
            )}
          >
            <PrimitiveComboboxItemCheck className="flex !size-5 items-center justify-center">
              {isArrayValue ? <CheckMini /> : <EllipseMiniSolid />}
            </PrimitiveComboboxItemCheck>
            <PrimitiveComboboxItemValue className="txt-compact-small">
              {label}
            </PrimitiveComboboxItemValue>
          </PrimitiveComboboxItem>
        ))}
        {!!fetchNextPage && <div ref={lastOptionRef} className="w-px" />}
        {isFetchingNextPage && (
          <div className="transition-fg bg-ui-bg-base flex items-center rounded-[4px] px-2 py-1.5">
            <div className="bg-ui-bg-component size-full h-5 w-full animate-pulse rounded-[4px]" />
          </div>
        )}
        {!results.length &&
          (noResultsPlaceholder && !searchValue?.length ? (
            noResultsPlaceholder
          ) : (
            <div className="flex items-center gap-x-2 rounded-[4px] px-2 py-1.5">
              <Text
                size="small"
                leading="compact"
                className="text-ui-fg-subtle"
              >
                {t("general.noResultsTitle")}
              </Text>
            </div>
          ))}
        {!results.length && onCreateOption && (
          <Fragment>
            <PrimitiveSeparator className="bg-ui-border-base -mx-1" />
            <PrimitiveComboboxItem
              value={uncontrolledSearchValue}
              focusOnHover
              setValueOnClick={false}
              className="transition-fg bg-ui-bg-base data-[active-item=true]:bg-ui-bg-base-hover group mt-1 flex cursor-pointer items-center gap-x-2 rounded-[4px] px-2 py-1.5"
            >
              <PlusMini className="text-ui-fg-subtle" />
              <Text size="small" leading="compact">
                {t("actions.create")} &quot;{searchValue}&quot;
              </Text>
            </PrimitiveComboboxItem>
          </Fragment>
        )}
      </PrimitiveComboboxPopover>
    </PrimitiveComboboxProvider>
  )
}

export const Combobox = genericForwardRef(ComboboxImpl)
