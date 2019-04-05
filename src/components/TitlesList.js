// import statements
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

// styles object
// Note: Styles are written in the component page itself as the page is not UI rich
// Ideally styles will be in seperate files and will be imported just like the js file imports
const styles = theme => ({
  root: {
    width: '70%',
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    overflow: 'auto',
    paddingTop:'5%',
    marginLeft:'15%',
    marginRight:'15%',

  },
  inline: {
    display: 'inline',
  },
  title: {
    fontWeight:'bold',
    fontSize:'20px',
  },
  titlesDiv: {
    justifyContent: 'center',
  },
  titlesHeader: {
    textAlign:'center',
  },
});

// state-less component
class TitlesList extends Component{

  // handles click event when the user clicks on the article title
  handleClick(e, id){
    // logic to get ID from the link(URL) by spliting with the / delimiter
    let url = id.split('/');
    let idIndex = url.length-1;
    const actualID = url[idIndex];
    // route URL
    let route = "/article-details/" + actualID;
    // Changing the route by pushing to the props whcih allows backward navigation and forward navigation in the browser
    this.props.history.push(route);
    e.preventDefault();
  }

  // render method contains UI that is been displayed to the user
  render(){
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.titlesDiv}>
          <h2 className={classes.titlesHeader}>
            {this.props.itemsList.length === 0 ? 'Loading Data. Please Wait...' : 'Article Titles of Past 30 Days'}
          </h2>
        </div>
        <List component="nav">
          {this.props.itemsList.map((item, i) => (
            <ListItem key={i}  button>
              <ListItemText className={classes.title} onClick = {e => this.handleClick(e, item.id)} inset primary={item.title}
                secondary= {
                  <React.Fragment>
                    <Typography component="span" className={classes.inline} color="textPrimary">
                      Date Published:
                    </Typography>
                    {item.published.replace('T', ' ')}
                  </React.Fragment>
                }
              />
            </ListItem>
          ))}
        </List>
      </div>
    );
  }

}

TitlesList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TitlesList);
