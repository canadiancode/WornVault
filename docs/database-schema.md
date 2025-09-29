# WornVault Database Schema

## Overview

WornVault is a content creator marketplace built on Supabase with 6 main tables. The database uses PostgreSQL with Row Level Security (RLS) for data protection.

## Tables

### 1. `creators` ✅

**Purpose**: Store creator profile information and statistics

| Column                | Type        | Description                  | Constraints                         |
| --------------------- | ----------- | ---------------------------- | ----------------------------------- |
| `id`                  | UUID        | Primary key                  | NOT NULL, DEFAULT gen_random_uuid() |
| `shopify_customer_id` | TEXT        | Shopify customer integration | NULLABLE                            |
| `username`            | TEXT        | Unique username              | NOT NULL, UNIQUE                    |
| `display_name`        | TEXT        | Display name                 | NOT NULL                            |
| `bio`                 | TEXT        | Creator bio/description      | NULLABLE                            |
| `avatar_url`          | TEXT        | Profile image URL            | NULLABLE                            |
| `verification_status` | TEXT        | Verification status          | DEFAULT 'pending'                   |
| `follower_count`      | INTEGER     | Number of followers          | DEFAULT 0                           |
| `following_count`     | INTEGER     | Number following             | DEFAULT 0                           |
| `post_count`          | INTEGER     | Number of posts              | DEFAULT 0                           |
| `total_sales`         | DECIMAL     | Total sales amount           | DEFAULT 0                           |
| `social_links`        | JSONB       | Social media links           | NULLABLE                            |
| `created_at`          | TIMESTAMPTZ | Creation timestamp           | NOT NULL, DEFAULT now()             |
| `updated_at`          | TIMESTAMPTZ | Last update timestamp        | NOT NULL, DEFAULT now()             |

**Relationships**:

- One-to-many with `posts` (creator_id → creators.id)

### 2. `posts` ✅

**Purpose**: Store creator posts/items for sale

| Column               | Type        | Description                 | Constraints                         |
| -------------------- | ----------- | --------------------------- | ----------------------------------- |
| `id`                 | UUID        | Primary key                 | NOT NULL, DEFAULT gen_random_uuid() |
| `creator_id`         | UUID        | Foreign key to creators     | NOT NULL, REFERENCES creators(id)   |
| `shopify_product_id` | TEXT        | Shopify product integration | NULLABLE                            |
| `content`            | TEXT        | Post content/description    | NOT NULL                            |
| `price`              | DECIMAL     | Item price                  | NOT NULL                            |
| `currency`           | TEXT        | Currency code               | NOT NULL, DEFAULT 'USD'             |
| `status`             | TEXT        | Post status                 | NOT NULL, DEFAULT 'draft'           |
| `featured_image_url` | TEXT        | Main image URL              | NULLABLE                            |
| `image_urls`         | JSONB       | Array of image URLs         | NULLABLE                            |
| `tags`               | JSONB       | Array of tags               | NULLABLE                            |
| `view_count`         | INTEGER     | View count                  | DEFAULT 0                           |
| `like_count`         | INTEGER     | Like count                  | DEFAULT 0                           |
| `comment_count`      | INTEGER     | Comment count               | DEFAULT 0                           |
| `share_count`        | INTEGER     | Share count                 | DEFAULT 0                           |
| `created_at`         | TIMESTAMPTZ | Creation timestamp          | NOT NULL, DEFAULT now()             |
| `updated_at`         | TIMESTAMPTZ | Last update timestamp       | NOT NULL, DEFAULT now()             |

**Relationships**:

- Many-to-one with `creators` (creator_id → creators.id)
- One-to-many with social interactions

### 3. `social_interactions` ❌

**Purpose**: Store likes, follows, comments, and shares
**Status**: Table not found in current schema

**Expected Structure**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User performing action |
| `target_type` | TEXT | Type of target (post, creator) |
| `target_id` | UUID | ID of target |
| `interaction_type` | TEXT | Type of interaction (like, follow, comment, share) |
| `content` | TEXT | Comment content (for comments) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### 4. `activity_feed` ❌

**Purpose**: Store user activity feed entries
**Status**: Table not found in current schema

**Expected Structure**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User receiving the activity |
| `actor_id` | UUID | User performing the action |
| `activity_type` | TEXT | Type of activity |
| `target_type` | TEXT | Type of target |
| `target_id` | UUID | ID of target |
| `metadata` | JSONB | Additional activity data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### 5. `trending_topics` ❌

**Purpose**: Store trending topics and hashtags
**Status**: Table not found in current schema

**Expected Structure**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `topic` | TEXT | Topic/hashtag name |
| `post_count` | INTEGER | Number of posts with this topic |
| `trend_score` | DECIMAL | Calculated trend score |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## Current Data Status

- ✅ `creators`: 1 record (test data)
- ✅ `posts`: 1 record (test data)
- ❌ `social_interactions`: Table missing
- ❌ `activity_feed`: Table missing
- ❌ `trending_topics`: Table missing

## Relationships Working

- ✅ Posts → Creators (foreign key relationship working)

## Next Steps

1. Create missing tables (`social_interactions`, `activity_feed`, `trending_topics`)
2. Set up proper RLS policies
3. Add database indexes for performance
4. Create database functions for complex queries

## API Integration

The database is fully integrated with the API layer:

- ✅ Creator CRUD operations
- ✅ Post CRUD operations
- ✅ Redis caching system
- ✅ File upload system
- ✅ Real-time subscriptions ready
