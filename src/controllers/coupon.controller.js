const { authSchema } = require('../validator/validate');

const Coupon = require('../databases/couponSchema');

exports.create = (req, res) => {
  authSchema.validateAsync(req.body, (authError, result) => {
    if (authError) {
      res.status(409).json({ message: authError.message || authError });
      return;
    }
    
      Coupon.findById(req.body.CouponCode, (couponError, data) => {
        if (couponError) {
          res.status(500).json({ message: couponError.message || couponError });
          return;
        }
        if (!data) {
          const currentDate = new Date().getTime();
          const dateOne = new Date(req.body.EndDate).getTime();
          const currentStatus = currentDate < dateOne ? "Active" : "Inactive";

          const coupon = new Coupon({
            CouponCode: req.body.CouponCode,
            StartDate: req.body.StartDate,
            EndDate: req.body.EndDate,
            DiscountPercentage: req.body.DiscountPercentage,
            DiscountAmount: req.body.DiscountAmount,
            TermsAndCondition: req.body.TermsAndCondition,
            OfferPosterOrImage: req.body.OfferPosterOrImage,
            Status: currentStatus
          });

          coupon.save((saveError, savedCoupon) => {
            if (saveError) {
              res.status(500).json({ message: saveError.message || saveError });
              return;
            }
            res.send(savedCoupon);
          });
        }
      });
    });
  
};

exports.findAll = (req, res) => {
  Coupon.find({})
    .sort({ _id: -1 })
    .exec((err, coupon) => {
      if (err) {
        res.status(500).json({ message: err.message || err });
        return;
      }
      res.send(coupon);
    });
};

exports.findByStatus = (req, res) => {
  Coupon.find({ Status: req.params.Status, StartDate: req.params.StartDate })
    .exec((err, coupon) => {
      if (err) {
        res.status(500).json({ message: err.message || err });
        return;
      }
      res.send(coupon);
    });
};

exports.CouponValidation = (req, res) => {
  Coupon.find({ CouponCode: req.params.CouponCode })
    .exec((err, coupon) => {
      if (err) {
        res.status(500).json({ message: err.message || err });
        return;
      }
      const now = new Date().getTime();
      coupon.forEach(getcoupon => {
        if (now > new Date(getcoupon.StartDate).getTime() && now < new Date(getcoupon.EndDate).getTime()) {
          res.send("Entered coupon is valid");
        } else {
          res.send("Entered coupon is out of date");
        }
      });
    });
};

exports.update = (req, res) => {
  if (!req.body.CouponCode) {
    return res.status(400).send({
      message: "Offer Name cannot be empty"
    });
  }

  Coupon.findByIdAndUpdate(req.params.couponId, {
    CouponCode: req.body.CouponCode,
    StartDate: req.body.StartDate,
    EndDate: req.body.EndDate,
    DiscountPercentage: req.body.DiscountPercentage,
    DiscountAmount: req.body.DiscountAmount,
    TermsAndCondition: req.body.TermsAndCondition,
    OfferPosterOrImage: req.body.OfferPosterOrImage,
    Status: req.body.Status
  }, { new: true }, (err, coupon) => {
    if (err) {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "Coupon not found with id " + req.params.couponId
        });
      }
      return res.status(500).send({
        message: "Error updating Coupon with id " + req.params.couponId
      });
    }
    if (!coupon) {
      return res.status(404).send({
        message: "Coupon not found with id " + req.params.couponId
      });
    }
    res.send(coupon);
  });
};

exports.delete = (req, res) => {
  Coupon.findByIdAndRemove(req.params.couponId, (err, coupon) => {
    if (err) {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: "Coupon not found with id " + req.params.couponId
        });
      }
      return res.status(500).send({
        message: "Could not delete coupon with id " + req.params.couponId
      });
    }
    if (!coupon) {
      return res.status(404).send({
        message: "Coupon not found with id " + req.params.couponId
      });
    }
    res.send({ message: "Coupon deleted successfully!" });
  });
};
