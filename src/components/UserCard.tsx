import { Card } from "@headlessui/react";

export interface UserCardProps {
  userName: string;
}

export const UserCard = ({ userName }: UserCardProps) => {
  return (
    <div className="flex justify-center">
      <Card className="p-4 bg-white shadow-md rounded-lg">
        <div className="text-lg font-medium text-gray-800">{userName}</div>
      </Card>
    </div>
  );
};
