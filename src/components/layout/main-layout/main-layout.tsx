import {
  Buildings,
  ChatBubbleLeftRight,
  ChevronDownMini,
  CogSixTooth,
  Component,
  CurrencyDollar,
  ListCheckbox,
  MagnifyingGlass,
  MinusMini,
  ReceiptPercent,
  ShoppingCart,
  Star,
  Tag,
  Users,
} from "@medusajs/icons";
import { Avatar, Divider, Text, clx } from "@medusajs/ui";

import { useUnreads } from "@talkjs/react";
import { Collapsible as RadixCollapsible } from "radix-ui";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import isB2B from "@lib/is-b2b";

import { StripeIcon } from "../../../assets/icons/Stripe";
import { useMe } from "../../../hooks/api";
import { useSearch } from "../../../providers/search-provider";
import { ImageAvatar } from "../../common/image-avatar";
import { Skeleton } from "../../common/skeleton";
import { INavItem, NavItem } from "../../layout/nav-item";
import { Shell } from "../../layout/shell";
import { UserMenu } from "../user-menu";

export const MainLayout = () => {
  return (
    <Shell>
      <MainSidebar />
    </Shell>
  );
};

const MainSidebar = () => {
  return (
    <aside className="flex flex-1 flex-col justify-between overflow-y-auto">
      <div className="flex flex-1 flex-col">
        <div className="sticky top-0 bg-ui-bg-subtle">
          <Header />
          <div className="px-3">
            <Divider variant="dashed" />
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex flex-1 flex-col">
            <CoreRouteSection />
            <ExtensionRouteSection />
          </div>
          <UtilitySection />
        </div>
        <div className="sticky bottom-0 bg-ui-bg-subtle">
          <UserSection />
        </div>
      </div>
    </aside>
  );
};

const Header = () => {
  const { seller } = useMe();

  const name = seller?.name || "";
  const fallback = seller?.photo || "M";

  return (
    <div className="grid w-full grid-cols-[24px_1fr_15px] items-center gap-x-3 bg-ui-bg-subtle p-0.5 p-3 pr-2">
      {fallback ? (
        <div className="h-7 w-7">
          <ImageAvatar src={seller?.photo || "/logo.svg"} size={7} rounded />
        </div>
      ) : (
        <Skeleton className="h-6 w-6 rounded-md" />
      )}
      <div className="block overflow-hidden text-left">
        {name ? (
          <Text
            size="small"
            weight="plus"
            leading="compact"
            className="truncate"
          >
            {name}
          </Text>
        ) : (
          <Skeleton className="h-[9px] w-[120px]" />
        )}
      </div>
    </div>
  );
};

const useCoreRoutes = (): Omit<INavItem, "pathname">[] => {
  const { t } = useTranslation();

  const unreadMessages = useUnreads();

  const isB2BPanel = isB2B();

  return [
    {
      icon: <Component />,
      label: "Dashboard",
      to: "/dashboard",
    },
    {
      icon: <ShoppingCart />,
      label: t("orders.domain"),
      to: "/orders",
      items: [
        // TODO: Enable when domin is introduced
        // {
        //   label: t("draftOrders.domain"),
        //   to: "/draft-orders",
        // },
      ],
    },
    {
      icon: <Tag />,
      label: isB2BPanel ? t("offers.domain") : t("products.domain"),
      to: isB2BPanel ? "/offers" : "/products",
      items: [
        {
          label: t("collections.domain"),
          to: "/collections",
        },
        {
          label: t("categories.domain"),
          to: "/categories",
        },
        // TODO: Enable when domin is introduced
        // {
        //   label: t("giftCards.domain"),
        //   to: "/gift-cards",
        // },
      ],
    },
    {
      icon: <Buildings />,
      label: t("inventory.domain"),
      to: "/inventory",
      items: [
        {
          label: t("reservations.domain"),
          to: "/reservations",
        },
      ],
    },
    {
      icon: <Users />,
      label: t("customers.domain"),
      to: "/customers",
      items: [
        {
          label: t("customerGroups.domain"),
          to: "/customer-groups",
        },
      ],
    },
    {
      icon: <ReceiptPercent />,
      label: t("promotions.domain"),
      to: "/promotions",
      items: [
        {
          label: t("campaigns.domain"),
          to: "/campaigns",
        },
      ],
    },
    {
      icon: <CurrencyDollar />,
      label: t("priceLists.domain"),
      to: "/price-lists",
    },
    {
      icon: <Star />,
      label: "Reviews",
      to: "/reviews",
    },
    {
      icon: <ChatBubbleLeftRight />,
      label: `Messages ${unreadMessages?.length && unreadMessages?.length > 0 ? `(${unreadMessages?.length})` : ""}`,
      to: "/messages",
    },
    {
      icon: <ListCheckbox />,
      label: "Requests",
      to: "/requests",
      items: [
        {
          label: "Collections",
          to: "/requests/collections",
        },
        {
          label: "Categories",
          to: "/requests/categories",
        },
        {
          label: "Reviews",
          to: "/requests/reviews",
        },
        {
          label: "Orders returns",
          to: "/requests/orders",
        },
      ],
    },
  ];
};

const useExtensionRoutes = (): Omit<INavItem, "pathname">[] => {
  return [
    {
      icon: <StripeIcon />,
      label: "Stripe Connect",
      to: "/stripe-connect",
    },
  ];
};

const Searchbar = () => {
  const { t } = useTranslation();
  const { toggleSearch } = useSearch();

  return (
    <div className="px-3">
      <button
        onClick={toggleSearch}
        className={clx(
          "flex w-full items-center gap-x-2.5 rounded-md bg-ui-bg-subtle px-2 py-1 text-ui-fg-subtle outline-none",
          "hover:bg-ui-bg-subtle-hover",
          "focus-visible:shadow-borders-focus",
        )}
      >
        <MagnifyingGlass />
        <div className="flex-1 text-left">
          <Text size="small" leading="compact" weight="plus">
            {t("app.search.label")}
          </Text>
        </div>
        <Text size="small" leading="compact" className="text-ui-fg-muted">
          ⌘K
        </Text>
      </button>
    </div>
  );
};

const CoreRouteSection = () => {
  const coreRoutes = useCoreRoutes();

  return (
    <nav className="flex flex-col gap-y-1 py-3">
      <Searchbar />
      {coreRoutes.map((route) => {
        return <NavItem key={route.to} {...route} />;
      })}
    </nav>
  );
};

const ExtensionRouteSection = () => {
  const extensionRoutes = useExtensionRoutes();
  const { t } = useTranslation();

  if (!extensionRoutes.length) return null;

  return (
    <div>
      <div className="px-3">
        <Divider variant="dashed" />
      </div>
      <div className="flex flex-col gap-y-1 py-3">
        <RadixCollapsible.Root defaultOpen>
          <div className="px-4">
            <RadixCollapsible.Trigger asChild className="group/trigger">
              <button className="flex w-full items-center justify-between px-2 text-ui-fg-subtle">
                <Text size="xsmall" weight="plus" leading="compact">
                  {t("app.nav.common.extensions")}
                </Text>
                <div className="text-ui-fg-muted">
                  <ChevronDownMini className="group-data-[state=open]/trigger:hidden" />
                  <MinusMini className="group-data-[state=closed]/trigger:hidden" />
                </div>
              </button>
            </RadixCollapsible.Trigger>
          </div>
          <RadixCollapsible.Content>
            <nav className="flex flex-col gap-y-0.5 py-1 pb-4">
              {extensionRoutes.map((route) => {
                return <NavItem key={route.to} {...route} />;
              })}
            </nav>
          </RadixCollapsible.Content>
        </RadixCollapsible.Root>
      </div>
    </div>
  );
};

const UtilitySection = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-y-0.5 py-3">
      <NavItem
        label={t("app.nav.settings.header")}
        to="/settings"
        from={location.pathname}
        icon={<CogSixTooth />}
      />
    </div>
  );
};

const UserSection = () => {
  return (
    <div>
      <div className="px-3">
        <Divider variant="dashed" />
      </div>
      <UserMenu />
    </div>
  );
};
