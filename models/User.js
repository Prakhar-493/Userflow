import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const { Schema, model } = mongoose;

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Please provide a name."],
    trim: true,
    minlength: [3, "Name must be at least 3 characters long."],
  },
  email: {
    type: String,
    required: [true, "Please provide an email address."],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email address.",
    ],
  },
  password: {
    type: String,
    required: [true, "Please provide a password."],
    minlength: [8, "Password must be at least 8 characters long."],
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number."],
    unique: true,
    match: [/^\d{10}$/, "Please provide a valid phone number."],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
