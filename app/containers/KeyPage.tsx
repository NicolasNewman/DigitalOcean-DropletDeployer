import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Key from '../components/Key/Key';
import SnapshotActions from '../actions/snapshot';

function mapStateToProps(state, ownProps) {
    return {
        dataStore: ownProps.dataStore,
        doClient: ownProps.doClient
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return bindActionCreators(SnapshotActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Key);
