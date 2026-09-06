import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  title: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, default: "", trim: true, maxlength: 240 },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: (v) => v.length <= 5,
      message: "A maximum of 5 tags is allowed",
    },
  },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

imageSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.model("Image", imageSchema);
