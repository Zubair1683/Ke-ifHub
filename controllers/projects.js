const Account = require('../models/accounts');
const { cloudinary } = require("../cloudinary");
const Review = require('../models/review');
const Projects = require('../models/projects');



module.exports.searchProject = async (req, res, next) => {
     const searchedProject = req.body.search.toLowerCase();
     const accounts = await Account.find({});
     let orderedProjects = [];
     let orderedtopProjects = [];
    
     // Step 1: Flatten the nested structure
     for (const account of accounts) {
         for (const project of account.projects) {
             let myArray = project.title.toLowerCase().split(" ");
             if(project.title.toLowerCase() == searchedProject || myArray.includes(searchedProject)) orderedProjects.push({ project, author: account.username, accountID: account._id });
 
             orderedtopProjects.push({ project, author: account.username, accountID: account._id });
         }
     }
     orderedProjects = orderedProjects.length > 0 ? orderedProjects : null;
     res.render(`search`, { orderedtopProjects, orderedProjects, accounts, webTitle: `home - searched => ${searchedProject}`, searchedText: req.body.search})
 }

 module.exports.displayProjectUserNotExists = async (req, res, next) => {
    const { accountID, projectID } = req.params;
    
    // Find the account by ID
    const account = await Account.findById(accountID);

    // Find the project in the account's projects array by project ID and update its viewCounter
    const project = account.projects.id(projectID);
    if (!project) {
        req.flash('error', 'Cannot find that project!');
        return res.redirect(`/home`);
    }
    
    // Update the comment images with the account's image if it exists
    for(let review of project.reviews) {
        const commentAccount = await Account.findOne({ username: review.username });
        if (commentAccount && commentAccount.image) {
            review.image = commentAccount.image;
        }
    }
    
    // Increase the GeneralviewCounter and mark the project as modified
    project.generalViewCounter += 1;
    const reviews = await Review.find({ id: project.id });
    // Save the updated account
    await account.save();
    const projects = account.projects;

 // Return the updated project information to the client
 res.render('projectInfo', { project, webTitle: `${project.title}`, accountID, projects,reviews });
   
}

module.exports.displayProject = async (req, res, next) => {
    const project = await Projects.findById(req.params.id).populate();
    const reviews = await Review.find({ id: project._id });
    // Find the account by ID
    if (!project) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/projects');
    }
    // Find the memebr by ID
   /* const member = await Account.findById(id);
    for(let review of project.reviews){
        const account = await Account.findOne({ username: review.username});
        if(account){
            if(account.image)review.image = account.image;
        }
    }

    const user = { username: member.username, id: id };

    // Check if the user is already in viewMembers
    const hasViewed = project.viewMembers.some(viewer => viewer.id === id);
    project.generalViewCounter += 1;
    //const reviews = await Review.find({ id: project.id });
    if (!hasViewed) {
        project.viewCounter += 1;
        project.viewMembers.push(user);
        
    }
    await account.save();*/
    const projects = await Projects.find({}).populate();
 // Return the updated project information to the client
 res.render('projects/projectInfo', { project, reviews, webTitle: "product.title",projects });

 //res.render('projectInfo', { project, webTitle: `${project.title}`, accountID, projects,reviews });
   
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

module.exports.editProject = async (req, res, next) => {
    const { accountID, projectID } = req.params;
    const account = await Account.findById(accountID);
    const project = account.projects.id(projectID);
    res.render('edit', { projectID, webTitle: `${project.title} => edit`, project });
}

module.exports.updatePoject = async (req, res, next) => {
    const { accountID, projectID } = req.params;
    // Find the account by ID
    const account = await Account.findById(accountID);

    // Find the project in the account's projects array by project ID
    const project = account.projects.id(projectID);
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // Update project properties based on request body
    project.title = req.body.title;
    project.shortInfo = req.body.shortInfo;
    project.images.push(...imgs);
    project.info = req.body.info;

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        project.images = project.images.filter(image => !req.body.deleteImages.includes(image.filename));
    }

    // Save the updated account (which includes the updated project)
    await account.save();
   
    req.flash('success', 'Successfully updated the project!');
    // Redirect to the account's page or any other desired route
    res.redirect(`/project/${accountID}/${accountID}/${projectID}`);
}

module.exports.deleteProject = async (req, res, next) => {
    const { accountID, projectID } = req.params;

    // Find the account by ID
    const account = await Account.findById(accountID);

    // Use Mongoose array pull method to remove the project from the array
    account.projects.pull({ _id: projectID });

    // Save the account (which includes removing the project from the array)
    await account.save();
    req.flash('success', 'Successfully deleted the project!');
    res.redirect(`/myAccount`)
}


module.exports.renderProjects = async (req, res, next) => {
    const accounts = await Account.find({});
    //console.log(accounts[0])
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