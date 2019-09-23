import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import snapshot from './snapshot';
import region from './region';
import { History } from 'history';

export default function createRootReducer(history: History) {
    return combineReducers({
        router: connectRouter(history),
        region,
        snapshot
    });
}
