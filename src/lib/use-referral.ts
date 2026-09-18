"use client";

import { useEffect, useState } from "react";

import { NO_REFERRAL, currentCode, isCodeShaped, normaliseCode, resolveCode, type Referral } from "@/lib/referral";

/** The invitation this visit is carrying, once we know whose it is.
 *
 *  Nothing until the answer arrives, so the server-rendered markup and the
 *  first client paint agree and nothing claims a friend before the lookup
 *  says there is one. Anything rendered from this must read as complete
 *  without it, which is why the announcement strip keeps its usual line until
 *  there is a name to put in it.
 */
export function useReferral(): Referral {
  const [referral, setReferral] = useState<Referral>(NO_REFERRAL);

  useEffect(() => {
    const code = currentCode();
    if (!code) return;
    let live = true;
    resolveCode(code).then((answer) => {
      if (live) setReferral(answer);
    });
    return () => {
      live = false;
    };
  }, []);

  return referral;
}

/** The same question about a code somebody is typing, asked once they have
 *  stopped typing something that could be one.
 *
 *  "Checking" is derived from having a code with no answer for it yet, rather
 *  than set: the render already knows both halves. */
export function useTypedReferral(typed: string, delay = 400): Referral {
  const [answer, setAnswer] = useState<Referral | null>(null);
  const code = normaliseCode(typed);
  const shaped = isCodeShaped(code);

  useEffect(() => {
    if (!shaped) return;
    let live = true;
    const timer = setTimeout(() => {
      resolveCode(code).then((result) => {
        if (live) setAnswer(result);
      });
    }, delay);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [code, shaped, delay]);

  if (!code) return NO_REFERRAL;
  // Still mid-word. Saying "we do not recognise that" after four characters of
  // an eight-character code would be wrong, and unkind.
  if (!shaped) return { code, status: "none", referrerName: "" };
  if (answer && answer.code === code) return answer;
  return { code, status: "checking", referrerName: "" };
}
