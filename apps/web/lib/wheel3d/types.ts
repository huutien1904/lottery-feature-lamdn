export type WheelParticipant = {
  id: string;
  name: string;
  code: string;
  avatarUrl?: string;
};

export type WheelPrize = {
  id: string;
  title: string;
  quantity: number;
};

export type WheelDataSource = "api" | "mock";

export type WheelDataResult = {
  participants: WheelParticipant[];
  prizes: WheelPrize[];
  source: WheelDataSource;
};

