import mongoose from "mongoose";
import { category } from "./categories.js";

const chatSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: Object.values(category),
    required: true
  },

  userid: {
    type: String,
    required: true
  }
});

export const Chat = mongoose.model("Chat", chatSchema);