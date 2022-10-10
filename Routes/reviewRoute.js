const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getReviews)
  .post(
    reviewController.setTutorUserIds,
    reviewController.Checked,
    reviewController.createReview
  );

router
  .route('/:tutorId')
  .get(reviewController.getReviews)
  .patch(
    reviewController.updateReview
  )
  .delete(
    reviewController.deleteReview
  );

module.exports = router;
