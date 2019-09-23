import { RegionTypeKeys, RegionTypes } from '../actions/region';

export default function counter(state: Array<string> = [], action: RegionTypes) {
    switch (action.type) {
        case RegionTypeKeys.SET_REGIONS:
            return action.regions;
        default:
            return state;
    }
}
