import { useAuth } from "../../../../../app/modules/auth";
import ProfileAvatar from "../../../../../app/modules/components/profileAvatar/ProfileAvatar";
import { toAbsoluteUrl } from "../../../../helpers";
import { useIntl } from "react-intl";
import { useLang } from "../../../../i18n/Metronici18n";

import { Link } from "react-router-dom";

const SidebarUserProfile = () => {
  const { auth } = useAuth();
  const intl = useIntl();
  const lang = useLang();

  return (
    <>
      <div className="sidebar_userprofile_container pt-10">
        <ProfileAvatar
          name={auth?.displayNameEn == "" ? "NA" : auth?.displayNameEn}
        />
        {/* <img
          alt="Logo"
          src={toAbsoluteUrl("/media/logos/png/ellipse-131.png")}
          className=" sidebar_userprofile_picframe"
        /> */}

        <div className="sidebar_userprofile_userdetail_container ">
          {/* <span className="user_profile_title"> 
          {lang == 'en' ? auth?.rankNameEn: auth?.rankNameAr}</span> */}
          <span className="sidebar_userprofile_userdetail_Name user_profile_name">
            {lang == "en" ? auth?.displayNameEn : auth?.displayNameAr}
          </span>
          {/* <span className="user_profile_title"> 
           {lang == 'en' ? auth?.rankNameEn: auth?.rankNameAr} 
           
          </span> */}
        </div>
      </div>
    </>
  );
};

export { SidebarUserProfile };
