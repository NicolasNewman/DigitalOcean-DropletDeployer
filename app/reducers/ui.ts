import { UiTypeKeys, UiTypes } from '../actions/ui';

interface IInitialState {
    startupTabState: boolean;
    shutdownTabState: boolean;
}

const initialState = {
    startupTabState: true,
    shutdownTabState: true
};

export default function ui(state: IInitialState = initialState, action: UiTypes) {
    switch (action.type) {
        case UiTypeKeys.SET_STARTUP_TAB_STATE:
            return {
                startupTabState: action.startupTabState,
                shutdownTabState: state.shutdownTabState
            };
        case UiTypeKeys.SET_SHUTDOWN_TAB_STATE:
            return {
                startupTabState: state.startupTabState,
                shutdownTabState: action.shutdownTabState
            };
        default:
            return state;
    }
}
