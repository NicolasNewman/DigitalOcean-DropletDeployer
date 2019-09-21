import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Home from '../components/Home';
import CounterActions from '../actions/counter';

function mapStateToProps(state, ownProps) {
    return {
        counter: state.counter,
        dataStore: ownProps.dataStore
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return bindActionCreators(CounterActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
