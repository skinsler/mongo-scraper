var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.mprnews.org/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    console.log($);
    // Now, we grab every h2 within an article tag, and do the following:
    $(".churn").each(function(i, element) {
      // Save an empty result object
      var result = {};

      
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).find("h2").text();
      result.link = $(this).children("a").attr("href");
      result.blurb = $(this).find("p").text().trim(); 

      console.log(result.blurb);
      console.log(result.title);
      console.log(result.link);


      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find()
  .then(function(articles) {
    res.json(articles);
  })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.findOne({_id: req.params.id})
  .then(function(dbArticle) {
    res.json(dbArticle)
  })
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Note.create(req.body)
  .then(function(dbNote){
    return db.Article.findOneAndUpdate({_id: req.params.id},{$push:{notes:dbNote._id}},{new:true})
  })
  .then(function(article){
    res.json(article)
  })
});

app.delete("/articles/", function(req, res) {
  db.Article.deleteOne({
    _id : req.body.id
  })
    .then(function(result) {
      console.log(result);
      res.json(result);
  });
});

app.post("/comments/", function(req, res) {
  console.log(req.body);
  db.Comment.create({ comment: req.body.comment})
    .then(function(dbComment) {
      return db.Article.findOneAndUpdate(
        { _id: req.body.id },{ $push: { comments:dbComment._id } },{ new: true }
      );
    })
    .then(article => {
      res.json(article);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
