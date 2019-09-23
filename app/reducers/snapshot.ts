import { SnapshotTypeKeys, SnapshotTypes } from '../actions/snapshot';

export default function counter(
    state: Array<String> = [],
    action: SnapshotTypes
) {
    switch (action.type) {
        case SnapshotTypeKeys.SET_SNAPSHOTS:
            return action.snapshots;
        default:
            return state;
    }
}
