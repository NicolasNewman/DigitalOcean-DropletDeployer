import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Home from '../components/Home/Home';

function mapStateToProps(state, ownProps) {
    console.log(state);
    return {
        snapshots: state.snapshot,
        regions: state.region,
        dataStore: ownProps.dataStore,
        doClient: ownProps.doClient
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
