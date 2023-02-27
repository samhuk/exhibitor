import React, { useRef, useState } from 'react'
import { usePopper } from 'react-popper'
// @ts-ignore
import version from '../../../../../version.txt'
import Button from '../../../../ui-component-library/button'
import Tooltip from '../../../../ui-component-library/tooltip'
import ExternalLink from '../../common/text/externalLink'

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
      <div className="line">Exhibitor <b>{version}</b></div>
      <div className="line">React <b>{React.version}</b></div>
      <div className="cl-h-divider" />
      <div className="line">
        <ExternalLink text="Github" iconClass="fa-brands fa-github" href="https://github.com/samhuk/exhibitor" />
      </div>
      <div className="line">
        <ExternalLink text="Wiki" iconClass="fas fa-circle-info" href="https://github.com/samhuk/exhibitor/wiki" />
      </div>
      <div className="line">
        <ExternalLink text="Discussions" iconClass="fas fa-comments" href="https://github.com/samhuk/exhibitor/discussions" />
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
