const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Account = require('../models/accounts');
const projects = require('../controllers/projects');
const { projectSchema } = require('../schemas.js');
const { isLoggedIn, isAccountAuthor, validateProject, isMatched } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.post('/addProject/:id', isLoggedIn, upload.array('image'), validateProject, catchAsync(projects.addProject))

router.post('/searchProject', catchAsync(projects.searchProject))

router.get('/project/:accountID/:projectID', catchAsync(projects.displayProjectUserNotExists));

router.get('/project/:id/:accountID/:projectID', isLoggedIn, isAccountAuthor, catchAsync(projects.displayProjectUserExists));

router.get('/proje/:accountID/:projectID/edit', isLoggedIn, isAccountAuthor, catchAsync(projects.editProject))

router.put('/project/:accountID/:projectID', isLoggedIn, isAccountAuthor , upload.array('image'), validateProject, catchAsync(projects.updatePoject));


router.delete('/project/:accountID/:projectID', isLoggedIn, isAccountAuthor, catchAsync(projects.deleteProject));


module.exports = router;