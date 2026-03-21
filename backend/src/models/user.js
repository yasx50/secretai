import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  clerkid: {
    type: String,
    required: true,
    unique: true
  },

  secretPin: {
    type: String
  },

  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat"
    }
  ]
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("secretPin") || !this.secretPin) return next();
  this.secretPin = await bcrypt.hash(this.secretPin, 10);
  next();
});

userSchema.methods.isSecretPinCorrect = async function (pin) {
  if (!this.secretPin) return false;
  return await bcrypt.compare(pin, this.secretPin);
};

export const User = mongoose.model("User", userSchema);