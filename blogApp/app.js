var bodyParser = require('body-parser'),
mongoose = require('mongoose');
methodOverride = require('method-override');
expressSanitizer=require('express-sanitizer');
express = require('express');
app = express();


//app config ________

mongoose.set("useUnifiedTopology" , true);
mongoose.set('useNewUrlParser', true);

mongoose.connect('mongodb://localhost:27017/blogApp', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB Connected...'))
    .catch((err) => console.log(err))

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(expressSanitizer());

//mongoose model config ________

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now} 
});

var Blog = mongoose.model('Blog', blogSchema);

// Blog.create({
// 	title: 'Test blog',
// 	image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
// 	body: 'This is a blog post'
// });

//RESTFUL Routes ________

//index route

app.get("/", function(req, res){
	res.redirect('/blogs');
});

app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if (err){
			console.log(error);
		} else {
			res.render('index', {blogs: blogs});
		}
	});
});

// new route
app.get("/blogs/new", function(req, res){
	res.render('new');
});

//create route
app.post("/blogs", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render('new');
		} else {
			res.redirect('/blogs');
		}

	})
});

//show route
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect('/blogs');
		} else {
			res.render('show', {blog: foundBlog});
		}
	})
});

//edit route
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect('/blogs');
		} else {
			res.render('edit', {blog: foundBlog});
		}
	});
});

//update route

app.put('/blogs/:id/', function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs/' + req.params.id);
		}
	});
});

//delete route
app.delete('/blogs/:id', function(req, res){
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs');
		}
	})
});


app.listen(3000, function(){
	console.log('server is running');
});
