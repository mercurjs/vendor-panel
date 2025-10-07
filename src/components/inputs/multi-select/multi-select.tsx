import { Text, Badge, Input } from "@medusajs/ui"
import React, { useState, useRef, useEffect, useMemo, forwardRef } from "react"
import { useTranslation } from "react-i18next"
import { TrianglesMini, XMarkMini } from "@medusajs/icons"

type MultiSelectOption = {
    value: string
    label: string
}

type MultiSelectProps = {
    options: MultiSelectOption[]
    value: string[] | undefined
    onChange: (value: string[]) => void
    onBlur?: () => void
    name?: string
    placeholder?: string
    "aria-invalid"?: boolean
    disabled?: boolean
    className?: string
    showSearch?: boolean
}

const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(({
    options,
    value,
    onChange,
    onBlur,
    name,
    placeholder,
    "aria-invalid": ariaInvalid = false,
    disabled = false,
    className = "",
    showSearch = true,
}, ref) => {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const dropdownRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)
    const badgesContainerRef = useRef<HTMLDivElement>(null)
    const [visibleBadgesCount, setVisibleBadgesCount] = useState(0)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Calculate how many badges can fit
    const calculateVisibleBadges = () => {
        if (!value || value.length === 0 || !badgesContainerRef.current) {
            setVisibleBadgesCount(0)
            return
        }

        const container = badgesContainerRef.current
        const containerWidth = container.offsetWidth
        const padding = 24 // px-3 on both sides
        const gap = 8 // gap-2
        const availableWidth = containerWidth - padding

        // Estimate badge width based on option label length
        const estimateBadgeWidth = (label: string) => {
            // Base width for badge structure + text width estimation
            const baseWidth = 32 // Base badge width (padding, icon, etc.)
            const charWidth = 8 // Approximate character width
            return baseWidth + (label.length * charWidth)
        }

        let totalWidth = 0
        let count = 0

        for (let i = 0; i < value.length; i++) {
            const option = options.find(opt => opt.value === value[i])
            const optionLabel = option?.label || 'Unknown'
            const badgeWidth = estimateBadgeWidth(optionLabel) > 200 ? 235 : estimateBadgeWidth(optionLabel)

            if (totalWidth + badgeWidth + (count > 0 ? gap : 0) <= availableWidth) {
                totalWidth += badgeWidth + (count > 0 ? gap : 0)
                count++
            } else {
                break
            }
        }

        setVisibleBadgesCount(count)
    }

    useEffect(() => {
        calculateVisibleBadges()
    }, [value, options])

    // Handle resize events
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            calculateVisibleBadges()
        })

        if (badgesContainerRef.current) {
            resizeObserver.observe(badgesContainerRef.current)
        }

        return () => {
            resizeObserver.disconnect()
        }
    }, [value, options])

    const handleToggle = () => {
        if (disabled) return
        setIsOpen((prev) => !prev)
        if (!isOpen && showSearch) {
            setSearchValue("") // Clear search when opening
        }
    }

    const handleItemClick = (optionValue: string) => {
        const currentValue = value || []
        const isSelected = currentValue.includes(optionValue)
        if (isSelected) {
            onChange(currentValue.filter((val) => val !== optionValue))
        } else {
            onChange([...currentValue, optionValue])
        }
    }

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange([])
    }

    const handleRemoveBadge = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const currentValue = value || []
        onChange(currentValue.filter(val => val !== optionValue))
    }

    // Filter options based on search value
    const filteredOptions = useMemo(() => {
        if (!showSearch || !searchValue.trim()) {
            return options
        }
        return options.filter(option =>
            option.label.toLowerCase().includes(searchValue.toLowerCase())
        )
    }, [options, searchValue, showSearch])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    const handleClearSearch = () => {
        setSearchValue("")
    }

    return (
        <div ref={ref} className={`relative ${className}`}>
            <div
                ref={triggerRef}
                className={`relative flex h-10 w-full cursor-pointer items-center justify-between overflow-hidden rounded-md border bg-ui-bg-field text-ui-fg-base shadow-sm transition-colors duration-150 ease-in-out hover:bg-ui-bg-field-hover focus-within:ring-1 ${disabled
                    ? 'cursor-not-allowed opacity-50 bg-ui-bg-disabled'
                    : ariaInvalid
                        ? '!shadow-borders-error'
                        : 'border-ui-border-base focus-within:border-ui-border-interactive focus-within:ring-ui-ring-interactive'
                    }`}
                onClick={handleToggle}
                onBlur={onBlur}
                tabIndex={0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-invalid={ariaInvalid}
                aria-label={name}
            >
                <div ref={badgesContainerRef} className="flex items-center gap-2 px-3 py-2 flex-1 min-w-0">
                    {value && value.length > 0 ? (
                        <>
                            {value.slice(0, visibleBadgesCount).map((optionValue) => {
                                const option = options.find(opt => opt.value === optionValue)
                                return (
                                    <button
                                        key={optionValue}
                                        type="button"
                                        onClick={(e) => handleRemoveBadge(optionValue, e)}
                                        className="flex-shrink-0"
                                        disabled={disabled}
                                    >
                                        <Badge size="small" className="w-fit">
                                            <span className="text-ellipsis truncate max-w-[200px]">{option?.label || 'Unknown'}</span>
                                            <XMarkMini />
                                        </Badge>
                                    </button>
                                )
                            })}
                            {value && value.length > visibleBadgesCount && (
                                <Badge size="small" className="w-fit flex-shrink-0 bg-transparent border-none text-ui-fg-subtle px-0 txt-compact-small-plus">
                                    +{value.length - visibleBadgesCount}
                                </Badge>
                            )}
                        </>
                    ) : (
                        <Text className="text-ui-fg-subtle">{placeholder || t("general.selectValues")}</Text>
                    )}
                </div>
                <div className="flex h-full items-center justify-center">
                    {value && value.length > 0 && !disabled && (
                        <button
                            type="button"
                            className="flex h-full w-8 items-center justify-center"
                            onClick={handleClearAll}
                        >
                            <XMarkMini className="text-ui-fg-muted" />
                        </button>
                    )}
                    <span className="flex h-full w-8 items-center justify-center">
                        <TrianglesMini className="text-ui-fg-muted" />
                    </span>
                </div>
            </div>

            {isOpen && !disabled && (
                <div
                    ref={dropdownRef}
                    className="absolute z-10 mt-1 w-full max-h-60 overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-base shadow-lg"
                >
                    {/* Sticky search field */}
                    {showSearch && (
                        <div className="sticky top-0 z-10 bg-ui-bg-base border-b border-ui-border-base p-2">
                            <div className="relative">
                                <Input
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    placeholder={t("general.searchOptions")}
                                    className="w-full bg-transparent shadow-none focus:!shadow-none pr-8"
                                    autoFocus
                                />
                                {searchValue && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-ui-bg-base-hover rounded-md transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <XMarkMini className="h-4 w-4 text-ui-fg-muted" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Options list */}
                    <div className={`${showSearch ? 'max-h-48' : 'max-h-60'} overflow-y-auto`}>
                        {filteredOptions.length === 0 ? (
                            <div className="p-3 text-ui-fg-subtle txt-compact-small-plus">
                                {showSearch && searchValue.trim() ? t("general.noOptionsFound") : t("general.noOptionsAvailable")}
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const currentValue = value || []
                                const isSelected = currentValue.includes(option.value)
                                return (
                                    <div
                                        key={option.value}
                                        className={`flex cursor-pointer items-center px-1 py-1 hover:bg-ui-bg-base-hover`}
                                        onClick={() => handleItemClick(option.value)}
                                    >
                                        <div className="flex items-center flex-1 px-2 py-1.5 rounded-md relative">
                                            {isSelected && <span className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-1 bg-ui-fg-base rounded-full" />}
                                            <Text className="ml-6">{option.label}</Text>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
})

MultiSelect.displayName = "MultiSelect"

export default MultiSelect
export type { MultiSelectProps, MultiSelectOption }
