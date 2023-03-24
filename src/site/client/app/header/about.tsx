import React, { useRef } from 'react'
// @ts-ignore
import version from '../../../../../version.txt'
import { NPM_PACKAGE_CAPITALIZED_NAME, NPM_PACKAGE_NAME } from '../../../../common/name'
import Button from '../../../../ui-component-library/button'
import ExternalLink from '../../../../ui-component-library/external-link'
import Tooltip from '../../../../ui-component-library/tooltip'

export const render = () => {
  const buttonRef = useRef<HTMLButtonElement>()

  const referenceEl = (
    <Button
      className="info-button"
      ref={buttonRef}
      icon={{ name: 'circle-info' }}
    />
  )

  const tooltipComponent = () => (
    <>
      <div className="line">{NPM_PACKAGE_CAPITALIZED_NAME} <b>{version}</b></div>
      <div className="line">React <b>{React.version}</b></div>
      <div className="cl-h-divider" />
      <div className="line">
        <ExternalLink text="Github" iconClass="fa-brands fa-github" href={`https://github.com/samhuk/${NPM_PACKAGE_NAME}`} />
      </div>
      <div className="line">
        <ExternalLink text="Wiki" iconClass="fas fa-circle-info" href={`https://github.com/samhuk/${NPM_PACKAGE_NAME}/wiki`} />
      </div>
      <div className="line">
        <ExternalLink text="Discussions" iconClass="fas fa-comments" href={`https://github.com/samhuk/${NPM_PACKAGE_NAME}/discussions`} />
      </div>
    </>
  )

  return (
    <Tooltip
      className="about"
      referenceEl={referenceEl}
      tooltipEl={tooltipComponent}
      onShowChange={newShow => buttonRef.current.classList.toggle('active', newShow)}
      offset={{ y: 10 }}
    />
  )
}

export default render
