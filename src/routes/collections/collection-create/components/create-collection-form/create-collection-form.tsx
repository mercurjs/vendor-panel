import { zodResolver } from "@hookform/resolvers/zod"
import {
  Button,
  ProgressStatus,
  ProgressTabs,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as zod from "zod"

import {
  RouteFocusModal,
  useRouteModal,
} from "../../../../../components/modals"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import {
  REQUEST_COLLECTION_FORM_DEFAULTS,
  RequestCollectionSchema,
} from "../../constants"
import { RequestCollectionDetailsForm } from "../request-collection-details-form"
import { RequestCollectionOrganizeRankingForm } from "../request-collection-organize-ranking-form"

enum Tab {
  DETAILS = "details",
  ORGANIZE_RANKING = "organize-ranking",
}

type TabState = Record<Tab, ProgressStatus>

export const CreateCollectionForm = () => {
  const [tab, setTab] = useState<Tab>(Tab.DETAILS)
  const [tabState, setTabState] = useState<TabState>({
    [Tab.DETAILS]: "in-progress",
    [Tab.ORGANIZE_RANKING]: "not-started",
  })

  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  const form = useForm<zod.infer<typeof RequestCollectionSchema>>({
    defaultValues: REQUEST_COLLECTION_FORM_DEFAULTS as zod.infer<
      typeof RequestCollectionSchema
    >,
    resolver: zodResolver(RequestCollectionSchema),
  })

  const handleSubmit = form.handleSubmit(async () => {
    // Mock submit: no API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success(t("collections.requestSuccess"))
    handleSuccess()
  })

  const onNext = async (currentTab: Tab) => {
    const valid = await form.trigger(["title", "handle"])
    if (!valid) return
    if (currentTab === Tab.DETAILS) {
      setTab(Tab.ORGANIZE_RANKING)
    }
  }

  useEffect(() => {
    const next: TabState = {
      [Tab.DETAILS]: tab === Tab.DETAILS ? "in-progress" : "completed",
      [Tab.ORGANIZE_RANKING]:
        tab === Tab.ORGANIZE_RANKING ? "in-progress" : "not-started",
    }
    setTabState(next)
  }, [tab])

  return (
    <RouteFocusModal.Form form={form}>
      <KeyboundForm onSubmit={handleSubmit} className="flex h-full flex-col">
        <ProgressTabs
          value={tab}
          onValueChange={async (value) => {
            const valid = await form.trigger(["title", "handle"])
            if (!valid) return
            setTab(value as Tab)
          }}
          className="flex h-full flex-col overflow-hidden"
        >
          <RouteFocusModal.Header className='py-0'>
            <div className="flex w-full items-center gap-x-2 ">
              <div className="flex flex-1 border-l">
                <ProgressTabs.List className="flex w-full items-center">
                  <ProgressTabs.Trigger
                    status={tabState[Tab.DETAILS]}
                    value={Tab.DETAILS}
                    className="max-w-[200px] truncate"
                  >
                    {t("collections.requestCollection.tabs.details")}
                  </ProgressTabs.Trigger>
                  <ProgressTabs.Trigger
                    status={tabState[Tab.ORGANIZE_RANKING]}
                    value={Tab.ORGANIZE_RANKING}
                    className="max-w-[200px] truncate"
                  >
                    {t("collections.requestCollection.tabs.organizeRanking")}
                  </ProgressTabs.Trigger>
                </ProgressTabs.List>
              </div>
            </div>
          </RouteFocusModal.Header>
          <RouteFocusModal.Body className="size-full overflow-hidden">
            <ProgressTabs.Content
              className="size-full overflow-y-auto"
              value={Tab.DETAILS}
            >
              <RequestCollectionDetailsForm form={form} />
            </ProgressTabs.Content>
            <ProgressTabs.Content
              className="size-full overflow-y-auto"
              value={Tab.ORGANIZE_RANKING}
            >
              <RequestCollectionOrganizeRankingForm form={form} />
            </ProgressTabs.Content>
          </RouteFocusModal.Body>
        </ProgressTabs>
        <RouteFocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button variant="secondary" size="small">
                {t("actions.cancel")}
              </Button>
            </RouteFocusModal.Close>
            {tab === Tab.ORGANIZE_RANKING ? (
              <Button
                key="submit-button"
                type="submit"
                variant="primary"
                size="small"
              >
                {t("actions.save")}
              </Button>
            ) : (
              <Button
                key="next-button"
                type="button"
                variant="primary"
                size="small"
                onClick={() => onNext(tab)}
              >
                {t("actions.continue")}
              </Button>
            )}
          </div>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal.Form>
  )
}
