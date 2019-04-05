# arXiv App
Internship Assignment

# Technology Stack
Used `React.js` Framework with `react-dom-router` for routing, `Material UI` for designing web pages, `arXiv API` for fetching the technical articles data 

# Steps For Running the Application

1. Install `Node.js` and `NPM` on the machine if not already installed
2. Clone/Download the project to your local machine
3. Navigate to the app.js file location in the command prompt
4. run `npm install` command to install all the dependencies that are required to run the project
5. run `npm start` command
6. Web Application will be launced automatically on `localhost:3000` after a while
7. use `Chrome` browser for better view of the application

# Following are the screenshots of the application 

# 1. Application Homepage
Fetches articles published in last 30 days from the arxiv api related to psychiatry, therapy, data science or machine learning categories. on click of the article title redirects user to the article summary page.

# Note
Data Fetching is done incrementally for all the pages. initially 100 articles and then 200 articles each time until the article published and the current date differ more than 30 days. Each request is delayed by 3-4 seconds by using timeouts

![picture](https://raw.githubusercontent.com/sivakumar69/arxiv-app/master/public/images/page_1.JPG)

# 2. Artcle Summary Page
This page displays article title, summary and the list of authors. Each author is displayed along with the count of articles that they have published in last 30 days. 
Authors are ordered by the number of articles published in the last 30 days.
on click of author redirects user to page that displays article titles.

![picture](https://raw.githubusercontent.com/sivakumar69/arxiv-app/master/public/images/page_2.JPG)

# 3. Author's Articles 
Displays articles published by the author

![picture](https://raw.githubusercontent.com/sivakumar69/arxiv-app/master/public/images/page_3.JPG)


