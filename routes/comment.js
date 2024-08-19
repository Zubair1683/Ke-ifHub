const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Account = require('../models/accounts');
const { isLoggedIn, isAccountAuthor} = require('../middleware');
const comment = require('../controllers/comment');

router.post('/project/:accountID/:projectID/:id/comment', isLoggedIn, isAccountAuthor, catchAsync(comment.createCommentUserExist));

router.post('/project/comment/:accountID/:projectID', isLoggedIn, catchAsync(comment.createCommentUserNotExist));

router.delete('/project/:accountID/:projectID/:commentID', isLoggedIn, catchAsync(comment.deleteComment));

module.exports = router;
