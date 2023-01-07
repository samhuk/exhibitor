import React, { useMemo } from 'react'
import { ComponentExhibit, ExhibitNodeType } from '../../../../../api/exhibit/types'
import Nav from '../../../common/nav'
import { NavItemOptions } from '../../../common/nav/types'
import { useAppDispatch, useAppSelector } from '../../../store'
import { BottomBarType, selectBottomBar } from '../../../store/componentExhibits/actions'

export const render = () => {
  const selectedVariantPath = useAppSelector(s => s.componentExhibits.selectedVariantPath)
  const selectedType = useAppSelector(s => s.componentExhibits.selectedBottomBarType)
  const hasUnseenEvents = useAppSelector(s => s.componentExhibits.hasUnseenEvents)
  const dispatch = useAppDispatch()
  const selectedVariant = useMemo(
    () => {
      const selectedNode = exh.nodes[selectedVariantPath]
      return selectedNode != null && selectedNode.type === ExhibitNodeType.VARIANT
        ? selectedNode
        : null
    },
    [selectedVariantPath],
  )
  const showProps = selectedVariant != null && selectedVariant.exhibit.hasProps
  const showEventLog = showProps && (selectedVariant.exhibit as ComponentExhibit<true>).eventProps
  const showTests = true // TODO
  const showCode = true // TODO

  const navItemOptionsList: NavItemOptions[] = []

  if (showProps) {
    navItemOptionsList.push({
      text: 'Props',
      iconName: 'sliders',
      onClick: () => dispatch(selectBottomBar(BottomBarType.Props)),
      active: selectedType === BottomBarType.Props,
    })
  }

  if (showEventLog) {
    navItemOptionsList.push({
      text: 'Event Log',
      iconName: 'phone',
      onClick: () => dispatch(selectBottomBar(BottomBarType.EventLog)),
      active: selectedType === BottomBarType.EventLog,
    })
  }

  if (showCode) {
    navItemOptionsList.push({
      text: 'Code',
      iconName: 'code',
      onClick: () => dispatch(selectBottomBar(BottomBarType.Code)),
      active: selectedType === BottomBarType.Code,
    })
  }

  return (
    <Nav navItems={navItemOptionsList} />
  )
}

export default render
