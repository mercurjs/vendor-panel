import {
  Button,
  Container,
  Heading,
  StatusBadge,
  Table,
  Tabs,
  Text,
} from "@medusajs/ui"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, Outlet } from "react-router-dom"

import { SingleColumnPage } from "../../../components/layout/pages"
import { useCustomTags } from "../../../hooks/api"
import type { CustomTag } from "../../../hooks/api"

export const CustomTagList = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"pet_types" | "brands">("pet_types")

  const { data: petTypeData, isLoading: petTypeLoading } = useCustomTags({
    type: "pet_type",
  })

  const { data: brandData, isLoading: brandLoading } = useCustomTags({
    type: "brand",
  })

  const renderTable = (data?: { tags?: CustomTag[] }) => {
    if (!data?.tags?.length) {
      return null
    }

    const formatDate = (value: string) => {
      const date = new Date(value)
      return isNaN(date.getTime())
        ? value
        : date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
    }

    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t("customTags.name")}</Table.HeaderCell>
            <Table.HeaderCell>{t("customTags.fields.createdAt")}</Table.HeaderCell>
            <Table.HeaderCell>{t("customTags.status")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.tags.map((tag) => (
            <Table.Row key={tag.id}>
              <Table.Cell>
                <Text className="font-medium">{tag.value}</Text>
              </Table.Cell>
              <Table.Cell>
                <Text className="text-ui-fg-subtle">{formatDate(tag.created_at)}</Text>
              </Table.Cell>
              <Table.Cell>
                <StatusBadge
                  color={
                    tag.status === "approved"
                      ? "green"
                      : tag.status === "rejected"
                        ? "red"
                        : "orange"
                  }
                >
                  {tag.status}
                </StatusBadge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }

  const renderTabContent = (
    isLoading: boolean,
    data?: { tags?: CustomTag[] },
    emptyKey?: string
  ) => {
    if (isLoading) {
      return (
        <div className="py-4">
          <Text className="text-ui-fg-subtle">{t("customTags.loading")}</Text>
        </div>
      )
    }

    if (!data?.tags?.length) {
      const translationKey = emptyKey || "general.noRecordsMessage"

      return (
        <div className="py-4">
          <Text className="text-ui-fg-subtle">{t(translationKey as any)}</Text>
        </div>
      )
    }

    return renderTable(data)
  }

  return (
    <SingleColumnPage widgets={{ before: [], after: [] }}>
      <Container className="p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
          <Heading level="h2">{t("customTags.domain")}</Heading>
          <Button variant="secondary" size="small" asChild>
            <Link to={`create?type=${activeTab === "pet_types" ? "pet_type" : "brand"}`}>
              {t("general.add")}
            </Link>
          </Button>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "pet_types" | "brands")}
          className="w-full"
        >
          <div className="px-6 pt-4 mb-4">
            <Tabs.List>
              <Tabs.Trigger value="pet_types">{t("petTypes.domain")}</Tabs.Trigger>
              <Tabs.Trigger value="brands">{t("brands.domain")}</Tabs.Trigger>
            </Tabs.List>
          </div>

          <Tabs.Content value="pet_types" className="mt-0 px-6 pb-4">
            {renderTabContent(petTypeLoading, petTypeData, "customTags.noPetTypesFound")}
          </Tabs.Content>

          <Tabs.Content value="brands" className="mt-0 px-6 pb-4">
            {renderTabContent(brandLoading, brandData, "customTags.noBrandsFound")}
          </Tabs.Content>
        </Tabs>
      </Container>
      <Outlet />
    </SingleColumnPage>
  )
}
