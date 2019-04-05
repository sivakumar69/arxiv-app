// import statements
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

// styles object
// Note: Styles are written in the component page itself as the page is not UI rich
// Ideally styles will be in seperate files and will be imported just like the js file imports
const styles = theme => ({

  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      paddingRight:'4%'
    },
  },

  grow: {
    flexGrow: 1,
  },

});

// state-less component
class NavBar extends Component{

  render(){

    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar style={{}}>
            <Typography variant="h6" color="inherit" noWrap>
              <strong><a href="/" style={{textDecoration:"none", color:"inherit"}}>&nbsp;arXiv App</a></strong>
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

NavBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NavBar);
