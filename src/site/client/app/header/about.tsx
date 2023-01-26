import React, { useState } from 'react'
import { usePopper } from 'react-popper'
// @ts-ignore
import version from '../../../../../version.txt'
import ExternalLink from '../../common/text/externalLink'

export const render = () => {
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const [arrowElement, setArrowElement] = useState(null)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'offset', options: { offset: [0, 10] } },
      { name: 'preventOverflow', options: { altAxis: true, padding: 5 } },
    ],
  })
  const [show, setShow] = useState(false)

  return (
    <div className="about">
      <button className={`info-button${show ? ' active' : ''}`} type="button" ref={setReferenceElement} onClick={() => setShow(!show)}>
        <i className="fas fa-circle-info" />
      </button>
      {show
        ? (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div className="tooltip" ref={setPopperElement} style={styles.popper} {...attributes.popper}>
            <div className="arrow" ref={setArrowElement} style={styles.arrow} />
            <div className="line">Exhibitor: v<b>{version}</b></div>
            <div className="line">React: v<b>{React.version}</b></div>
            <div className="line"><ExternalLink text="Github" href="https://github.com/samhuk/exhibitor" /></div>
            <div className="line"><ExternalLink text="Wiki" href="https://github.com/samhuk/exhibitor/wiki" /></div>
            <div className="line"><ExternalLink text="Discussions 💬" href="https://github.com/samhuk/exhibitor/discussions" /></div>
          </div>
        ) : null}
    </div>
  )
}

export default render
