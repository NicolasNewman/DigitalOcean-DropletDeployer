import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Home from '../components/Home';
import CounterActions from '../actions/counter';

export interface CounterState {
    counter: number;
}

function mapStateToProps(state: CounterState) {
    return {
        counter: state.counter
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return bindActionCreators(CounterActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
