import {
  CircleHalfSolid,
  EllipsisHorizontal,
  Keyboard,
  OpenRectArrowOut,
  User as UserIcon,
  XMark,
} from "@medusajs/icons"
import {
  DropdownMenu,
  Heading,
  IconButton,
  Input,
  Kbd,
  Text,
  clx,
} from "@medusajs/ui"
import { Dialog as RadixDialog } from "radix-ui"
import { useTranslation } from "react-i18next"

import { Skeleton } from "../../common/skeleton"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useLogout, useUserMe } from "../../../hooks/api"
import { queryClient } from "../../../lib/query-client"
import { useGlobalShortcuts } from "../../../providers/keybind-provider/hooks"
import { useTheme } from "../../../providers/theme-provider"
import { ImageAvatar } from "../../common/image-avatar"

export const UserMenu = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const [openMenu, setOpenMenu] = useState(false)
  const [openModal, setOpenModal] = useState(false)

  const toggleModal = () => {
    setOpenMenu(false)
    setOpenModal(!openModal)
  }

  return (
    <div>
      <DropdownMenu open={openMenu} onOpenChange={setOpenMenu}>
        <UserBadge />
        <DropdownMenu.Content className="min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-[var(--radix-dropdown-menu-trigger-width)]">
          <UserItem />
          <DropdownMenu.Separator />
          <DropdownMenu.Item asChild>
            <Link to="/settings/profile" state={{ from: location.pathname }}>
              <UserIcon className="text-ui-fg-subtle mr-2" />
              {t("app.menus.user.profileSettings")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={toggleModal}>
            <Keyboard className="text-ui-fg-subtle mr-2" />
            {t("app.menus.user.shortcuts")}
          </DropdownMenu.Item>
          <ThemeToggle />
          <DropdownMenu.Separator />
          <Logout />
        </DropdownMenu.Content>
      </DropdownMenu>
      <GlobalKeybindsModal open={openModal} onOpenChange={setOpenModal} />
    </div>
  )
}

const UserBadge = () => {
  const { member, isPending, isError, error } = useUserMe()

  const displayName = member?.name || member?.email || ""

  const fallback = displayName ? displayName[0].toUpperCase() : null
  const avatar = member?.photo || ""

  if (isPending) {
    return (
      <button className="shadow-borders-base flex max-w-[192px] select-none items-center gap-x-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-full py-1 pl-1 pr-2.5">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-[9px] w-[70px]" />
      </button>
    )
  }

  if (isError) {
    throw error
  }

  return (
    <div className="p-3">
      <DropdownMenu.Trigger
        disabled={!member}
        className={clx(
          "bg-ui-bg-subtle grid w-full cursor-pointer grid-cols-[24px_1fr_15px] items-center gap-2 rounded-md py-1 pl-0.5 pr-2 outline-none",
          "hover:bg-ui-bg-subtle-hover",
          "data-[state=open]:bg-ui-bg-subtle-hover",
          "focus-visible:shadow-borders-focus"
        )}
      >
        <div className="flex size-7 items-center justify-center">
          {fallback ? (
            <ImageAvatar src={avatar || "/logo.svg"} size={7} rounded />
          ) : (
            <Skeleton className="h-6 w-6 rounded-full" />
          )}
        </div>
        <div className="flex items-center overflow-hidden">
          {displayName ? (
            <Text
              size="xsmall"
              weight="plus"
              leading="compact"
              className="truncate"
            >
              {displayName}
            </Text>
          ) : (
            <Skeleton className="h-[9px] w-[70px]" />
          )}
        </div>
        <EllipsisHorizontal className="text-ui-fg-muted" />
      </DropdownMenu.Trigger>
    </div>
  )
}

const ThemeToggle = () => {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu.SubMenu>
      <DropdownMenu.SubMenuTrigger className="rounded-md">
        <CircleHalfSolid className="text-ui-fg-subtle mr-2" />
        {t("app.menus.user.theme.label")}
      </DropdownMenu.SubMenuTrigger>
      <DropdownMenu.SubMenuContent>
        <DropdownMenu.RadioGroup value={theme}>
          <DropdownMenu.RadioItem
            value="system"
            onClick={(e) => {
              e.preventDefault()
              setTheme("system")
            }}
          >
            {t("app.menus.user.theme.system")}
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem
            value="light"
            onClick={(e) => {
              e.preventDefault()
              setTheme("light")
            }}
          >
            {t("app.menus.user.theme.light")}
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem
            value="dark"
            onClick={(e) => {
              e.preventDefault()
              setTheme("dark")
            }}
          >
            {t("app.menus.user.theme.dark")}
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.SubMenuContent>
    </DropdownMenu.SubMenu>
  )
}

const Logout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutateAsync: logoutMutation } = useLogout()

  const handleLogout = async () => {
    await logoutMutation(undefined, {
      onSuccess: () => {
        /**
         * When the user logs out, we want to clear the query cache
         */
        queryClient.clear()
        navigate("/login")
      },
    })
  }

  return (
    <DropdownMenu.Item onClick={handleLogout}>
      <div className="flex items-center gap-x-2">
        <OpenRectArrowOut className="text-ui-fg-subtle" />
        <span>{t("app.menus.actions.logout")}</span>
      </div>
    </DropdownMenu.Item>
  )
}

const GlobalKeybindsModal = (props: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { t } = useTranslation()
  const globalShortcuts = useGlobalShortcuts()

  const [searchValue, onSearchValueChange] = useState("")

  const searchResults = searchValue
    ? globalShortcuts.filter((shortcut) => {
        return shortcut.label.toLowerCase().includes(searchValue?.toLowerCase())
      })
    : globalShortcuts

  return (
    <RadixDialog.Root {...props}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="bg-ui-bg-overlay fixed inset-0" />
        <RadixDialog.Content className="bg-ui-bg-subtle shadow-elevation-modal fixed left-[50%] top-[50%] flex h-full max-h-[612px] w-full max-w-[560px] translate-x-[-50%] translate-y-[-50%] flex-col divide-y overflow-hidden rounded-lg">
          <div className="flex flex-col gap-y-3 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <RadixDialog.Title asChild>
                  <Heading>{t("app.menus.user.shortcuts")}</Heading>
                </RadixDialog.Title>
                <RadixDialog.Description className="sr-only"></RadixDialog.Description>
              </div>
              <div className="flex items-center gap-x-2">
                <Kbd>esc</Kbd>
                <RadixDialog.Close asChild>
                  <IconButton variant="transparent" size="small">
                    <XMark />
                  </IconButton>
                </RadixDialog.Close>
              </div>
            </div>
            <div>
              <Input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchValueChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col divide-y overflow-y-auto">
            {searchResults.map((shortcut, index) => {
              return (
                <div
                  key={index}
                  className="text-ui-fg-subtle flex items-center justify-between px-6 py-3"
                >
                  <Text size="small">{shortcut.label}</Text>
                  <div className="flex items-center gap-x-1">
                    {shortcut.keys.Mac?.map((key, index) => {
                      return (
                        <div className="flex items-center gap-x-1" key={index}>
                          <Kbd>{key}</Kbd>
                          {index < (shortcut.keys.Mac?.length || 0) - 1 && (
                            <span className="txt-compact-xsmall text-ui-fg-subtle">
                              {t("app.keyboardShortcuts.then")}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

const UserItem = () => {
  const { member, isPending, isError, error } = useUserMe()

  const loaded = !isPending && !!member

  if (!loaded) {
    return <div></div>
  }

  const name = member?.name || ""
  const email = member?.email || ""
  const avatar = member?.photo || ""

  if (isError) {
    throw error
  }

  return (
    <div className="flex items-center gap-x-3 overflow-hidden px-2 py-1">
      <div className="w-10">
        <ImageAvatar src={avatar || "/logo.svg"} size={8} rounded />
      </div>
      <div className="block w-full min-w-0 max-w-[187px] overflow-hidden whitespace-nowrap">
        <Text
          size="small"
          weight="plus"
          leading="compact"
          className="overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {name || email}
        </Text>
        {!!name && (
          <Text
            size="xsmall"
            leading="compact"
            className="text-ui-fg-subtle overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {email}
          </Text>
        )}
      </div>
    </div>
  )
}
