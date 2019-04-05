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

    fetch(url , {method: 'GET',
      headers: {Accept: 'text/xml','Content-Type': 'application/json',},
      }).then(response => {
        response.text()
        .then(( str ) => {
          let jsonObj = parser.parse(str);
          if(Array.isArray(jsonObj.feed.entry.author)){
            this.getAuthorArticleCount(jsonObj.feed.entry.author);
          }
          else{
            this.getAuthorArticleCount([jsonObj.feed.entry.author]);
          }
          this.setArticleData(jsonObj.feed.entry);
        });
    });

  }

  getAuthorArticleCount(authors) {
    for(let i=0;i<authors.length;i++){
      this.getarticleCount(authors[i].name, 0, 200);
    }
  }

  getarticleCount(name, start, end){
    let url = `https://cors-anywhere.herokuapp.com/http://export.arxiv.org/api/query?search_query=au:${name}&sortBy=submittedDate&start=${start}&max_results=${end}`;

    if(!window.location.pathname.includes("article-details")) {
      return;
    }

    fetch(url , {method: 'GET',
      headers: {Accept: 'text/xml','Content-Type': 'application/json',},
      }).then(response => {
        response.text()
        .then(( str ) => {
          let jsonObj = parser.parse(str);
          let data = jsonObj.feed.entry;
          if(typeof data !== "undefined"){
            let pageLastData = data[data.length-1];
            if(this.getDaysDifference(pageLastData.published) <= 30){
              let that = this;
              setTimeout(function(){
                that.getarticleCount(name, end+1, end+500);
              }, 4000);
            }
            else{
              let count = start + this.getValidDataCount(data);
              let k = this.state.authorArticleCount;
              k[name] = count;
              this.setState({authorArticleCount: k});
            }
          }
          else {
            let that = this;
            end = end - 500;
            setTimeout(function(){
              that.getarticleCount(name, end+1, end+300);
            }, 4000);
          }
        });
    });

  }

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

  setArticleData(data) {
    this.setState({articleData: data});
  }

  handleClick(e, authorName){
    window.location = "/author-details/" + authorName;
  }

  getDaysDifference(date){
    let newDate = new Date(date.split('T')[0]);
    let currentDate = new Date();
    let res = Math.abs(currentDate - newDate) / 1000;
    let days = Math.floor(res / 86400);
    return days;
  }

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
