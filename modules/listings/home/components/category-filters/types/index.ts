import { getCategoriesWithoutParentQuery } from "@/modules/listings/queries"

export type CategoryFiltersClientProps = {
    categories: Awaited<ReturnType<typeof getCategoriesWithoutParentQuery>>
}