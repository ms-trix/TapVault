export type Screen = 'scan' | 'seal' | 'locked' | 'reveal';
export type ScanPhase = 'listening' | 'detecting' | 'found';

export type Note = {
  recipient: string;
  message: string;
  from: string;
  voiceUri?: string;
  voiceDurationSec?: number;
};

export const demoNote: Note = {
  recipient: 'Mom',
  message:
    'For all the little things you did that felt ordinary at the time, but meant everything to me. I hope you know how loved you are.',
  from: 'Alex',
};
