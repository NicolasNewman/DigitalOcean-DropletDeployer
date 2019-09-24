export enum UiTypeKeys {
    SET_STARTUP_TAB_STATE = 'SET_STARTUP_STATE',
    SET_SHUTDOWN_TAB_STATE = 'SET_SHUTDOWN_STATE'
}

interface StartupTabStateAction {
    type: UiTypeKeys.SET_STARTUP_TAB_STATE;
    startupTabState: boolean;
}

interface ShutdownTabStateAction {
    type: UiTypeKeys.SET_SHUTDOWN_TAB_STATE;
    shutdownTabState: boolean;
}

export type UiTypes = StartupTabStateAction | ShutdownTabStateAction;

export function setStartupTabState(state: boolean) {
    return {
        type: UiTypeKeys.SET_STARTUP_TAB_STATE,
        startupTabState: state
    };
}

export function setShutdownTabState(state: boolean) {
    return {
        type: UiTypeKeys.SET_SHUTDOWN_TAB_STATE,
        shutdownTabState: state
    };
}

export default { setStartupTabState, setShutdownTabState };
