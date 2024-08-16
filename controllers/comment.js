const Account = require('../models/accounts');

module.exports.createCommentUserNotExist = async (req, res, next) => {
    const { accountID, projectID, id } = req.params;
    // Find the account by ID
    const currentaccount = await Account.findById(id);
    const username = currentaccount.username;
    // Find the account by ID
    const account = await Account.findById(accountID);

    // Find the project in the account's projects array by project ID
    const project = account.projects.id(projectID);
    const projects = account.projects;

    const newComment = { username: username, text: req.body.text };

    // Add comment to project
    project.comments.push(newComment);
    // Save the updated account (which includes the updated project)
    await account.save();
    req.flash('success', 'Successfully made a new comment!');
    res.redirect(`/project/${id}/${accountID}/${projectID}`);
}

module.exports.createCommentUserExist = async (req, res, next) => {
    const { accountID, projectID } = req.params;
    if(req.user){
        const id = req.user._id;
        const currentaccount = await Account.findById(id);
        const username = currentaccount.username;
        // Find the account by ID
        const account = await Account.findById(accountID);

        // Find the project in the account's projects array by project ID
        const project = account.projects.id(projectID);
        const projects = account.projects;
//console.log(project)
        const newComment = { username: username, text: req.body.text, rating: req.body.rating };

        // Add comment to project
        project.comments.push(newComment);
        // Save the updated account (which includes the updated project)
        await account.save();
        req.flash('success', 'Successfully made a new comment!');
        res.redirect(`/project/${id}/${accountID}/${projectID}`);
    }
    else{
        res.redirect('/login');
    }
}

module.exports.deleteComment = async (req, res, next) => {
    const { accountID, projectID, commentID } = req.params;

    // Find the account by ID
    const account = await Account.findById(accountID);

    // Find the project in the account's projects array by project ID
    const project = account.projects.id(projectID);

    // Use Mongoose array pull method to remove the project from the array
    project.comments.pull({ _id: commentID });

    // Save the account (which includes removing the comments from the project)
    await account.save();
    req.flash('success', 'Successfully deleted comment')
    res.redirect(`/project/${req.user._id}/${accountID}/${projectID}`)
}