//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// database mongoose conection
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://admin_ankush:Polaris1!@cluster0.4lwslu7.mongodb.net/todolistDB", {
  useNewUrlParser: true
})

const itemSchema = {
  name: String
};

const Item = mongoose.model("item", itemSchema);

const work = new Item({
  name: "work on home office"
});
const eat = new Item({
  name: "eat healthy food"
});
const sleep = new Item({
  name: "sleep tight"
});
const defaultIteams = [work, eat, sleep];

const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  //const day = date.getDate();
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultIteams, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully added into the database");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.get("/:customListName", function(req, res) {
  //const customListName = _.lowerCase(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //add list
        const list = new List({
          name: customListName,
          items: defaultIteams
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // show list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("item is deleted from the list");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}}, function(err, result){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }



});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function(req, res){
  console.log("server start at port 3000....");
});
