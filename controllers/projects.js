const Account = require('../models/accounts');
const { cloudinary } = require("../cloudinary");

module.exports.addProject = async (req, res, next) => {
    const { id } = req.params;
    const newProject = req.body;
    newProject.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    const updatedAccount = await Account.findByIdAndUpdate(
        id,
        { $push: { projects: newProject } },
        { new: true }
    );
    req.flash('success', 'Successfully made a new project!');
    res.redirect(`/prof`);
}

module.exports.searchProject = async (req, res, next) => {
    // const { id } = req.params;
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
    const {  accountID, projectID } = req.params;
    // Find the account by ID
    const account = await Account.findById(accountID);

    // Find the project in the account's projects array by project ID and update its viewCounter
    const project = account.projects.id(projectID);
    if (!project) {
        req.flash('error', 'Cannot find that project!');
        return res.redirect(`/home`);
    }
    
    for(let comment of project.comments){
       // console.log(comment.username)
        const account = await Account.findOne({ username: comment.username});
        if(account){
            if(account.image)comment.image = account.image;
        }
        
        
    }
    
    console.log(project.GeneralviewCounter)
    project.GeneralviewCounter += 1;
    
    await account.save();
    const projects = account.projects;

 // Return the updated project information to the client
 res.render('projectInfo', { project, webTitle: `${project.title}`, accountID, projects });
   
}

module.exports.displayProjectUserExists = async (req, res, next) => {
    const { id, accountID, projectID } = req.params;
    // Find the account by ID
    
    const account = await Account.findById(accountID);

    // Find the memebr by ID
    const member = await Account.findById(id);
    // Find the project in the account's projects array by project ID and update its viewCounter
    const project = account.projects.id(projectID);
    if (!project) {
        req.flash('error', 'Cannot find that project!');
        return res.redirect(`/home`);
    }
    for(let comment of project.comments){
        const account = await Account.findOne({ username: comment.username});
        if(account){
            if(account.image)comment.image = account.image;
        }
    }

    const user = { username: member.username, id: id };

    // Check if the user is already in viewMembers
    const hasViewed = project.viewMembers.some(viewer => viewer.id === id);
    project.GeneralviewCounter += 1;
    if (!hasViewed) {
        project.viewCounter += 1;
        project.viewMembers.push(user);
        
    }
    await account.save();
    const projects = account.projects;
 // Return the updated project information to the client
 res.render('projectInfo', { project, webTitle: `${project.title}`, accountID, projects });
   
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