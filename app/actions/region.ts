export enum RegionTypeKeys {
    SET_REGIONS = 'SET_REGIONS'
}

interface SetRegionAction {
    type: RegionTypeKeys.SET_REGIONS;
    regions: Array<string>;
}

export type RegionTypes = SetRegionAction;

export function setRegion(regions: Array<string>) {
    return {
        type: RegionTypeKeys.SET_REGIONS,
        regions: regions
    };
}

export default { setRegion };
