import { useRuntime } from 'vtex.render-runtime'

export const useNavigateToDetailsPage = () => {
  const { navigate } = useRuntime()

  return (id: string) =>
    navigate({
      page: 'admin.app.b2b-organizations.organization-details',
      params: { id },
    })
}
