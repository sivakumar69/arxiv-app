// import statements
import React, { Component } from 'react';
import NavBar from './components/NavBar';
import TitlesList from './components/TitlesList';
import AuthorsList from './components/AuthorsList';
import AuthorDetails from './components/AuthorDetails';
import { BrowserRouter as Router, Route } from 'react-router-dom';

// fast-xml-parser to parse XML data to JSON data
let parser = require('fast-xml-parser');

class App extends Component {

  constructor(props){
    super(props);
    // initializing the initial state data
    this.state = {
      apiData: []
    };
    this.setApiData = this.setApiData.bind(this);
  }

  componentDidMount(){
    // constant array initialized to the search terms to get base URL
    const searchParams = ['psychiatry', 'therapy', 'data science', 'machine learning'];
    // searchQuery is constructed manually instead of iterating searchParams array as the search paremeters are less
    let searchQuery = `search_query=all:${searchParams[0]}+OR+all:${searchParams[1]}+OR+all:${searchParams[2]}+OR+all:${searchParams[3]}`;
    const baseUrl = `https://cors-anywhere.herokuapp.com/http://export.arxiv.org/api/query?` + searchQuery;

    // condition checking before calling the getResults to reduce unnecessary burden on the server
    if(window.location.pathname === '/'){
      this.getResults(baseUrl, 0, 100);
    }
  }

  // recursive function to get titles of the past 30 days based on the published date
  getResults(baseUrl, start, end){
    // stopping conditon to stop the backround asynchronous http get requests
    if(window.location.pathname !== '/'){
      return;
    }
    let additionalSearch = `&sortBy=submittedDate&start=${start}&max_results=${end}`;
    const url = baseUrl + additionalSearch;
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/xml',
        'Content-Type': 'application/json',
      },
    }).then(response => response)
      .then(data => {
        data.text()
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
            this.setApiData(entryData, days);
          }
          // else will be executed if the API does not return any data due to continuous requests with in a short period of time
          // else will make the request to the current page util the data is being fetched
          else {
            end = end - 300;
          }
          // condition to fetch more data
          if(days <= 30){
            let that = this;
            // timeout (3 seconds delay) is imposed as the api will not respond to the multiple requests with in a short period of time
            setTimeout(function(){
              that.getResults(baseUrl, end+1, end+300);;
            }, 3000);

          }
        });
    });
  }


  // sets data to the state variable to show the user
  setApiData(data, days) {
    let k = this.state.apiData;
    // this condition will be executed when the page has more than 30 day period data
    if(days > 30){
      k = k.concat(this.getValidData(data));
    }
    else{
      k = k.concat(data);
    }

    this.setState({apiData: k});
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

  // returns the days difference between two given date and the current date
  getDaysDifference(date){
    let newDate = new Date(date.split('T')[0]);
    let currentDate = new Date();
    let res = Math.abs(currentDate - newDate) / 1000;
    let days = Math.floor(res / 86400);
    return days;
  }


  // render function to display data to the user
  render() {
    return (
      <div>
        <NavBar />
        <Router>
          <div style={{height:"100vh", width: "100vw", marginTop:"1%"}}>
            <Route exact path="/"
              render={(props) => <TitlesList {...props} itemsList={this.state.apiData} />} />
            <Route exact path="/article-details/:id"
              render={(props) => <div style={{height:"100%", width:"100%", }}>
              <AuthorsList {...props} articleID={props.match.params.id} /> </div>} />
            <Route exact path="/author-details/:name"
              render={(props) => <div style={{height:"100%", width:"100%", }}>
              <AuthorDetails {...props} authorName={props.match.params.name} /> </div>} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
