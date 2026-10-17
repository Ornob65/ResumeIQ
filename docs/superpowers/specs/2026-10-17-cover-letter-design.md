# Cover Letter Feature Design

## Goal

Add a first-class cover-letter workspace to ResumeIQ. Authenticated users can
create, edit, save, reopen, and print cover letters. AI generation uses the
candidate and job information entered in the cover-letter form, without
requiring a saved resume.

## Scope

### Included

- A dashboard Cover Letter section and list of saved cover letters.
- Creation of a cover letter with candidate details, target role, company,
  job description, tone, and length.
- AI-assisted generation through a protected Netlify function.
- Editable generated text.
- Create and update persistence in Supabase.
- Browser print/PDF export using a single clean letter layout.
- Explicit UI errors for validation, AI, loading, and persistence failures.

### Excluded from v1

- Resume-to-letter matching.
- Multiple visual templates.
- Version history or collaboration.
- Email sending or external job-board integrations.

## Architecture

Cover letters use their own `cover_letters` table rather than being stored in
the existing `resumes` table. The record contains a display `title`, editable
`content`, structured `cover_letter_data`, the authenticated `user_id`, an
optional `user_email`, and timestamps. Row-level security mirrors the current
resume policies and compares the stored user ID with the Clerk subject in the
Supabase JWT.

The client adds:

- `src/lib/cover-letters.js` for create, list, read, and update operations.
- A dashboard list page for saved letters and creation entry point.
- A cover-letter editor page with the input form, generation controls,
  editable letter, save/update action, and print action.
- A route for creating a new letter and a route for editing an existing one.
- An active Cover Letter navigation state in the dashboard sidebar.

The editor owns draft state locally. It sends the structured inputs to the
Netlify function and places the returned letter text into the editor. Saving
persists both the structured inputs and the current text, so a reopened letter
does not need to be regenerated.

The serverless function follows the existing `generate-summary` pattern:
POST-only handling, explicit API-key validation, a bounded prompt, Gemini
structured JSON output, response validation, and surfaced upstream errors.
The response shape is:

```json
{ "content": "..." }
```

## User flow

1. The user selects **Cover Letter** in the authenticated dashboard.
2. The workspace shows existing letters and a **Create a cover letter** action.
3. The user enters candidate and job details, chooses tone and length, and
   optionally generates a draft with AI.
4. The user edits the letter directly as needed.
5. The user saves the letter, receiving a stable URL for future editing.
6. The user can print or save a PDF using the browser print dialog.

Creating requires a non-empty title. AI generation requires candidate name,
target role, company, and job description; optional fields remain optional and
are clearly labeled.

## Error handling

- Empty required fields prevent the relevant action and show field-level or
  form-level guidance.
- AI responses with non-JSON, missing content, or an upstream failure show a
  specific error and preserve the current draft.
- Supabase create/update failures show the returned message and leave the
  user on the editor.
- Loading states disable duplicate actions and communicate progress.
- No broad catch silently converts failures into successful-looking output.

## Verification

- Run `npm run lint`.
- Run `npm run build`.
- Confirm the new routes render, the active sidebar state is correct, AI
  failure responses remain visible, and saved data is loaded into the editor.
- Keep existing resume and ATS routes unchanged.
