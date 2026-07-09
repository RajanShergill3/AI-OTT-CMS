Prompt 4.1 Review the existing movie.model.ts.

Do NOT rewrite the file.

Analyze it against production standards.

Check:

- Mongoose 8.x compatibility
- TypeScript typing
- Schema validation
- Required fields
- Indexes
- Compound indexes
- Soft delete support
- Status enum
- Slug support
- SEO fields
- Performance
- Future scalability
- OTT CMS best practices

Only suggest improvements.

Do not regenerate working code.

Explain every recommendation.


Prompt 4.2 – Review Movie Service
Review movie.service.ts.

Check:

- SOLID principles
- Error handling
- Pagination
- Filtering
- Searching
- Sorting
- MongoDB query optimization
- TypeScript
- Mongoose 8.x compatibility
- Security
- Scalability

Do not rewrite working code.

Only improve where necessary.

Prompt 4.3 – Review Movie Controller
Review movie.controller.ts.

Check:

- REST conventions
- HTTP status codes
- Validation
- Error handling
- Thin controller architecture
- Response consistency

Do not regenerate code unnecessarily.

Only suggest production improvements.

Prompt 4.4 – Review Movie Routes
Review movie.routes.ts.

Verify:

GET /movies

GET /movies/:id

POST /movies

PATCH /movies/:id

DELETE /movies/:id

Check:

- Middleware
- Validation
- Authentication
- Authorization
- Async handlers
- REST conventions

Do not rewrite working code.


Prompt 4.5 – Review Validators
Review movie.validator.ts.

Verify:

Create Movie

Update Movie

Search

Pagination

Sorting

Filtering

Use latest Zod.

Suggest improvements only.




Prompt – Movie Model
Build a production-ready Movie model for an AI Powered OTT Content Management System.

Technology:

- Node.js 22
- TypeScript
- Mongoose 8.x

Generate ONLY:

src/models/movie.model.ts

Do NOT generate controllers, services, routes or validators.

Requirements:

Fields:

title
slug
description
shortDescription
category
genres
languages
releaseDate
duration
ageRating
country
cast
director
producer
thumbnailUrl
posterUrl
bannerUrl
trailerUrl
videoUrl
subtitleUrls
status
isFeatured
isTrending
isPremium
tags
seoTitle
seoDescription
createdBy
updatedBy
publishedAt
deletedAt

Status Enum:

DRAFT

PUBLISHED

ARCHIVED

Validation:

- required fields
- trim strings
- indexes
- unique slug
- timestamps
- soft delete support
- virtuals enabled
- toJSON
- toObject

Indexes:

slug

status

category

genres

releaseDate

isFeatured

isTrending

tags

Compound index:

status + category

status + releaseDate

Add TypeScript interfaces.

Use latest Mongoose APIs only.

Follow enterprise coding standards.

Explain every architectural decision after the code.



Prompt – Movie Validator

Build a production-ready validator for Movie APIs.

Technology:
- TypeScript
- Express 5
- Zod

Generate ONLY:

src/validators/movie.validator.ts

Implement validation schemas for:

1. Create Movie
2. Update Movie
3. Get Movie By ID
4. Delete Movie
5. Movie List Query
6. Search Movies

Validation requirements:

Create Movie:
- title
- description
- shortDescription
- category
- genres
- languages
- durationInSeconds
- ageRating
- country
- cast
- director
- producer
- thumbnailUrl
- posterUrl
- bannerUrl
- trailerUrl
- videoUrl
- subtitleUrls
- status
- featured
- trending
- premium
- tags
- seoTitle
- seoDescription

Query validation:

page
limit
sortBy
sortOrder
status
category
featured
trending
premium
search

Use strict validation.

Reject unknown fields.

Use reusable schemas.

Follow enterprise coding standards.

Generate only:

src/validators/movie.validator.ts

Explain architectural decisions after the code.


Prompt - Review and implement src/services/movie.service.ts.

Implement production-ready business logic for:

- Create Movie
- Update Movie
- Get Movie By ID
- List Movies with pagination
- Search Movies
- Filter Movies
- Soft Delete Movie

Requirements:

- Use the existing Movie model.
- Auto-generate a unique slug from the title.
- Exclude soft-deleted movies by default.
- Support pagination, filtering, sorting, and text search.
- Throw custom application errors.
- Keep controllers thin.
- Follow SOLID principles.
- Use Mongoose 8 best practices.
- Do not modify models or validators.
