import { ExhError } from '../../../../common/exhError/types'

type BoolDependant2<
  TTrueValue extends any,
  TFalseValue extends any,
  TSpecificEnumType extends boolean = boolean,
  TTypePropertyName extends string = 'type'
> = {
  [K in `${boolean}`]: { [k in TTypePropertyName]: K extends 'true' ? true : false } & { true: TTrueValue, false: TFalseValue }[K]
}[`${boolean}`] & { [k in TTypePropertyName]: TSpecificEnumType }

export type RunPlaywrightTestsResult<
  TSuccess extends boolean = boolean,
> = BoolDependant2<
  { htmlReportData: string | null, stdOutList: string[] },
  { error: ExhError },
  TSuccess,
  'success'
>
