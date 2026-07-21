import { callAgentOnce } from "@/lib/agent-client.server";
import {
  createPendingPlace,
  createReadyPlace,
  deletePlace,
  listPlaces,
  markPlaceError,
  markPlaceReady,
} from "@/lib/events-store.server";
import { isPlaceEvaluationPayload } from "@/lib/place-types";
import { createFileRoute } from "@tanstack/react-router";

type CreateBody = {
  venueAddress?: string;
  eventDate?: string;
  evaluation?: unknown;
};

export const Route = createFileRoute("/api/events")({
  server: {
    handlers: {
      GET: async () => {
        const places = await listPlaces();
        return Response.json({ places });
      },

      POST: async ({ request }) => {
        let body: CreateBody;
        try {
          body = (await request.json()) as CreateBody;
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }

        // Case 1: an already-computed evaluation (e.g. one that just finished
        // streaming in the chat) — store it directly, no extra agent call.
        if (isPlaceEvaluationPayload(body.evaluation)) {
          const record = await createReadyPlace(body.evaluation);
          return Response.json({ place: record }, { status: 201 });
        }

        // Case 2: a brand-new place — create it pending, call the agent to
        // evaluate it, then persist the result.
        const venueAddress = body.venueAddress?.trim();
        const eventDate = body.eventDate?.trim();
        if (!venueAddress || !eventDate) {
          return new Response("venueAddress and eventDate are required", {
            status: 400,
          });
        }

        const pending = await createPendingPlace(venueAddress, eventDate);

        const result = await callAgentOnce([
          {
            role: "user",
            content: `Assess ${venueAddress} for an outdoor event on ${eventDate}.`,
          },
        ]);

        if (!result.ok) {
          const failed = await markPlaceError(pending.id, result.message);
          return Response.json({ place: failed ?? pending }, { status: 502 });
        }

        if (!result.placeEvaluation) {
          const failed = await markPlaceError(
            pending.id,
            result.text ||
              "The agent did not return a structured evaluation for this venue.",
          );
          return Response.json({ place: failed ?? pending }, { status: 200 });
        }

        const ready = await markPlaceReady(pending.id, result.placeEvaluation);
        return Response.json({ place: ready ?? pending }, { status: 200 });
      },

      DELETE: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("id");
        if (!id) {
          return new Response("id query parameter is required", {
            status: 400,
          });
        }

        const removed = await deletePlace(id);
        if (!removed) {
          return new Response("Place not found", { status: 404 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
