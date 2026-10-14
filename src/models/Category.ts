import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  image: string;
  order: number;
  // null = ana kategori, dolu = alt kategori (en fazla 2 seviye)
  parent: mongoose.Types.ObjectId | null;
  isActive: boolean;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Aynı isim farklı ana kategorilerin altında tekrar kullanılabilir
CategorySchema.index({ parent: 1, name: 1 }, { unique: true });

// Prevent re-compilation of model in Next.js development mode
export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
