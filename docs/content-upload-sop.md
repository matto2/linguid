# LiNGUiD Content Upload And YouTube Import SOP

Last updated: 2026-05-13

## Goal

Get the first 12 hours of French content into LiNGUiD without rights ambiguity.

Starting mix:

- 8 hours official YouTube embeds.
- 2 hours creator-approved embeds with LiNGUiD captions/transcripts.
- 2 hours fully licensed hosted clips.

## Rights Statuses

Use these exact statuses in trackers and Firestore:

- `official_embed_only`
- `embed_plus_caption_permission`
- `hosted_pilot_license`
- `owned_by_linguid`
- `permission_requested`
- `declined`
- `do_not_use`

Rules:

- Official embeds can be imported only if the source is public, official, and embeddable.
- Captions/transcripts can be used only if creator-supplied, independently licensed, or explicitly approved.
- Hosted files require written permission or a signed pilot license.
- TikTok, Instagram, TV clips, and YouTube videos must not be downloaded or rehosted without explicit permission.
- No creator content is used for AI model training.

## Current Hosted Upload Flow

The `linguid-api` repo already has a hosted-video processing flow:

- Staged upload creates an `upload_receipts/{upload_id}` ticket.
- `video_processor/main.py` is triggered by that receipt.
- The worker downloads the staged video.
- It extracts audio.
- It transcribes with `transcript_service.transcribe_video(...)`.
- It runs transcript difficulty analysis.
- It uploads final video and optional thumbnail to Firebase Storage.
- It writes the final video document to `videos/{language}/items/{upload_id}`.

Important existing output fields:

- `video_url`
- `transcript`
- `captions`
- `difficulty_level`
- `cefr_level`
- `wpm`
- `duration`
- `keywords`
- `language`
- `uploaderId`
- `upload_id`
- `final_video_path`
- `final_thumbnail_path`

## Hosted Licensed Clip SOP

Use this for content with `hosted_pilot_license`.

1. Save proof of permission.
   - Email thread PDF or screenshot.
   - Signed pilot license if hosting files.
   - Approved filenames or URLs.

2. Create intake row.
   - Source name.
   - Creator URL.
   - Rights status.
   - Attribution text.
   - Takedown contact.
   - Expiration date.

3. Upload using the existing app/admin upload flow.

4. Confirm processing output.
   - `status = complete` in `upload_receipts`.
   - Final Firestore doc exists in `videos/fr/items/{upload_id}`.
   - Captions are present.
   - Difficulty level is present.
   - Thumbnail is present or intentionally blank.

5. Add rights metadata to the final Firestore video doc.

Suggested additional fields:

```json
{
  "source_type": "hosted_file",
  "playback_provider": "firebase_storage",
  "rights_status": "hosted_pilot_license",
  "rights_contact": "creator@example.com",
  "rights_proof_ref": "content_permissions/{permission_id}",
  "license_expires_at": "2027-05-13",
  "creator_display_name": "Creator Name",
  "creator_url": "https://example.com",
  "attribution_required": true,
  "no_ai_training": true,
  "takedown_sla_hours": 48
}
```

## YouTube Embed Import Feature

Use this for `official_embed_only` and `embed_plus_caption_permission`.

Add an admin-only import path in `linguid-api` instead of sending YouTube through the hosted upload pipeline.

Recommended endpoint:

```http
POST /api/import_youtube_video
```

Request body:

```json
{
  "youtube_video_id": "abc123",
  "language": "fr",
  "creator_display_name": "Creator Name",
  "creator_url": "https://creator.example",
  "source_url": "https://www.youtube.com/watch?v=abc123",
  "rights_status": "official_embed_only",
  "caption_mode": "youtube_native",
  "manual_difficulty_level": 2,
  "category": "beginner_listening",
  "topics": ["daily life", "greetings"]
}
```

Validation:

- Call YouTube Data API `videos.list`.
- Require the video to exist.
- Require `status.embeddable = true`.
- Require public or unlisted visibility that can actually be embedded.
- Record title, channel, duration, thumbnail, and canonical URL.
- Reject if rights status is not one of the approved statuses.

Firestore write path:

```text
videos/fr/items/{document_id}
```

Suggested document:

```json
{
  "source_type": "youtube_embed",
  "playback_provider": "youtube_iframe",
  "youtube_video_id": "abc123",
  "source_url": "https://www.youtube.com/watch?v=abc123",
  "creator_display_name": "Creator Name",
  "creator_url": "https://creator.example",
  "rights_status": "official_embed_only",
  "caption_mode": "youtube_native",
  "difficulty_source": "manual",
  "difficulty_level": 2,
  "cefr_level": "A2",
  "language": "fr",
  "thumbnail_url": "https://i.ytimg.com/...",
  "duration": 184,
  "topics": ["daily life", "greetings"],
  "likes": 0,
  "comments": 0,
  "plays": 0,
  "shares": 0,
  "saves": 0,
  "embed_status": "active",
  "no_ai_training": true,
  "imported_at": "2026-05-13T00:00:00Z"
}
```

Caption modes:

- `youtube_native`: show YouTube player captions only. Disable LiNGUiD tap-word captions.
- `creator_supplied_vtt`: convert VTT/SRT to LiNGUiD `captions` segments and enable tap-word captions.
- `linguid_created_with_permission`: create transcript/captions only if creator granted permission.
- `none`: no captions; require manual difficulty and label as lower-quality.

Difficulty handling:

- If transcript/captions are available and permission is clean, run the existing transcript difficulty analyzer.
- If no transcript permission exists, require manual difficulty level and set `difficulty_source = "manual"`.
- Never pull or scrape YouTube captions through unofficial methods for production content.

## iOS Playback Handling

The app should choose playback by `playback_provider`:

- `firebase_storage`: existing native video player.
- `youtube_iframe`: YouTube IFrame player in a WebView or a YouTube-player wrapper.

For YouTube embeds:

- Use official player controls.
- Do not overlay UI that hides required YouTube branding.
- Keep attribution visible in the app content details.
- Track watch progress internally only when technically allowed and reliable.

## QA Checklist

Before publishing any item:

- Content source is official.
- Rights status is filled.
- Permission proof exists where needed.
- Clear native French speech.
- Beginner level is accurate.
- Audio is clean.
- No unsafe kid-directed advertising or off-platform weirdness.
- Caption timing spot-checked if LiNGUiD captions are enabled.
- Attribution link works.
- Takedown contact is recorded.
- Firestore document has `source_type`, `playback_provider`, `rights_status`, and `no_ai_training`.

## First 14-Day Execution Plan

Day 1:

- Fill exact video URLs for the top 10 creator-teacher targets.
- Send 10 personalized emails.
- Send 5 DMs where email is weak.

Day 2:

- Import 60-90 minutes of official embeddable YouTube content that does not require captions beyond native YouTube player captions.
- Start rights proof folder.

Day 3:

- Send 10 more creator-teacher messages.
- Send 5 studio/institutional messages with pilot license link.

Day 4:

- QA first import batch.
- Remove any videos with weak fit or embed instability.

Day 6:

- First follow-up to all day-1 targets.
- Add 10 more targets if response rate is under 15 percent.

Day 10:

- Convert any positive creator responses into written permission confirmations.
- Start caption creation only after permission is written.

Day 14:

- Fallback ask to non-responders: official embed only.
- Summarize conversion by segment and double down on the best segment.

