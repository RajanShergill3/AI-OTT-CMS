import mongoose, { type HydratedDocument, type Model, Schema, type Types } from 'mongoose';

/** Movie lifecycle status values stored on the document. */
export const MOVIE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export type MovieStatus = (typeof MOVIE_STATUSES)[number];

/** Recognized age/content rating labels for OTT catalog metadata. */
export const AGE_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'U', 'UA', 'A'] as const;

export type AgeRating = (typeof AGE_RATINGS)[number];

const TITLE_MAX_LENGTH = 300;
const SLUG_MAX_LENGTH = 200;
const SHORT_DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_MAX_LENGTH = 5000;
const SEO_TITLE_MAX_LENGTH = 70;
const SEO_DESCRIPTION_MAX_LENGTH = 160;
const TAG_MAX_LENGTH = 50;
const TAG_MAX_COUNT = 20;
const GENRE_MAX_LENGTH = 50;
const GENRE_MAX_COUNT = 10;
const CAST_MAX_COUNT = 100;
const CAST_NAME_MAX_LENGTH = 200;
const CAST_CHARACTER_MAX_LENGTH = 200;
const PERSON_NAME_MAX_LENGTH = 200;
const SUBTITLE_MAX_COUNT = 30;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_REGEX = /^https?:\/\/.+/i;
const ISO_639_1_REGEX = /^[a-z]{2}$/;
const ISO_3166_1_ALPHA_2_REGEX = /^[A-Z]{2}$/;

export interface IMovieCastMember {
  name: string;
  character: string;
  order: number;
  imageUrl: string | null;
}

export interface IMovieSubtitle {
  language: string;
  url: string;
}

export interface IMovie {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: Types.ObjectId;
  genres: string[];
  languages: string[];
  releaseDate: Date | null;
  duration: number;
  ageRating: AgeRating | null;
  country: string | null;
  cast: IMovieCastMember[];
  director: string | null;
  producer: string | null;
  thumbnailUrl: string | null;
  posterUrl: string | null;
  bannerUrl: string | null;
  trailerUrl: string | null;
  videoUrl: string | null;
  subtitleUrls: IMovieSubtitle[];
  status: MovieStatus;
  isFeatured: boolean;
  isTrending: boolean;
  isPremium: boolean;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId | null;
  publishedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMovieMethods {
  isSoftDeleted(): boolean;
  isPublished(): boolean;
}

type MovieModel = Model<IMovie, Record<string, never>, IMovieMethods>;

export type MovieDocument = HydratedDocument<IMovie, IMovieMethods>;

const castMemberSchema = new Schema<IMovieCastMember>(
  {
    name: {
      type: String,
      required: [true, 'Cast member name is required'],
      trim: true,
      minlength: [1, 'Cast member name cannot be empty'],
      maxlength: [
        CAST_NAME_MAX_LENGTH,
        `Cast member name cannot exceed ${CAST_NAME_MAX_LENGTH} characters`,
      ],
    },
    character: {
      type: String,
      required: [true, 'Character name is required'],
      trim: true,
      minlength: [1, 'Character name cannot be empty'],
      maxlength: [
        CAST_CHARACTER_MAX_LENGTH,
        `Character name cannot exceed ${CAST_CHARACTER_MAX_LENGTH} characters`,
      ],
    },
    order: {
      type: Number,
      required: [true, 'Cast billing order is required'],
      min: [0, 'Cast billing order cannot be negative'],
    },
    imageUrl: {
      type: String,
      default: null,
      validate: {
        validator: (value: string | null) => value === null || URL_REGEX.test(value),
        message: 'Cast image URL must be a valid HTTP or HTTPS URL',
      },
    },
  },
  { _id: false },
);

const subtitleSchema = new Schema<IMovieSubtitle>(
  {
    language: {
      type: String,
      required: [true, 'Subtitle language is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => ISO_639_1_REGEX.test(value),
        message: 'Subtitle language must be a valid ISO 639-1 code',
      },
    },
    url: {
      type: String,
      required: [true, 'Subtitle URL is required'],
      trim: true,
      validate: {
        validator: (value: string) => URL_REGEX.test(value),
        message: 'Subtitle URL must be a valid HTTP or HTTPS URL',
      },
    },
  },
  { _id: false },
);

const movieSchema = new Schema<IMovie, MovieModel, IMovieMethods>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [TITLE_MAX_LENGTH, `Title cannot exceed ${TITLE_MAX_LENGTH} characters`],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      lowercase: true,
      minlength: [1, 'Slug cannot be empty'],
      maxlength: [SLUG_MAX_LENGTH, `Slug cannot exceed ${SLUG_MAX_LENGTH} characters`],
      validate: {
        validator: (value: string) => SLUG_REGEX.test(value),
        message: 'Slug must contain only lowercase letters, numbers, and hyphens',
      },
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [
        DESCRIPTION_MAX_LENGTH,
        `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`,
      ],
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: [
        SHORT_DESCRIPTION_MAX_LENGTH,
        `Short description cannot exceed ${SHORT_DESCRIPTION_MAX_LENGTH} characters`,
      ],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    genres: {
      type: [String],
      default: [],
      validate: {
        validator: (values: string[]) => values.length <= GENRE_MAX_COUNT,
        message: `A movie cannot have more than ${GENRE_MAX_COUNT} genres`,
      },
    },
    languages: {
      type: [String],
      default: ['en'],
      validate: {
        validator: (values: string[]) =>
          values.length > 0 && values.every((value) => ISO_639_1_REGEX.test(value)),
        message: 'Languages must be valid ISO 639-1 codes',
      },
    },
    releaseDate: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be greater than zero'],
      validate: {
        validator: Number.isInteger,
        message: 'Duration must be a whole number of seconds',
      },
    },
    ageRating: {
      type: String,
      enum: {
        values: AGE_RATINGS,
        message: 'Age rating must be a recognized content rating',
      },
      default: null,
    },
    country: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
      validate: {
        validator: (value: string | null) => value === null || ISO_3166_1_ALPHA_2_REGEX.test(value),
        message: 'Country must be a valid ISO 3166-1 alpha-2 code',
      },
    },
    cast: {
      type: [castMemberSchema],
      default: [],
      validate: {
        validator: (values: IMovieCastMember[]) => values.length <= CAST_MAX_COUNT,
        message: `Cast cannot exceed ${CAST_MAX_COUNT} members`,
      },
    },
    director: {
      type: String,
      default: null,
      trim: true,
      maxlength: [
        PERSON_NAME_MAX_LENGTH,
        `Director name cannot exceed ${PERSON_NAME_MAX_LENGTH} characters`,
      ],
    },
    producer: {
      type: String,
      default: null,
      trim: true,
      maxlength: [
        PERSON_NAME_MAX_LENGTH,
        `Producer name cannot exceed ${PERSON_NAME_MAX_LENGTH} characters`,
      ],
    },
    thumbnailUrl: {
      type: String,
      default: null,
      validate: {
        validator: (value: string | null) => value === null || URL_REGEX.test(value),
        message: 'Thumbnail URL must be a valid HTTP or HTTPS URL',
      },
    },
    posterUrl: {
      type: String,
      default: null,
      validate: {
        validator: (value: string | null) => value === null || URL_REGEX.test(value),
        message: 'Poster URL must be a valid HTTP or HTTPS URL',
      },
    },
    bannerUrl: {
      type: String,
      default: null,
      validate: {
        validator: (value: string | null) => value === null || URL_REGEX.test(value),
        message: 'Banner URL must be a valid HTTP or HTTPS URL',
      },
    },
    trailerUrl: {
      type: String,
      default: null,
      validate: {
        validator: (value: string | null) => value === null || URL_REGEX.test(value),
        message: 'Trailer URL must be a valid HTTP or HTTPS URL',
      },
    },
    videoUrl: {
      type: String,
      default: null,
      validate: {
        validator: (value: string | null) => value === null || URL_REGEX.test(value),
        message: 'Video URL must be a valid HTTP or HTTPS URL',
      },
    },
    subtitleUrls: {
      type: [subtitleSchema],
      default: [],
      validate: {
        validator: (values: IMovieSubtitle[]) => values.length <= SUBTITLE_MAX_COUNT,
        message: `Subtitle tracks cannot exceed ${SUBTITLE_MAX_COUNT}`,
      },
    },
    status: {
      type: String,
      enum: {
        values: MOVIE_STATUSES,
        message: 'Status must be one of: DRAFT, PUBLISHED, ARCHIVED',
      },
      default: 'DRAFT',
      required: [true, 'Status is required'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      required: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      required: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (values: string[]) => {
          if (values.length > TAG_MAX_COUNT) {
            return false;
          }

          return values.every(
            (tag) => tag.trim().length > 0 && tag.trim().length <= TAG_MAX_LENGTH,
          );
        },
        message: `Tags must be between 1 and ${TAG_MAX_COUNT} items, each up to ${TAG_MAX_LENGTH} characters`,
      },
    },
    seoTitle: {
      type: String,
      default: null,
      trim: true,
      maxlength: [
        SEO_TITLE_MAX_LENGTH,
        `SEO title cannot exceed ${SEO_TITLE_MAX_LENGTH} characters`,
      ],
    },
    seoDescription: {
      type: String,
      default: null,
      trim: true,
      maxlength: [
        SEO_DESCRIPTION_MAX_LENGTH,
        `SEO description cannot exceed ${SEO_DESCRIPTION_MAX_LENGTH} characters`,
      ],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'movies',
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const { __v: _version, ...safeMovie } = ret;
        return safeMovie;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        const { __v: _version, ...safeMovie } = ret;
        return safeMovie;
      },
    },
  },
);

movieSchema.index(
  { slug: 1 },
  {
    unique: true,
    name: 'idx_movies_slug',
    partialFilterExpression: { deletedAt: null },
  },
);
movieSchema.index({ status: 1 }, { name: 'idx_movies_status' });
movieSchema.index({ category: 1 }, { name: 'idx_movies_category' });
movieSchema.index({ genres: 1 }, { name: 'idx_movies_genres' });
movieSchema.index({ releaseDate: -1 }, { name: 'idx_movies_release_date' });
movieSchema.index({ isFeatured: 1 }, { name: 'idx_movies_is_featured' });
movieSchema.index({ isTrending: 1 }, { name: 'idx_movies_is_trending' });
movieSchema.index({ tags: 1 }, { name: 'idx_movies_tags' });
movieSchema.index({ status: 1, category: 1 }, { name: 'idx_movies_status_category' });
movieSchema.index({ status: 1, releaseDate: -1 }, { name: 'idx_movies_status_release_date' });
movieSchema.index({ deletedAt: 1 }, { name: 'idx_movies_deleted_at' });

movieSchema.path('genres').validate(function (values: string[]) {
  return values.every((genre) => genre.trim().length > 0 && genre.length <= GENRE_MAX_LENGTH);
}, `Each genre must be between 1 and ${GENRE_MAX_LENGTH} characters`);

movieSchema.pre('save', function () {
  if (this.isModified('slug')) {
    this.slug = this.slug.trim().toLowerCase();
  }

  if (this.isModified('languages')) {
    this.languages = this.languages.map((language) => language.trim().toLowerCase());
  }

  if (this.isModified('tags')) {
    this.tags = this.tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length > 0);
  }

  if (this.isModified('genres')) {
    this.genres = this.genres.map((genre) => genre.trim()).filter((genre) => genre.length > 0);
  }
});

movieSchema.virtual('isDeleted').get(function (this: MovieDocument) {
  return this.deletedAt !== null;
});

movieSchema.virtual('isLive').get(function (this: MovieDocument) {
  return this.status === 'PUBLISHED' && this.deletedAt === null;
});

movieSchema.methods.isSoftDeleted = function (this: MovieDocument): boolean {
  return this.deletedAt !== null;
};

movieSchema.methods.isPublished = function (this: MovieDocument): boolean {
  return this.status === 'PUBLISHED' && this.deletedAt === null;
};

export const Movie = mongoose.model<IMovie, MovieModel>('Movie', movieSchema);
