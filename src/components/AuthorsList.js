// import statements
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

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
    paddingBottom:'5%',
    paddingLeft:'1%',
    paddingRight:'1%',
    marginLeft:'15%',
    marginRight:'15%',

  },
  summary: {
    paddingLeft:'3%',
  },
  summaryTitle: {
    paddingLeft: '1%',
  },
});

class AuthorsList extends Component {

  constructor(props){
    super(props);
    // initializing the initial state data
    this.state = {
      articleData: undefined,
      authorArticleCount: {},
    };
    this.setArticleData = this.setArticleData.bind(this);
  }

  componentDidMount() {
    const url = `https://cors-anywhere.herokuapp.com/http://export.arxiv.org/api/query?id_list=${this.props.articleID}`;

    // api fetch call to get data of the selected article title
    fetch(url , {method: 'GET',
      headers: {Accept: 'text/xml','Content-Type': 'application/json',},
      }).then(response => {
        response.text()
        .then(( str ) => {
          let jsonObj = parser.parse(str);
          // api returns object for single author articles and list of objects for multiple author articles
          // logic to get list of author objects for both single and multiple authors
          if(Array.isArray(jsonObj.feed.entry.author)){
            this.getAuthorArticleCount(jsonObj.feed.entry.author);
          }
          else{
            this.getAuthorArticleCount([jsonObj.feed.entry.author]);
          }
          // function call to set article data
          this.setArticleData(jsonObj.feed.entry);
        });
    });

  }

  // function for setting count of articles published by each author in past 30 days
  getAuthorArticleCount(authors) {
    for(let i=0;i<authors.length;i++){
      this.getarticleCount(authors[i].name, 0, 200);
    }
  }

  // counts the articles published by the author by making recursive fetch calls
  getarticleCount(name, start, end){
    let url = `https://cors-anywhere.herokuapp.com/http://export.arxiv.org/api/query?search_query=au:${name}&sortBy=submittedDate&start=${start}&max_results=${end}`;

    // conditon to check if router is matching with the component
    // stopping conditon for the recurssive function
    if(!window.location.pathname.includes("article-details")) {
      return;
    }

    // fetch call to get data of specified url
    fetch(url , {method: 'GET',
      headers: {Accept: 'text/xml','Content-Type': 'application/json',},
      }).then(response => {
        response.text()
        .then(( str ) => {
          let jsonObj = parser.parse(str);
          let data = jsonObj.feed.entry;
          // conditon to check if a new fetch call is required to fetch more data of past 30 days
          // checking the date of the last item of the page
          // if page's last item date and today's date difference is less than or equal to 30,
          // fetch call will be made to get more data
          if(typeof data !== "undefined"){
            let pageLastData = data[data.length-1];
            if(this.getDaysDifference(pageLastData.published) <= 30){
              let that = this;
              setTimeout(function(){
                that.getarticleCount(name, (start+end+1), 600);
              }, 3000);
            }
            // final articles count is reached
            // updates the state information
            else{
              let count = start + this.getValidDataCount(data);
              let k = this.state.authorArticleCount;
              k[name] = count;
              this.setState({authorArticleCount: k});
            }
          }
          // else will be executed if the API does not return any data due to continuous requests with in a short period of time
          // else will make the request to the current page util the data is being fetched
          else {
            let that = this;
            setTimeout(function(){
              that.getarticleCount(name, start, 600);
            }, 7000);
          }
        });
    });

  }

  // filters out the data which is published more than 30 days
  getValidDataCount(data){
    let count = 0;
    for(let i=0; i<data.length;i++){
      if(this.getDaysDifference(data[i].published) <= 30){
        count = count + 1;
      }
      else{
        break;
      }
    }
    return count;
  }

  // sets sate data
  setArticleData(data) {
    this.setState({articleData: data});
  }

  // handles the user click event to change the route that displays the article titles of the selected author
  handleClick(e, authorName){
    this.props.history.push("/author-details/" + authorName);
  }

  // returns the days difference between two given date and the current date
  getDaysDifference(date){
    let newDate = new Date(date.split('T')[0]);
    let currentDate = new Date();
    let res = Math.abs(currentDate - newDate) / 1000;
    let days = Math.floor(res / 86400);
    return days;
  }

  // gets list of authors for both multiple and single author articles
  getAuthorsList(){
    let authors = [];
    if(typeof this.state.articleData !== "undefined" && Array.isArray(this.state.articleData.author)){
      authors = this.state.articleData.author;
    }
    else if(typeof this.state.articleData !== "undefined") {
      authors = [this.state.articleData.author];
    }
    return authors;
  }

  // function to sort the authors based on the article count
  getSortedAuthorsList(){
    let sortedAuthors = [];
    if(typeof this.state.authorArticleCount !== "undefined" &&
        Object.keys(this.state.authorArticleCount).length !== 0){
      let articleData = this.state.authorArticleCount;
      let sortedKeys = Object.keys(articleData).sort(function(a,b){return articleData[b]- articleData[a]});
      sortedAuthors = sortedKeys;
      let authors = this.getAuthorsList();
      for(let i=0;i<authors.length;i++){
        if(!sortedAuthors.includes(authors[i].name)){
          sortedAuthors.push(authors[i].name);
        }
      }
    }
    else{
      let authors = this.getAuthorsList()
      for(let i=0;i<authors.length;i++){
        sortedAuthors.push(authors[i].name);
      }
    }

    return sortedAuthors;
  }

  render() {
    const { classes } = this.props;

    let sortedAuthors = this.getSortedAuthorsList();


    return (
      <div className={classes.root}>
        <h3>
          {typeof this.state.articleData !== "undefined" ? this.state.articleData.title : ''}
        </h3>
        <h4 className={classes.summaryTitle}> Article Summary: </h4>
        <Typography className={classes.summaryTitle}>
          {typeof this.state.articleData !== "undefined" ? this.state.articleData.summary : ''}
        </Typography>
        <h4 className={classes.summaryTitle}> Article Authors </h4>
          {sortedAuthors.map((item, i) => (
            <ListItem  key={i}  button>
              <ListItemText onClick = {e => this.handleClick(e, item)} inset primary={item} secondary=
              {typeof this.state.authorArticleCount[item] !== "undefined" ? `Past 30 days Articles Count: ${this.state.authorArticleCount[item]}` :
              `Past 30 days Articles Count: Loading...`}
              />
            </ListItem>
          ))}
      </div>
    );
  }

}

AuthorsList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AuthorsList);
