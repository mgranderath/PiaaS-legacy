import Toolbar from '../components/toolbar.jsx';
import { connect } from 'react-redux';
import { addApp } from '../redux';

const mapStateToProps = (state, ownProps) => ({
  name: state.name,
});

const mapDispatchToProps = {
  addApp,
};

const ToolbarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Toolbar);
export default ToolbarContainer;