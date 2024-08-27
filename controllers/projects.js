const Account = require('../models/accounts');
const { cloudinary } = require("../cloudinary");
const Review = require('../models/review');
const Projects = require('../models/projects');

module.exports.searchProject = async (req, res, next) => {
    const searchedProject = req.body.search.toLowerCase();
    const projects = await Projects.find({}).populate('popupText');
    let orderedProjects = [];
    let orderedtopProjects = [];
    // Step 1: Flatten the nested structure
    for (const project of projects) {
            let myArray = project.title.toLowerCase().split(" ");
            const normalizedSearchProject = searchedProject.trim().toLowerCase();

// Check if product.title matches the normalized searchProduct or is in myArray
if (project.title.toLowerCase() === normalizedSearchProject || myArray.map(item => item.trim().toLowerCase()).includes(normalizedSearchProject)) {
    orderedProjects.push(project);
}
    }
    const accounts = await Account.find({});
    orderedProjects = orderedProjects.length > 0 ? orderedProjects : null;
    res.render(`projects/search`, { orderedtopProjects, orderedProjects, accounts, webTitle: `home - searched => ${searchedProject}`, searchedText: req.body.search})
 }

module.exports.displayProject = async (req, res, next) => {
    const project = await Projects.findById(req.params.id).populate();
    const reviews = await Review.find({ id: project._id });
    // Find the account by ID
    if (!project) {
        req.flash('error', 'Cannot find that project!');
        return res.redirect('/projects');
    }
   if(reviews.length > 0){
    for(let review of reviews){
        const account = await Account.findOne({ username: review.author});
        if(account){
            if(account.image){
                review.imageURL = account.image.url;
                await review.save();
            }
        }
    }
}
if(req.user){
    const user = { username: req.user.username, id: req.user._id };
    const hasViewed = project.viewMembers.some(viewer => viewer.id === req.user._id);
    if (!hasViewed) {
        project.viewCounter += 1;
        project.viewMembers.push(user);
    }
}
project.generalViewCounter += 1;
    await project.save();
    
    const projects = await Projects.find({}).populate();
 res.render('projects/projectInfo', { project, reviews, webTitle: "product.title",projects, accountID: project.id });
}

module.exports.renderAddProject = async (req, res, next) => {
    res.render('projects/addProject', { webtitle: "addProject" })
}

module.exports.createProject = async (req, res, next) => {
    const newProject = new Projects(req.body.project);
    const account = await Account.findById(req.user._id);
    newProject.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newProject.author = req.user.username;
    newProject.id = account._id;
    account.projects.push(newProject);
    await newProject.save();
    await account.save();
    req.flash('success', 'Successfully made a new project!');
    res.redirect(`/projects/${newProject._id}`);
}

module.exports.renderEditProject = async (req, res, next) => {
    const { id } = req.params;
    const project = await Projects.findById(id)
    if (!project) {
        req.flash('error', 'Cannot find that project!');
        return res.redirect('/projects');
    }
    res.render('projects/edit', { projectID: id, webTitle: `${project.title} => edit`, project });
}

module.exports.updatePoject = async (req, res, next) => {
    const { id } = req.params;
    const { project } = req.body;

    // Find the account by the current user's ID
    const account = await Account.findById(req.user._id);

    // Find the campground by its ID and update it
    const updatedProject = await Projects.findByIdAndUpdate(id, { ...project }, { new: true });


    // Add new images to the campground
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    updatedProject.images.push(...imgs);

    // Save the updated campground
    await updatedProject.save();

    // If there are images to delete, remove them from both Cloudinary and the campground
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedProject.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    // Update the campground in the account's campgrounds array
    const accountProjectIndex = account.projects.findIndex(camp => camp._id.toString() === id);
    if (accountProjectIndex !== -1) {
        // Replace the old campground with the updated one
        account.projects[accountProjectIndex] = updatedProject;
        await account.save(); // Save the updated account
    }

    req.flash('success', 'Successfully updated project!');
    res.redirect(`/projects/${updatedProject._id}`);
}

module.exports.deleteProject = async (req, res, next) => {
    const { id } = req.params;

    // Find the campground to delete
    const project = await Projects.findById(id)

    if (!project) {
        req.flash('error', 'Project not found');
        return res.redirect('/projects');
    }

    // Find the account of the currently logged-in user
    const account = await Account.findById(req.user._id);

    if (!account) {
        req.flash('error', 'Account not found');
        return res.redirect('/projects');
    }

    // Remove the campground from the account's campgrounds array
    account.projects = account.products.filter(pro => pro._id.toString() !== id);
    await account.save();
// Optionally, delete associated images from Cloudinary if you have image URLs stored
    // For example, you may need to delete images as follows:
    if (project.images) {
        for (let image of project.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
    }

    // Delete the campground document
    await Projects.findByIdAndDelete(id);

    
    req.flash('success', 'Successfully deleted project');
    res.redirect('/projects');
}

module.exports.renderProjects = async (req, res, next) => {
    const accounts = await Account.find({});
    let orderedProjects = [];
  
    for (const account of accounts) {
        const projects = await Projects.find({ id: account._id });
        for (const project of projects) {
            orderedProjects.push({ project, author: account.username, accountID: account._id });
        }
    }

    let orderedTrendProjects = orderedProjects;
    let orderedtopProjects = orderedProjects;
    let orderedRecProjects = orderedProjects;
    
    // Remove the averageRating property if you don't want it in the final sorted array
    orderedRecProjects.forEach(project => {
        delete project.averageRating;
    });

    // Step 2: Sort the projects based on the average rating
    orderedProjects.sort((a, b) => new Date(b.project.date) - new Date(a.project.date));
    orderedtopProjects.sort((a, b) => b.project.viewCounter - a.project.viewCounter);
    orderedTrendProjects.sort((a, b) => {
                b.project.GeneralviewCounter - a.project.GeneralviewCounter
            
     } ).reverse();
   
    orderedRecProjects.sort((a, b) => b.averageRating - a.averageRating).reverse();
    orderedProjects.reverse();
    orderedTrendProjects = filter(orderedTrendProjects);
    orderedRecProjects = filter(orderedRecProjects);
    orderedtopProjects = filter(orderedtopProjects);
    res.render(`projects/projects`, { orderedtopProjects, orderedTrendProjects, orderedRecProjects,orderedProjects, accounts, webTitle: "projects" });
}

const filter = (project) => {
    if (project.length < 10) {
        // Calculate the new length (half of the original length)
        const newLength = Math.ceil(project.length / 2);

        // Slice the array to keep only the first `newLength` elements
        return project = project.slice(0, newLength);
    }
    else {
        return project = project.slice(0, 10);
    }
}