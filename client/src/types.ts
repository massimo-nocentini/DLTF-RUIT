export interface TimeDependingDistribution{
    time?: number
}
export interface UniformDistributionParams extends  TimeDependingDistribution{
    value: number
}

export interface FixedDistributionParams extends  TimeDependingDistribution{
    fixedTime: number
}


export interface UniformContinuousDistributionParams extends  TimeDependingDistribution{
    min: number
    max: number
    scalingFactor: number
}


export interface NormalDistributionParams extends  TimeDependingDistribution{
    mean: number
    std: number
    scalingFactor: number
}

export interface NormalScaledDistributionParams extends  TimeDependingDistribution{
    mean: number
    std: number
    scalingFactorX: number
    scalingFactorY: number
}

export interface LognormalDistributionParams extends  TimeDependingDistribution{
    mean: number
    std: number
    scalingFactor: number
}

export interface LognormalScaledDistributionParams extends  TimeDependingDistribution{
    mean: number
    std: number
    scalingFactorX: number
    scalingFactorY: number
}

export interface ExponentialDistributionParams extends  TimeDependingDistribution{
    rate: number
    scalingFactor: number
}

export interface ExponentialScaledDistributionParams extends  TimeDependingDistribution{
    rate: number
    scalingFactorX: number
    scalingFactorY: number
}

export type DistributionType = 'FIXED' | 'UNIFORM' |  'NORMAL' | 'NORMAL_SCALED' | 'EXPONENTIAL' | 'EXPONENTIAL_SCALED' | 'LOGNORMAL' | 'LOGNORMAL_SCALED';

export interface DistributionParams {
    type: DistributionType;
    fixedTime?: number;
    value?: number;
    mean?: number;
    std?: number;
    scalingFactorX?: number;
    scalingFactorY?: number;
    scalingFactor?: number;
    rate?: number;
    time?: number;
}

export type ProbabilityDistribution = {
    type: DistributionType;
    [key: string]: any;
};

export type SimulationConfig = {
    entities: string[];
    events: Event[];
    name: string;
    numAggr: number;
    maxTime: number;
    numRuns: number;
};

export type Event = {
    eventName: string;
    eventDescription: string;
    instanceOf: string | null;
    dependOn: string | null;
    probabilityDistribution: ProbabilityDistribution;
    gasCost: number;
    maxProbabilityMatches: number | null;
    relatedEvents: string[] | null;
};
