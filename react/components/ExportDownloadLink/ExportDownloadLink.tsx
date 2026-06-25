import React from 'react'

import { getExportDownloadHref } from '../../services/bulkExportClient'

type ExportDownloadLinkProps = {
  account: string
  downloadLink: string
  label: string
}

const ExportDownloadLink = ({
  account,
  downloadLink,
  label,
}: ExportDownloadLinkProps) => {
  const href = getExportDownloadHref(downloadLink, account)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="f6 link"
    >
      {label}
    </a>
  )
}

export default ExportDownloadLink
