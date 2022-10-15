// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tutor = require('./tutorModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tutor: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tutor',
      required: [true, 'Review must belong to a Tutor']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tutor: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tutorId) {
  const stats = await this.aggregate([
    {
      $match: { tutor: tutorId }
    },
    {
      $group: {
        _id: '$tutor',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    const tut= await Tutor.findByIdAndUpdate(tutorId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    },
    {new: true});
  } else {
    await Tutor.findByIdAndUpdate(tutorId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // this points to current review

  this.constructor.calcAverageRatings(this.tutor);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tutor);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
