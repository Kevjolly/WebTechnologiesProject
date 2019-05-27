# Web Technologies Project Report

## Pair
* Kévin Jolly, Candidate Number 97249
* Ren Jiang, Candidate Number 97247

## Cloud hosted site
The site is hosted on AWS Elastic Beanstalk and is available at <https://www.teamupbriuni.me/>. For messaging functionalities to work, notification permission should be granted when asked and https should always be used.

## Starting the website locally

***We've only tested our site on Linux and MacOS, not Windows.*** We use the following software versions.
* Node: v11.4.0
* npm: 6.4.1

1. Download our Elasticsearch bundle from [Google Drive](https://drive.google.com/file/d/1T0pKt31EHrQKyf-4EPELZ_0NneCTkKnH/view?usp=sharing) and unzip it. The reason for this is that we did some configuration to the original bundle to make it support https and user authentication.
2. Run *bin/elasticsearch*
3. Inside site directory, run *npm install* to install dependencies
4. Run *node .* and the website should be available at <http://localhost:8081>
5. For messaging functionalities to work, notification permission should be granted

## Project Overview
TeamUP is a website where people can form teams to work on different projects. Users can create projects which people can request to join or be invited. A search functionality helps them find people with desired skills and projects of interest. Users can also communicate with other users individually or with the other participants of a project they are involved in using the provided instant messaging functionalities. Acceptance of application requests or invitations for projects are handled in the messaging section.

## Estimations with description

### A for HTML
* All desired pages of the website were done. We stayed consistent for all pages to keep the same structure and design throughout the site; 
    * Head 
    * Body
        * Header with the navbar and the side navbar in case of small screen;
        * Main section with firstly the content of the page and secondly the modals which are opened in different circumstances. They are either available on all pages like the login modal or they are specific to one page such as the invite to project modal;
        * Footer with a link to our github repository.
* Being used to using Bootstrap, we chose to take [Materialize.css](https://materializecss.com/) as the main framework to try something new. The HTML pages sometimes contain almost duplicate divs: one for when the window is large and one for when the window is small. Most functionalities of materialize were used: most notably colors, grids, navbar, cards, collections, forms, modals, pagination for the search results, toasts for user feedback when doing an action;
* The chat box on the messaging page turned out to be exactly how we imagined it. For the design of the right column with messages, we got inspired by the work of https://bootsnipp.com/materialize/snippets/lVBkM and modified it to adjust to our needs.

### A for CSS
* A non-negligible part of the CSS work involved overwriting materialize css to adjust it to our need;
* One of the most difficult work was to make the background image fit nicely between the navbar and the footer and be blury in the background of the content;
* The CSS also takes part in making the content fit when the window is resized.

### A for JS
* Client-side Javascript code is well encapsulated as SDKs such as instance messaging and user authentication. Also, advanced features like IndexedDB and service workers are used in the implementation of instant messaging.
* [jQuery](https://jquery.com/) was used to simplify JS coding;
* Work has been done to ensure that information is coherent on different places. For e.g. the choices, search content or options in the navbar are the same in the side navbar when the window is resized;
* We tried to ensure that any error message is given back to the user through a toast appearing in the top right corner of the page after doing an action. Furthermore, functionalities are hidden when the user already used them or can not use them (without being logged in for instance). Verification on user inputs (for instance by using regex) or/and if the user is logged in before doing get or post requests to the server are made so that requests which will send back error messages are not sent when they can be prevented in the front-end;
* Search results are displayed in cards and limited to 12 by page. Pagination is adjusted to the number of results.
* [Ajax](https://www.w3schools.com/js/js_ajax_intro.asp) is used in order to do asynchronous requests to the server in the background: sending messages, joining a project, quitting a project to name but a few.
* As with materialize.css html classes and other css, the JavaScript also makes sure content does not extend too much. For e.g. if a username or a project name is too long, either overflow is added or the text is cut down and we add '...';
* [Alasql](http://alasql.org/) was used for the front-end storing of chat messages and user identity housekeeping;
* [Firebase messaging sdk](https://firebase.google.com/docs/reference/js/) is used to implement instant messaging and notification;
* One important work of the front-end display of messages regarded how to refresh conversations. When the message page is refreshed, only the base information of the conversations is loaded for the left column (in descending order of the time of the last message and the conversation with the first user in the list is loaded and displayed in ascending order. It is also done each time the page regains focus, except here we reload the conversation which was last opened by the user. Only one conversation is always loaded. When a new message is received, the time on the list of conversations is modified and the conversation is put at the top of that list. If it is a message of the opened conversation it is added at the bottom. When a message is sent, it is also added at the bottom of the conversation.

### B for PNG
* A cartoon portrait is created from an original photo inspired by a tutorial;
* A pokeball is created following a tutorial using features like shape tools, gradient tools, airbrush, etc.
* An original artwork is created using images from the internet and the pokeball we have done.

### A for SVG
* Original site logo and favicon are designed;
* Features such as shape tools, transformation and gradient are used.

### A for Server
* Code is clearly organised in a 3-layer structure (router, service and dao); 
* Json Web Token (user session) validation; 
* XSS protection middleware;
* Using [Firebase Cloud Messaging](https://firebase.google.com/products/cloud-messaging) to implement instant messaging and notification; 
* Messages are stored and maintained in server side so that users can still get messages sent to them while they are offline;
* Cloud hosting using [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) with https support;
* Configuration is handled in such a way that values are chosen automatically in different environments (local and cloud).
  
### A for Database
* Instead of traditional SQL databases we are used to use, [Elasticsearch](https://www.elastic.co/products/elasticsearch) is chosen for this project for both indexing documents and data storage; 
* The reason is that search engine is a vital functionality in the project for matching people and projects.
* In order to meet different search requirements, different indexing strategies are required for different entities and different properties; 
* Database related code is organised into a separate module using singleton pattern to better manage connections; 
* Security is guaranteed using https and username password authentication.

### A for Dynamic pages
* A combination of client-side rendering (instant messaging notably) and server-side rendering (for most of the rest) is used;
* [Mustache](https://www.npmjs.com/package/mustache-express) and [jQuery](https://jquery.com/) are used for server-side and client-side dynamic page rendering respectively.

### Depth
All the functionalities that we wanted to do were done. Only a few bugs are missing, which some are identified but would require more time to be solved. As said in the preliminary report, we had already worked on projects with traditional SQL databases or frameworks like Bootstrap. Therefore, we decided to try to use new tools like for instance Materialize.css for the front-end and Elasticsearch for the database. Thus, a non-negligible part of the time was spent learning about those frameworks. We are particularly proud of the
instant messaging with notifications system and the search engine on the server side and the design of the message and search results pages on the front-end.