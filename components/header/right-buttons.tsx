import HamburgerBtn from "./hamburger-btn";
import UserDropdown from "./user-dropdown";

const RightButtons = () => {
  return (
    <div className="flex items-center gap-3">
      <UserDropdown />
      <HamburgerBtn />
    </div>
  );
};

export default RightButtons;
