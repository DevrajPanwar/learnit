const path = require('path');
var express = require('express');
var methodOverride = require('method-override');
var app = express();
var bodyParser = require("body-parser");
var expressSanitizer = require("express-sanitizer")
var mongoose = require("mongoose");
const { stringify } = require('querystring');

mongoose.connect('mongodb://localhost:27017/courses', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


const QuestionSchema = new mongoose.Schema({
    description: String,
    alternatives: [
        {
            text: {
                type: String,
                required: true
            },
            isCorrect: {
                type: Boolean,
                required: true,
                default: false
            }
        }
    ]
});

var CourseSchema = new mongoose.Schema({
	name: String,
	img : String,
	body: String,
	created:{type:Date, default: Date.now}
});

var ques = mongoose.model("ques", QuestionSchema)
var Blog = mongoose.model("Blog", CourseSchema);


app.get("/", function(req, res){
	res.render("home");
});

// display all blogs
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
			if(err){
				console.log(err);
			}
			else{
				res.render("index", {blogs:blogs});
			}
	});

});


app.get("/blog/new", function(req, res){
		res.render("new");
});

// create 
app.post("/blogs", function(req, res){
	// console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// console.log("=====================");
	// console.log(req.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.redirect("new")
		}
		else{
			//redirect to the index
			console.log(newBlog);
			res.redirect("/blogs");
		}
	});
	
});

app.get("/blog/:id",function(req, res){
	Blog.findById(req.params.id, function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("showBlog", {blog:foundBlog});
		}
	});
});

app.get("/blog/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("edit", {blog: foundBlog});
		}
	});
});

app.put("/blog/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//Blog.findByIdAndUpdate(id, new data, callback)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blog/"+ req.params.id);
		}
	});
});

app.delete("/blog/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs");
		}
	});
});




app.get("/blogs/blog/:id/quizadd", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("newquiz", {blog: foundBlog});
		}
	});
});

app.post("/blogs/blog/:id/quiz", function(req, res){
	// console.log(req.body);
	req.body.ques.body = req.sanitize(req.body.ques.body);
	// console.log("=====================");
	// console.log(req.body);
	ques.create(req.body.ques, function(err, newQues){
		if(err){
			res.redirect("newquiz")
		}
		else{
			//redirect to the index
			console.log(newQues);
			res.redirect("/blog/:id");
		}
	});
	
});


app.listen(3001, function(){
	console.log("server started.....");
});