const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
//using ejs in express 
app.set("view engine", "ejs");//place under app
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', { useNewUrlParser: true });
mongoose.set('strictQuery', true);

const itemSchema = {
  name: String
}
const Item = mongoose.model("Item", itemSchema);
const item = new Item({
  name: "create your list"
});
item.save();
//create a custum templates
const listSchema = {
  name: String,
  items: [itemSchema]
};
const defaultItem = [item];
const List = mongoose.model("List", listSchema);
app.get("/", function (req, res) {
  Item.find({}, function (err, foundItem) {
    if (foundItem.length == 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Sussefully inserted")
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", { kindDay: "Todays", addwork: foundItem });
    }
  });


});
//custom tamplate redirection
app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;

  //res.render("list",{kindDay:"Todays",addwork:list.items});
  console.log(customListName);
  const list = new List({
    name: customListName,
    items: defaultItem
  });
  List.findOne({ name: customListName }, function (err, foundList) {

    console.log(foundList);
    if (!err) {
      if (!foundList) {
        list.save();
        //res.render("list", { kindDay: customListName, addwork: foundList.items });
        //redirect custums
        res.redirect("/" + customListName);
      }
      else {
        console.log(customListName);
        res.render("list", { kindDay: customListName, addwork: foundList.items });
      }
    }

  });

});
app.post("/", function (req, res) {
  var itemNmae = req.body.addwork;
  var listname = req.body.button;

  const item = new Item({
    name: itemNmae
  });

  if (listname == "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listname }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listname);

    });

  }
});
app.post("/delete", function (req, res)
{
  const valdelete = req.body.checkbox;
  const listName = req.body.ListName;

  if (listName == "Today") 
  {
    Item.deleteOne({ id: valdelete }, function (err) {

      if (err)
      {
        console.log(err);
      }
      else {

        console.log("succefully deleted the document");
      }
      res.redirect("/");
    });
  }
  else 
  {

    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: valdelete } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});
app.listen(3000, function () {
  console.log("Server is running on port no 3000");
});