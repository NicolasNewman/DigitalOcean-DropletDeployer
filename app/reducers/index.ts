import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import counter from './counter';
import snapshot from './snapshot';
import { History } from 'history';

export default function createRootReducer(history: History) {
    return combineReducers({
        router: connectRouter(history),
        counter,
        snapshot
    });
}
