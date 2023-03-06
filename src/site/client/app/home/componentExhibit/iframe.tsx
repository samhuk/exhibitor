import React, { forwardRef, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const iframeTest = document.createElement('iframe')

type BaseProps = Omit<React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>, 'srcDoc' | 'src'>

type Props = BaseProps & {
  stylesheethrefs?: string[]
  inlinestyle: string
}

const createInitialContent = (
  stylesheetHrefs?: string[],
  inlineStyle?: string,
) => {
  const stylesheetLinkElsStr = stylesheetHrefs?.map(href => `<link rel="stylesheet" type="text/css" href="${href}">`).join('') ?? ''
  const inlineStyleElStr = inlineStyle != null ? `<style>${inlineStyle}</style>` : ''
  return `<!DOCTYPE html>${stylesheetLinkElsStr}${inlineStyleElStr}</head><body></body></html>`
}

const createSrcProp = (
  stylesheetHrefs?: string[],
  inlineStyle?: string,
) => {
  const initialContent = createInitialContent(stylesheetHrefs, inlineStyle)
  return 'srcdoc' in iframeTest
    ? { srcDoc: initialContent }
    : { src: `javascript: '${initialContent}'` }
}

/**
 * This has lots of research:
 *
 * * For nicely applying styles:
 *     https://stackoverflow.com/questions/57666672/react-ensure-css-loaded-before-iframe-renders
 * * For the onload workaround for firefox bug with react's `ref`:
 *     https://github.com/adrid/slate/blob/c9ca4902de8f9c5504dba1ad40e9b34f2a3f28b9/site/examples/iframe.tsx#L107
 */
export const render = forwardRef<HTMLIFrameElement, Props>((props, ref) => {
  const [iframeBodyEl, setIframeBodyEl] = useState<HTMLBodyElement>(null)
  const iframeElRef = useRef<HTMLIFrameElement>()

  const onLoad = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    const iframeEl = e.target as HTMLIFrameElement
    const bodyEl = iframeEl.contentDocument.body as HTMLBodyElement
    props?.onLoad?.(e)
    if (!e.defaultPrevented)
      setIframeBodyEl(bodyEl)

    if (iframeElRef.current != null)
      iframeElRef.current.style.visibility = 'visible'
  }

  return (
    // eslint-disable-next-line jsx-a11y/iframe-has-title
    <iframe
      ref={el => {
        iframeElRef.current = el
        if (ref == null)
          return
        // Mimick React's internal ref assignment behavior
        if (typeof ref === 'function')
          ref(el)
        else
          ref.current = el
      }}
      style={{ visibility: 'hidden' }}
      onLoad={onLoad}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...createSrcProp(props.stylesheethrefs, props.inlinestyle)}
    >
      {iframeBodyEl != null && props.children != null
        ? createPortal(props.children, iframeBodyEl)
        : null}
    </iframe>
  )
})

export default render
