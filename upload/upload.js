const clodinary=require('cloudinary').v2;  // we take .v2 beacuse in future we use upload method of uploader ok.

clodinary.config({
    cloud_name:   "dtxd3iliz",
    api_key:"793711681335422",
    api_secret:'KjqrqhlEloN1ctK0iym1irwEk2Q'
})

const uploadfile=async(filepath)=>{
try {
     const uploadStatus=await clodinary.uploader.upload(filepath)
     console.log("cloudinary reasult "+uploadStatus)
     return uploadStatus;
} catch (error) {
    return error
}
}

module.exports=uploadfile