import * as esbuild from 'esbuild';
export declare type BuildOutput = {
    path: string;
    sizeBytes: number;
};
export declare type CustomBuildResult = {
    buildResult: esbuild.BuildResult;
    additionalOutputs?: BuildOutput[];
};
/**
 * Prints the result of the given esbuild result to console.
 */
export declare const printBuildResult: (result: esbuild.BuildResult, startTime: number, additionalOutputs?: BuildOutput[]) => void;
export declare const createBuilder: (buildName: string, builder: () => Promise<CustomBuildResult>) => () => Promise<CustomBuildResult>;
export declare const buildExhIndexFile: () => Promise<CustomBuildResult>;
