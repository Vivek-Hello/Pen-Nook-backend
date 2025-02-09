import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import dotenv from 'dotenv'

dotenv.config();

const UserSchema = new mongoose.Schema(
   {
       username: {
           type: String,
           required: true,
           unique: true,
       },
       email: {
           type: String,
           required: true,
           unique: true,
          
       },
       password: {
           type: String,
           required: true,
       },
       image: {
           type: String,
           required:true,
          
       },
       refreshToken: {
           type: String,
       },
       blogs:[
        {type :mongoose.Schema.Types.ObjectId , ref:"Blog"}
       ]
       
       
   },
   { timestamps: true }
);

// Hash Password Before Saving
UserSchema.pre("save", async function (next) {
   try {
       if (!this.isModified("password")) return next();
       this.password = await bcrypt.hash(this.password, 10);
       next();
   } catch (err) {
       next(err);
   }
});

// Verify Password
UserSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password);
};

// Generate Refresh Token
UserSchema.methods.generateRefreshToken = function () {
   this.refreshToken = jwt.sign(
       { userID: this._id },
       process.env.REFRESHTOKEN,
       { expiresIn: "3d" }
   );
   return this.refreshToken;
};

// Generate Access Token
UserSchema.methods.generateAccessToken = function () {
   return jwt.sign(
       { userID: this.id},
       process.env.ACCESSTOKEN,
       { expiresIn: "60m" }
   );
};

// Exclude Sensitive Data in JSON Responses
// UserSchema.set("toJSON", {
//    transform: (doc, ret) => {
//        delete ret.password;
//        delete ret.refreshToken;
//        return ret;
//    },
// });

export const User = mongoose.model("User", UserSchema);
