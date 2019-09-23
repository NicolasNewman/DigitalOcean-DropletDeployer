import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import Key from '../components/Key/Key';
import SnapshotActions from '../actions/snapshot';
import RegionActions from '../actions/region';

function mapStateToProps(state, ownProps) {
    return {
        dataStore: ownProps.dataStore,
        doClient: ownProps.doClient
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return bindActionCreators(
        {
            ...SnapshotActions,
            ...RegionActions
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Key);
