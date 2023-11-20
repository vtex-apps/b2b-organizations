import { Text, csx } from '@vtex/admin-ui'
import React from 'react'

export type ReportInformationDetailsProps = {
  variant: 'Import' | 'Upload'
}

const ReportInformationDetails = ({
  variant,
}: ReportInformationDetailsProps) => {
  return (
    <>
      <Text
        variant="body"
        className={csx({
          display: 'block',
          marginTop: '$space-3',
          marginBottom: '$space-2',
        })}
      >
        {`${
          variant === 'Upload'
            ? 'To address the errors'
            : 'For a complete breakdown'
        }`}
        , download the
        <a href=""> Reviewed.XLSX</a>. It shows the status of each row — green
        for success and red for failure. Errors and their details are provided,
        where applicable, in the last errors column of each tab.
      </Text>
      <Text variant="body">
        Next Steps to address errors:
        <ul className={csx({ marginLeft: '$space-1' })}>
          <ol>1. Refer to the rows marked red in the report.</ol>
          <ol>2. Correct the issues.</ol>
          {variant === 'Upload' ? (
            <ol>
              3. Re-upload only the corrected rows using the Bulk Import tool
            </ol>
          ) : (
            <ol>3. Re-upload your file using the Bulk Import tool</ol>
          )}
          <ol>
            4. Ensure you format as per the <a href="">VTEX File Template</a>.
            Need guidance? <a href="">Check our Best Practices Import Guide</a>.
          </ol>
        </ul>
      </Text>
    </>
  )
}

export default ReportInformationDetails
