const mongoose = require('mongoose');

const CouponSchema = mongoose.Schema({
    
    CouponCode:String,
    StartDate:Date,
    EndDate:Date,
    DiscountPercentage:Number,
    DiscountAmount:Number,
    TermsAndCondition:String,
    OfferPosterOrImage:String,
    Status:String,

}, {
    timestamps: true
});

 module.exports=mongoose.model('Coupon',CouponSchema);