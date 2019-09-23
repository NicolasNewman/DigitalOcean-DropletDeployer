export enum SnapshotTypeKeys {
    SET_SNAPSHOTS = 'SET_SNAPSHOTS'
}

interface SetSnapshotAction {
    type: SnapshotTypeKeys.SET_SNAPSHOTS;
    snapshots: Array<string>;
}

export type SnapshotTypes = SetSnapshotAction;

export function setSnapshot(snapshots: Array<string>) {
    return {
        type: SnapshotTypeKeys.SET_SNAPSHOTS,
        snapshots
    };
}

export default { setSnapshot };
