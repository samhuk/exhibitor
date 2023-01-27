import { BuildResult } from 'esbuild'

export type BuildOutput = {
  path: string
  sizeBytes: number
}

export type CustomBuildResult = { buildResult: BuildResult, additionalOutputs?: BuildOutput[] }

export type BoolDependant2<
  TTrueValue extends any,
  TFalseValue extends any,
  TSpecificEnumType extends boolean = boolean,
  TTypePropertyName extends string = 'type'
> = {
  [K in `${boolean}`]: { [k in TTypePropertyName]: K extends 'true' ? true : false } & { true: TTrueValue, false: TFalseValue }[K]
}[`${boolean}`] & { [k in TTypePropertyName]: TSpecificEnumType }
