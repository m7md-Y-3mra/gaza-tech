# Quickstart: Community Post Schema

**Date**: 2026-04-01
**Feature**: 002-community-post-schema

## Overview

This feature adds Zod validation schemas and TypeScript types for community post create/update forms. It follows the existing listings module pattern: schema factories with translation injection, database-derived types, and react-hook-form integration.

## Files to Create

```
modules/community/
├── types/
│   └── index.ts              # DB types + form types + enums
└── schema.ts                 # Schema factories + static exports

constants/
└── community-file.ts         # Upload size/type constants
```

## Files to Modify

```
messages/en.json              # Add CommunityForm.validation keys
messages/ar.json              # Add CommunityForm.validation keys (Arabic)
```

## Usage Example

```typescript
// In a form hook (e.g., modules/community/components/community-form/hooks/useCommunityForm.ts)
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCreateCommunityPostClientSchema, createUpdateCommunityPostClientSchema } from '@/modules/community/schema';
import type { CreateCommunityPostFormData } from '@/modules/community/types';

const tValidation = useTranslations('CommunityForm.validation');

const schema = mode === 'create'
  ? createCreateCommunityPostClientSchema(tValidation)
  : createUpdateCommunityPostClientSchema(tValidation);

const form = useForm<CreateCommunityPostFormData>({
  resolver: zodResolver(schema),
  defaultValues: { title: '', content: '', post_category: 'questions', attachments: [] },
  mode: 'onBlur',
});
```

## Key Design Decisions

1. **Separate constants file** — community attachments allow PDFs and 5MB (vs listings: images-only, 2MB)
2. **Schema-level default** — `post_category` defaults to `'questions'` via Zod `.default()`
3. **URL validation in update** — existing attachments validated as `z.string().url()`
4. **No publication status in form** — server manages `published_at` and `content_status`
