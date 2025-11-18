import { useParams } from "react-router-dom"

import { useUser } from "../../../hooks/api/users"
import { UserGeneralSection } from "./components/user-general-section"

import { SingleColumnPageSkeleton } from "../../../components/common/skeleton"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"

export const UserDetail = () => {
  const { id } = useParams()
  const { member, isPending: isLoading, isError, error } = useUser(id!)

  const { getWidgets } = useDashboardExtension()

  if (isLoading || !member) {
    return <SingleColumnPageSkeleton />
  }

  if (isError) {
    throw error
  }

  return (
    <SingleColumnPage
      data={member}
      widgets={{
        after: getWidgets("user.details.after"),
        before: getWidgets("user.details.before"),
      }}
    >
      <UserGeneralSection member={member} />
    </SingleColumnPage>
  )
}
