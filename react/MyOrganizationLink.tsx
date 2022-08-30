import type { FC } from 'react'

const MyOrganizationLink: FC = ({ render }: any) => {
  return render([
    {
      name: 'Cadastro da empresa',
      path: '/organization',
    },
  ])
}

export default MyOrganizationLink
