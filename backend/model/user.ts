import mongoose from "mongoose";

export interface interUser {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
  image: string;
  name: string;
}

const userSchema = new mongoose.Schema<interUser>({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
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
});

const userModel = mongoose.model<interUser>("Users", userSchema);

export default userModel;