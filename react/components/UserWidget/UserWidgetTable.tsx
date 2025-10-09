import React, { Fragment, useEffect, useState } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { ButtonWithIcon, IconCaretDown } from 'vtex.styleguide'

import { useScroll } from '../../hooks/useScroll'

type UserWidgetTableProps = Readonly<{
  list?: Array<{
    orgId: string
    costId: string
    organizationName: string
    costCenterName: string
  }>
  radioValue: string
  setRadioValue: React.Dispatch<React.SetStateAction<string>>
}>

const CSS_HANDLES = [
  'userWidgetModalTotal',
  'userWidgetModalTableContainer',
  'userWidgetModalTable',
  'userWidgetModalTableRow',
  'userWidgetModalTableRowChecked',
  'userWidgetModalTableRadio',
  'userWidgetModalTableCell',
] as const

const DEFAULT_OFFSET = 15

export function UserWidgetTable(props: UserWidgetTableProps) {
  const handles = useCssHandles(CSS_HANDLES)
  const [offset, setOffset] = useState(DEFAULT_OFFSET)
  const { list = [], radioValue, setRadioValue } = props
  const slicedList = list.slice(0, offset)
  const currentOffset = offset < list.length ? offset : list.length
  const onScrollEnd = () => setOffset((prev: number) => prev + DEFAULT_OFFSET)
  const scrollRef = useScroll<HTMLDivElement>({ onScrollEnd })

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
    setOffset(DEFAULT_OFFSET)
  }, [list.length])

  return (
    <>
      <div
        ref={scrollRef}
        className={`${handles.userWidgetModalTableContainer} mb4`}
      >
        <table className={handles.userWidgetModalTable}>
          <tbody>
            {slicedList.map((organization, index) => {
              const id = [organization.orgId, organization.costId, index].join()

              return (
                <Fragment key={id}>
                  <tr
                    className={`${handles.userWidgetModalTableRow} ${
                      id === radioValue
                        ? handles.userWidgetModalTableRowChecked
                        : ''
                    }`}
                    onClick={() => setRadioValue(id)}
                  >
                    <td className={handles.userWidgetModalTableCell}>
                      <input
                        id={id}
                        value={id}
                        checked={id === radioValue}
                        onChange={(e: any) => setRadioValue(e.target.value)}
                        type="radio"
                        className={handles.userWidgetModalTableRadio}
                      />
                    </td>
                    <td className={handles.userWidgetModalTableCell}>
                      <label htmlFor={id}>
                        {organization.organizationName}
                      </label>
                    </td>
                    <td className={handles.userWidgetModalTableCell}>
                      <label htmlFor={id}>{organization.costCenterName}</label>
                    </td>
                  </tr>
                  {index === slicedList.length - 1 &&
                    list.length > currentOffset && (
                      <tr>
                        <td colSpan={3} align="center">
                          <ButtonWithIcon
                            onClick={onScrollEnd}
                            icon={<IconCaretDown />}
                            variation="tertiary"
                          />
                        </td>
                      </tr>
                    )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      {list.length > DEFAULT_OFFSET && (
        <div className="flex justify-end mb4">
          {currentOffset}/{list.length}
        </div>
      )}
    </>
  )
}
