// import statements
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

// fast-xml-parser to parse XML data to JSON data
let parser = require('fast-xml-parser');

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
  title: {
    paddingLeft:'1%'
  },
  articletitle: {
    paddingLeft:'2%'
  },
});

class AuthorDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authorData: []
    };
    this.setAuthorData = this.setAuthorData.bind(this);
  }

  componentDidMount(){
    this.fetchAuthorsData(this.props.authorName, 0, 50);
  }

  fetchAuthorsData(name, start, end){
    const url = `https://cors-anywhere.herokuapp.com/http://export.arxiv.org/api/query?search_query=au:${this.props.authorName}&sortBy=submittedDate&start=${start}&max_results=${end}`;

    // stopping condition of the recurssive function to reduce load on the server
    if(!window.location.pathname.includes('author-details')){
      return;
    }

    fetch(url , {method: 'GET',
      headers: {Accept: 'text/xml','Content-Type': 'application/json',},
      }).then(response => {
        response.text()
        .then(( str ) => {
          let jsonObj = parser.parse(str);
          let entryData = jsonObj.feed.entry;
          let days = 0;
          // conditon to check if a new fetch call is required to fetch more data of past 30 days
          // checking the date of the last item of the page
          // if page's last item date and today's date difference is less than or equal to 30,
          // fetch call will be made to get more data
          if (typeof entryData !== "undefined"){
            let lastPageData = entryData[entryData.length-1];
            days = this.getDaysDifference(lastPageData.published);
            this.setAuthorData(entryData, days);
          }

          else {
            // condition to make the request to the current page util the data is being fetched
            end = end - 300;
          }
          // condition will be executed if the API does not return any data due to continuous requests with in a short period of time

          if(days <= 30){
            let that = this;
            setTimeout(function(){
              that.fetchAuthorsData(url, end+1, end+300);;
            }, 3000);

          }
        });
    });
  }

  // sets data to the state variable to show the user
  setAuthorData(data, days){
    let k = this.state.authorData;
    // this condition will be executed when the page has more than 30 day period data
    if(days > 30){
      k = k.concat(this.getValidData(data));
    }
    else{
      k = k.concat(data);
    }

    this.setState({authorData: k});
  }

  // returns the days difference between two given date and the current date
  getDaysDifference(date){
    let newDate = new Date(date.split('T')[0]);
    let currentDate = new Date();
    let res = Math.abs(currentDate - newDate) / 1000;
    let days = Math.floor(res / 86400);
    return days;
  }

  // filters out the data which is published more than 30 days
  getValidData(data){
    let validData = [];
    for(let i=0; i<data.length;i++){
      if(this.getDaysDifference(data[i].published) <= 30){
        validData.push(data[i]);
      }
      else{
        break;
      }
    }
    return validData;
  }

// render function to display UI to the user
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
      <h2 className={classes.title}> {this.props.authorName} </h2>
      {this.state.authorData.map((item, i) => (
        <p className={classes.articletitle}>{item.title}</p>
      ))}
      </div>
    );
  }
}


AuthorDetails.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AuthorDetails);
