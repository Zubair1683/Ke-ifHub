const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const projects = require('../controllers/projects');
const { isLoggedIn, isProjectAuthor, validateProject } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
.get(catchAsync(projects.renderProjects))
.post(isLoggedIn, upload.array('image'), validateProject, catchAsync(projects.createProject));

router.post('/searchProject', catchAsync(projects.searchProject))
router.get('/new', isLoggedIn, catchAsync(projects.renderAddProject))

router.route('/:id')
.get(catchAsync(projects.displayProject))
.put(isLoggedIn, isProjectAuthor , upload.array('image'), validateProject, catchAsync(projects.updatePoject))
.delete(isLoggedIn, isProjectAuthor, catchAsync(projects.deleteProject));

router.get('/:id/edit', isLoggedIn, isProjectAuthor, catchAsync(projects.renderEditProject))

module.exports = router;