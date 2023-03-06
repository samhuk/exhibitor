import React, { useEffect, useState } from 'react'
import Icon from '../../../../../ui-component-library/icon'
import Tooltip from '../../../../../ui-component-library/tooltip'
import {
  determineWidthWidthInfo,
  ORDERED_WINDOW_WIDTH_TYPES,
  WindowWidthInfo,
  WINDOW_WIDTH_TYPE_DISPLAY_NAMES,
  WINDOW_WIDTH_TYPE_MAXIMA,
} from '../../../common/responsiveness'
import { useAppSelector } from '../../../store'

export const render = (props: {
  iframeEl: HTMLIFrameElement
}) => {
  const viewportRectSizePx = useAppSelector(s => s.componentExhibits.viewportRectSizePx)
  const [windowWidthInfo, setWindowWidthInfo] = useState<WindowWidthInfo | null>(determineWidthWidthInfo(props.iframeEl?.contentWindow))

  useEffect(() => {
    setWindowWidthInfo(determineWidthWidthInfo(props.iframeEl?.contentWindow))
  }, [viewportRectSizePx, props.iframeEl?.contentWindow])

  const refEl = windowWidthInfo != null
    ? <span>{windowWidthInfo.displayName}</span>
    : null

  const tooltipComponent = () => (
    <>
      <p>This is the approximate device type that corresponds to the current width of the component exhibit viewport.</p>
      <ul>
        {ORDERED_WINDOW_WIDTH_TYPES.map((windowWidthType, i) => {
          const displayName = WINDOW_WIDTH_TYPE_DISPLAY_NAMES[windowWidthType]
          const max = WINDOW_WIDTH_TYPE_MAXIMA[windowWidthType]
          const prevType = ORDERED_WINDOW_WIDTH_TYPES[i - 1]
          const prevMaxPlusOne = prevType != null ? WINDOW_WIDTH_TYPE_MAXIMA[prevType] + 1 : null
          return (
            <li key={windowWidthType}>
              <span className="label">{displayName}</span>
              <span className="range">
                {i === 0
                  ? <><Icon iconName="less-than-equal" /> {max}px</>
                  : i === ORDERED_WINDOW_WIDTH_TYPES.length - 1
                    ? <><Icon iconName="greater-than-equal" /> {prevMaxPlusOne}px</>
                    : <>{prevMaxPlusOne}px <Icon iconName="arrow-right-long" /> {max}px</>}
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )

  return (
    <Tooltip
      referenceEl={refEl}
      tooltipEl={tooltipComponent}
      refClassName="responsiveness-info"
      tooltipClassName="responsiveness-info-tooltip"
      appearMode="hover"
      offset={{ y: 10 }}
    />

  )
}

export default render
