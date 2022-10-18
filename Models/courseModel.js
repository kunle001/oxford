const mongoose= require('mongoose')
const slugify = require('slugify')

const courseSchema= new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'what is the course name'],
        trim: true,
    },
    level:{
      type: String,
      enum: ['advanced', 'intermediate', 'beginer'],
      required: ['true', 'what level of learning is this course']
    },
    price: {
        type: Number, 
        required: [true, 'what is the price of this course']
    }, 
    discountPrice: Number,
    description: {
        type: String,
        required: [true, 'description!!']
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
      },
    ratingsQuantity: {
        type: Number,
        default: 0
      },
      tutors:[{
        type: mongoose.Schema.ObjectId,
        ref: 'Tutor'
      }],
      slug: String
},
{ toJSON: { virtuals: true }, toObject: { virtuals: true }});

courseSchema.index({name: 1, level:1}, {unique: true})
// Virtual populate
courseSchema.virtual('students', {
    ref: 'User',
    foreignField: 'courses',
    localField: '_id'
  });
//----
courseSchema.pre(/^findOneAnd/, function(next) {
    this.populate({
      path: 'tutors',
      select: 'name email photo'
    }).populate({
      path: 'students',
      select: '-__v -passwordChangedAt'
    });
  
    next();
  });

courseSchema.pre('save', function(next){
    this.slug = slugify(this.name, { lower: true });
    next()
});

const Course= mongoose.model('Course', courseSchema)

module.exports= Course