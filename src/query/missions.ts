import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Mission, MissionSubmissionStatus } from '../types';

export const MISSIONS_QUERY_KEY = ['missions'] as const;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Plant a Tree',
    description: 'Plant one sapling and explain how you will care for it.',
    type: 'photo',
    points: 25,
    submissionStatus: 'pending',
    evidenceTypes: ['photo', 'voice', 'text'],
    assignedBy: 'Mentor',
  },
  {
    id: 'm2',
    title: 'Keep Street Clean',
    description: 'Spend 15 minutes cleaning nearby surroundings safely.',
    type: 'text',
    points: 20,
    submissionStatus: 'pending',
    evidenceTypes: ['photo', 'text'],
    assignedBy: 'School',
  },
  {
    id: 'm3',
    title: 'Save Electricity',
    description: 'Track and reduce unnecessary power usage for one day.',
    type: 'voice',
    points: 18,
    submissionStatus: 'submitted',
    evidenceTypes: ['voice', 'text'],
    assignedBy: 'Mentor',
    submission: {
      text: 'Turned off fan/lights when leaving rooms. Saved evening usage.',
      timestamp: 'Today, 6:45 PM',
    },
  },
  {
    id: 'm4',
    title: 'Community Kindness Note',
    description: 'Write a short thank-you to someone who helped your family this week.',
    type: 'text',
    points: 12,
    submissionStatus: 'approved',
    evidenceTypes: ['text'],
    assignedBy: 'School',
    submission: {
      text: 'Thanked our neighbor for tutoring help.',
      timestamp: 'Mon, 4:12 PM',
    },
  },
];

async function fetchMissions(): Promise<Mission[]> {
  await delay(200);
  return INITIAL_MISSIONS;
}

export function useMissionsQuery() {
  return useQuery({
    queryKey: MISSIONS_QUERY_KEY,
    queryFn: fetchMissions,
    initialData: INITIAL_MISSIONS,
  });
}

type SubmitPayload = {
  missionId: string;
  photoUri?: string;
  voiceUri?: string;
  text?: string;
};

/** Mock upload + optimistic submitted; optional delayed mentor approval for UX demo. */
async function submitMissionApi(payload: SubmitPayload): Promise<{ status: MissionSubmissionStatus }> {
  await delay(650);
  return { status: 'submitted' };
}

export function useSubmitMissionMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: submitMissionApi,
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: MISSIONS_QUERY_KEY });
      const previous = qc.getQueryData<Mission[]>(MISSIONS_QUERY_KEY);
      qc.setQueryData<Mission[]>(MISSIONS_QUERY_KEY, (old) =>
        (old ?? []).map((m) =>
          m.id === variables.missionId
            ? {
                ...m,
                submissionStatus: 'submitted' as const,
                submission: {
                  text: variables.text ?? m.submission?.text,
                  media: variables.photoUri ?? variables.voiceUri ?? m.submission?.media,
                  timestamp: 'Just now',
                },
              }
            : m,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(MISSIONS_QUERY_KEY, ctx.previous);
      }
    },
    onSuccess: async (_data, variables) => {
      // Simulate mentor approval after a short delay (demo only).
      await delay(2800);
      qc.setQueryData<Mission[]>(MISSIONS_QUERY_KEY, (old) =>
        (old ?? []).map((m) =>
          m.id === variables.missionId ? { ...m, submissionStatus: 'approved' as const } : m,
        ),
      );
    },
  });
}
