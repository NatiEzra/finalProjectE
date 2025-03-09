import mongoose from "mongoose";

export interface interUser {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
  image: string;
  name: string;
  provider: "google" | "local";
}

const userSchema = new mongoose.Schema<interUser>({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: function (this: interUser) {
      return this.provider === "local"; // Password is required only for local users
    },
  },
  refreshToken: {
    type: [String],
    default: [],
  },
  image: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    enum: ["google", "local"],
    required: true,
  },
});

const userModel = mongoose.model<interUser>("Users", userSchema);

export default userModel;