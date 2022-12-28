import cloneDeep from 'clone-deep'
import { VariantExhibitNode } from '../api/exhibit/types'
import { deepSetAllPropsOnMatch } from '../common/obj'

export const attachEventLoggingToProps = (
  variantNode: VariantExhibitNode,
) => (
  variantNode.exhibit.hasProps && variantNode.exhibit.eventProps != null
    ? deepSetAllPropsOnMatch(variantNode.exhibit.eventProps, cloneDeep(variantNode.variant.props), (args, path) => {
      // eslint-disable-next-line no-restricted-globals
      (parent as any).eventLogService.add({ args, path })
    })
    : variantNode.variant.props
)
