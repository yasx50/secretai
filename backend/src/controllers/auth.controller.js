import { User } from "../models/user.js";
import { getAuth } from "@clerk/express";

export const syncClerkUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { name } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated with Clerk." });
    }

    let user = await User.findOne({ clerkid: userId });
    if (!user) {
      user = await User.create({
        clerkid: userId,
        name: name || "User"
      });
    } else if (name && user.name !== name) {
      user.name = name;
      await user.save();
    }

    return res.status(200).json({
      user: { id: user._id, name: user.name, clerkid: user.clerkid || null }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "User sync failed." });
  }
};
