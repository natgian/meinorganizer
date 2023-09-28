const { Project, ToDo, Link, ProjectExpense, ProjectBudget } = require("../models/project");
const User = require("../models/user");

// RENDER PROJECTS PAGE
module.exports.renderProjektePage = async (req, res, next) => {
  const projects = await Project.find({ user: req.user._id }).populate("user");
  res.render("pages/projekte", { projects });
};

// RENDER NEW PROJECT PAGE
module.exports.renderNewProject = (req, res) => {
  res.render("projects/newProject");
};

// // CREATE A NEW PROJECT
module.exports.createProject = async (req, res) => {
  const newProject = new Project(req.body);
  newProject.user = req.user._id;
  await newProject.save();
  req.user.projects.push(newProject._id);
  await req.user.save();
  res.redirect(`/projekte/${newProject._id}`);
};

// // RENDER LISTEN SHOW PAGE
// module.exports.showList = async (req, res) => {
//   const { listId } = req.params;
//   try {
//     const foundList = await List.findById(listId)
//       .populate("items")
//       .populate({
//         path: "user",
//         populate: { path: "lists" }
//       });
//     if (!foundList) {
//       res.status(404).render("pages/404");
//     }
//     else {
//       if (req.user && req.user._id.equals(foundList.user._id)) {
//         res.render("lists/show", { foundList });
//       } else {
//         res.status(403).render("pages/403");
//       }      
//     }
//   }
//   catch (err) {
//     if (err.name === "CastError") {
//       res.status(404).render("pages/404");
//     }
//     else {
//       res.status(500).render("pages/error");
//     }
//   }
// };

// // RENDER LISTEN EDIT PAGE
// module.exports.renderEditList = async (req, res, next) => {
//   const { listId } = req.params;
//   const foundList = await List.findById(listId);
//   res.render("lists/edit", { foundList });
// };

// // EDIT A LIST
// module.exports.editList = async (req, res) => {
//   const { listId } = req.params;
//   const foundList = await List.findByIdAndUpdate(listId, req.body, { runValidators: true });
//   res.redirect(`/listen/${foundList._id}`);
// };

// // DELETE A LIST
// module.exports.deleteList = async (req, res) => {
//   const { listId } = req.params;

//   const foundList = await List.findById(listId);
//   const itemIds = foundList.items;

//   await Item.deleteMany({ _id: { $in: itemIds } });
//   await List.findByIdAndDelete(listId);
//   await User.findByIdAndUpdate(req.user._id, { $pull: { lists: listId } });
//   res.redirect("/listen");
// };

// // ADD NEW ITEM TO A LIST
// module.exports.addNewListItem = async (req, res) => {
//   const { listId } = req.params;
//   const newItem = new Item({ text: req.body.text });
//   const savedItem = await newItem.save();
//   const foundList = await List.findById(listId);
//   foundList.items.push(savedItem);
//   await foundList.save();
//   res.redirect(`/listen/${foundList._id}`);
// }

// // DELETE ITEM FROM A LIST
// module.exports.deleteItemFromList = async (req, res) => {
//   const { listId, itemId } = req.params;

//     const foundList = await List.findById(listId);
//     const itemIndex = foundList.items.indexOf(itemId); // Check if the item exists in the list's items array

//     if (itemIndex !== -1) {
//       foundList.items.splice(itemIndex, 1);// Remove the item from the list's items array
//       await foundList.save();
//       await Item.findByIdAndDelete(itemId);
//       await User.findByIdAndUpdate(req.user._id, { $pull: { lists: listId } });

//       res.redirect(`/listen/${listId}`);
//     } else {
//       res.status(404).render("pages/404");
//     }
// };


