/**
 * Pass prop to card that is the value? Iterate through the possible values and show a bunch of cards?
 * or is that silly to have a component that is literally a div
 */

export interface UserCardProps {
  userName: string;
}

export const UserCard = ({ userName }: UserCardProps) => {
  return (
    <>
      <div className="user-card-wrapper">
        <div className="user-card" style={{ margin: "8px" }}>
          {userName}
        </div>
      </div>
    </>
  );
};
