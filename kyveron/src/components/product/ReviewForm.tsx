"use client";

import { useActionState, useState } from "react";
import { submitReview } from "@/app/actions/reviews";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ReviewForm({ productId }: { productId: string }) {
  const [state, action] = useActionState(submitReview, undefined);
  const [rating, setRating] = useState(0);
  if (state?.ok) return <p className="notice notice-success" role="status">{state.message}</p>;
  return (
    <form action={action} className="grid max-w-xl gap-4" noValidate>
      <input type="hidden" name="productId" value={productId} />
      <fieldset>
        <legend className="text-sm font-medium">Your rating</legend>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating out of 5">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name="rating" value={n} className="peer sr-only" checked={rating === n} onChange={() => setRating(n)} />
              <span className={`flex h-11 w-11 items-center justify-center border text-lg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-cobalt ${n <= rating ? "border-obsidian bg-obsidian text-ivory" : "border-line-strong"}`} aria-hidden="true">★</span>
              <span className="sr-only">{n} {n === 1 ? "star" : "stars"}</span>
            </label>
          ))}
        </div>
        {state?.errors?.rating && <p className="field-error mt-1">{state.errors.rating}</p>}
      </fieldset>
      <div className="field">
        <label htmlFor="rv-fit">How does it fit?</label>
        <select id="rv-fit" name="fit" className="select" defaultValue="">
          <option value="">Prefer not to say</option>
          <option value="runs_small">Runs small</option>
          <option value="true_to_size">True to size</option>
          <option value="runs_large">Runs large</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="rv-title">Title (optional)</label>
        <input id="rv-title" name="title" className="input" maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="rv-body">Your review</label>
        <textarea id="rv-body" name="body" className="textarea" maxLength={2000} aria-invalid={!!state?.errors?.body} />
        {state?.errors?.body && <p className="field-error">{state.errors.body}</p>}
      </div>
      {state?.message && <p className="notice notice-error" role="alert">{state.message}</p>}
      <div><SubmitButton>Submit review</SubmitButton></div>
    </form>
  );
}
