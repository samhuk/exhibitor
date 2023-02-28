import { SelectOption } from '../../../../../ui-component-library/select'

export const UPDATE_SELECTED_VIEWPORT_DIMENSION_PRESET_OPTION = 'bottomBar/updateSelectedViewportDimensionPresetOption'

export type State = {
  selectedViewportDimensionPresetOption: SelectOption<[number, number]>
}

type UpdateSelectedViewportDimensionPresetOption = {
  type: typeof UPDATE_SELECTED_VIEWPORT_DIMENSION_PRESET_OPTION
  option: SelectOption<[number, number]>
}

export type Actions = UpdateSelectedViewportDimensionPresetOption

export const updateSelectedViewportDimensionPresetOption = (option: SelectOption<[number, number]>): Actions => ({
  type: UPDATE_SELECTED_VIEWPORT_DIMENSION_PRESET_OPTION,
  option,
})
