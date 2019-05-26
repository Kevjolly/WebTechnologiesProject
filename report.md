# Web Technologies Project Report

## Pair
* Kévin Jolly, Candidate Number 97249
* Ren Jiang, Candidate Number 97247

## Starting the website locally
1. Unzip the Elasticsearch bundle
2. Run bin/elasticsearch (or bin\elasticsearch.bat on Windows)
3. Run *npm install* to install dependencies
4. Run *node site* and the website should be available at <localhost:8081>
5. For messaging functionalities to work, notification permission should be granted
   
## Cloud hosted site
[//]: # (TODO)

## Project Overview
TeamUP is a website where people can form teams to work on different projects. Users can create projects which people can join . A search functionality helps them find people with desired skills and projects of interest. Users can also communicate each other using the provided instant messaging functionalities.

## Estimations with description

### A for HTML
* Two pages of the website have been worked on, but the basic design of the website is done.
* Being used to using Bootstrap, we chose to take [Materialize.css](https://materializecss.com/) as the main framework to try something new.
  
### A for CSS

### A for JS
* Work has been done to ensure that information in the navbar is coherent with the side navbar when the window is resized (especially the search box).
*  [jQuery](https://jquery.com/) was used to simplify JS coding. 
*  [Alasql](http://alasql.org/) was used for the front-end storing of chat messages and user identity housekeeping. 
*  [Firebase messaging sdk](https://firebase.google.com/docs/reference/js/) is used to implement instant messaging and notification.
*  Client-side Javascript code is well encapsulated as SDKs such as instance messaging and user authentication. Also, advanced features like IndexedDB and service workers are used in the implementation of instant messaging.
  
### A for PNG
* A cartoon portrait is created from an original photo inspired by a tutorial.
* A pokeball is created following an tutorial using features like shape tools, gradient tools, airbrush, etc.
* An original artwork is created using images from the internet and the pokeball we have done.
  
### A for SVG
* Original site logo and favicon are designed. 
* Features such as shape tools, transformation and gradient are used.

### A for Server
* Code is clearly organised in a 3-layer structure (router, service and dao). 
* Json Web Token (user session) validation. 
* XSS protection middleware. 
* Using [Firebase Cloud Messaging](https://firebase.google.com/products/cloud-messaging) to implement instant messaging and notification. 
* Messages are stored and maintained in server side so that users can still get messages sent to them while they are offline.
* Cloud hosting using [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/).
* Configuration is handled in such a way that values are chosen automatically in different environments (local and cloud).
  
### A for Database
* Instead of traditional SQL databases, [Elasticsearch](https://www.elastic.co/products/elasticsearch) is chosen for this project for both indexing documents and data storage. 
* The reason is that search engine is a vital functionality in the project for matching people and projects.
* In order to meet different search requirements, different indexing strategies are required for different entities and different properties. 
* Database related code is organised into a separate module using singleton pattern to better manage connections. 
* Security is guaranteed using https and username password authentication.

### X for Dynamic pages
* A combination of client-side rendering (instant messaging notably) and server-side rendering (for most of the rest) is used.
* [Mustache](https://www.npmjs.com/package/mustache-express) and jQuery are used for server-side and client-side dynamic page rendering respectively.