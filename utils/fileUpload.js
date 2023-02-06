const multer = require('multer');
const sharp = require('sharp');
const AppError = require('./appError');
const catchAsync= require('../utils/catchAsync')

const imageStorage= multer.memoryStorage();

const imageFilter= (req, file, next, cb)=>{
    if (file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an Image! Please upload only images', 400))
    }
}
// const videoStorage
// const multipleIMageStorage
// const multipleVideStorage

const upload= multer({
    storage:imageStorage,
    filter:imageFilter
});


exports.uploadSingleImage= upload.single('photo');

exports.resizeImage = (fileLocation, size,name,fields)=>{
    return (req, res, next) => {
        // Check if req.file exists
        if (!req.file) {
          return next();
        }
        // Determine resolution based on size argument
        let resolution;
        switch (size) {
          case "small":
            resolution = [250, 250];
            break;
          case "medium":
            resolution = [500, 500];
            break;
          default:
            resolution = [1500, 1500];
            break;
        };

        // fields.forEach(field => {
            
        // });
        // Determine filename based on req.params.id or req.user
        let filename;
        if (req.params.id) {
          filename=req.file.filename = `${name}-${req.params.id}-${Date.now()}.jpeg`;
        } else if (req.user) {
          filename=req.file.filename = `${req.user.role}-${req.user.id}-${Date.now()}.jpeg`;
        }
        // Resize image and save to file
        sharp(req.file.buffer)
          .resize(resolution)
          .toFormat("jpeg")
          .toFile(`${fileLocation}/${filename}`, (err) => {
            if (err) {
              return next(new AppError(" not saved", 400));
            }
            return next();
          });
      };
};

async function resizeImg(fileLocation,imageBuffer, fileName, folder) {
    await sharp(imageBuffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/images/${folder}/${fileName}`);
  
    return fileName;
  }

exports.uploadMultipleFields= (fields)=>{
    // fields must be a list
    if (!Array.isArray(fields)){
        throw new Error('The argument "fields" must be an array')
    }
    const listField= [];

    fields.forEach(field => {
        listField.push({name:field, maxCount:10})
    });
    console.log(listField)
    return upload.fields(listField)
};

exports.resizeMultipleImage= (fields, name, size,fileLocation)=>{
    return (req, res, next)=>{
        if (!req.file) {
            return next();
          }
          // Determine resolution based on size argument
          let resolution;
          switch (size) {
            case "small":
              resolution = [250, 250];
              break;
            case "medium":
              resolution = [500, 500];
              break;
            default:
              resolution = [1500, 1500];
              break;
          };

        fields.forEach(async field => {

            let filename
            // if(!req.files.newField) next();
            if (req.params.id) {
                filename=req.file.filename = `${name}-${req.params.id}-${Date.now()}.jpeg`;
              } else if (req.user) {
                filename=req.file.filename = `${req.user.role}-${req.user.id}-${Date.now()}.jpeg`;
              }else{
                return next(new AppError('requires product id, or u need to be logged in', 400));
              };
            var changedField = JSON.parse(field);
            await sharp(req.files[changedField][0].buffer)
                        .resize(resolution)
                        .toFormat('jpeg')
                        .jpeg({quality:90})
                        .toFile(`${fileLocation}/${filename}`)

        });
    }

}

  