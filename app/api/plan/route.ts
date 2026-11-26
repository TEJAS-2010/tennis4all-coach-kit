import { createPlan } from "@/lib/create-plan";
import { sessionInputSchema } from "@/lib/schema";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send the session details as JSON." }, { status: 400 });
  }

  const parsed = sessionInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Check the session details.",
        issues: parsed.error.issues.map((issue) => issue.message),
      },
      { status: 400 },
    );
  }

  const plan = await createPlan(parsed.data);
  return Response.json(plan);
}
