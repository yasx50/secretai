import mongoose from "mongoose";
import { category } from "./categories.js";

const chatSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: Object.values(category),
    required: true
  },

  userid: {
    type: String,
    required: true
  },

  messages: [
    {
      role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

export const Chat = mongoose.model("Chat", chatSchema);