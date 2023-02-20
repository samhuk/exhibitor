import React from 'react'
import Select, { SelectOption } from '../../../../common/dropdowns/select'
import { useAppDispatch, useAppSelector } from '../../../../store'
import { updateSelectedViewportDimensionPresetOption } from '../../../../store/componentExhibits/bottomBar/actions'

export const render = () => {
  const dispatch = useAppDispatch()
  const selectedOption = useAppSelector(s => s.bottomBar.selectedViewportDimensionPresetOption)
  const onChange = (newValue: [number, number], newOption: SelectOption<[number, number]>) => {
    dispatch(updateSelectedViewportDimensionPresetOption(newOption))
  }

  return (
    <Select<[number, number]>
      options={[
        { displayText: 'iPhone SE 2022', value: [375, 667] },
        { displayText: 'iPhone 14', value: [390, 844] },
        { displayText: 'Samsung Galaxy S21', value: [360, 800] },
      ]}
      onChange={onChange}
      selectedOption={selectedOption}
    />
  )
}

export default render
