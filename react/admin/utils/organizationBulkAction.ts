import { organizationMessages as messages } from './messages'

export const organizationBulkAction = (
  handleCallback: { (rowParams: any): void; (rowParams: any): void },
  labelMessage: { id: string },
  formatMessage: { (...args: any): unknown }
) => {
  return {
    texts: {
      rowsSelected: (qty: number) =>
        formatMessage(messages.selectedRows, {
          qty,
        }),
    },
    main: {
      label: formatMessage(labelMessage),
      handleCallback,
    },
  }
}
