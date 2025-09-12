import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import React, { useEffect, useRef, useState } from "react";
import { stringAvatar } from "../../utils/common";
import { useDispatch } from "react-redux";
import { Done } from "@mui/icons-material";
import gsap from "gsap";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import "./CustomAvatar.css";
import { SpinnerGrow } from "../loader/SpinnerGrow";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { InfoLabels, LabelTitleSemibold2 } from "../common/formsLabels/detailLabels";
import { HtmlTooltip } from "../tooltip/HtmlTooltip";

interface IContactDetails {
  anchorEl: string;
  loading: boolean;
  showContact: boolean;
  userContactData: any[];
  isEmailcopy: boolean;
  isHover: boolean;
}

const maleIcon = "/media/new-design/svg/user-male.svg";
const femaleIcon = "/media/new-design/svg/user-female.svg";



export const UserGroupAvatar = ({ data, showDefaultGroupIcon = false }) => {

  const [iconPath, setIconPath] = useState<any>();

  const lang = useLang();

  const TooltipTitle = () => {
    const elRef = useRef();

    //setTimeout(() => {
    // if (elRef.current) {
    //   elRef.current.parentElement.style.padding = 0;
    //   elRef.current.nextElementSibling.style.color = "#fff";
    // }
    //}, 2);

    return (
      <div className="user-list domain-title scrollable-height-setup">
        {
          data && data.map((name) => {
            return (
              <div className="user-section">
                <UserContactInfo
                  name={lang == "ar" ? (!name.nameAr || name.nameAr == "" ? name?.displayName : name.nameAr) : name?.displayName}
                  userid={name.userid}
                  image={""}
                  customStyle={""}
                  isShowText={true}
                  gender={name.gender && name.gender !== "" ? name.gender : undefined}
                />
                {/* <p className="user-name">{name.username}</p> */}
              </div>
            );
          })
        }
      </div>
    );
  };

  const getIconByGender = (gender:string) => {
    if(gender && gender === "1") {
      return maleIcon;
    } else if (gender && gender === "2") {
      return femaleIcon;
    } else {
      return undefined;
    }
  }


  return (
    <>
      {
        data && data.length > 0 ? (
          <div className="user-list domain-titlepp">
            <div className="user-section">
              <Tooltip
                placement="top"
                title={<TooltipTitle />}
                arrow
                TransitionProps={{ timeout: 400 }}
                className="custom-tooltip">
                <AvatarGroup max={3} className="custom-grp-avt">
                  {
                    data && data.map((name) => {
                      return (
                        <>
                          {
                            lang == "ar" ?
                              <Avatar className="custom-avt" src={getIconByGender(name.gender)} ></Avatar>
                              :
                              <Avatar className="custom-avt" src={getIconByGender(name.gender)}  {...stringAvatar(name.displayName)}></Avatar>
                          }
                        </>
                      );
                    })
                  }
                </AvatarGroup>
              </Tooltip>
            </div>
          </div>
        ) :
          (
            data && data.length > 0 &&
            data[0]?.userName && (
              <UserContactInfo
                name={lang == "ar" ? (!data[0]?.nameAr || data[0]?.nameAr == "" ? data[0]?.displayName : data[0]?.nameAr) : data[0]?.displayName}
                userid={data[0]?.userid}
                image={""}
                customStyle={""}
                isShowText={false}
                nameAr={lang == "ar" ? (data[0]?.nameAr == "" ? data[0]?.displayName : data[0]?.nameAr) : data[0]?.displayName}
                gender={data[0]?.gender}
              />
            )
          )
      }
    </>
  );
};

export const UserContactInfo = ({ userid, name, image, customStyle, isShowText, isAvtIconLarge = false, nameAr = "", src = "", isnewDesign = false, gender = "", isBold = true }) => {
  const domainInfo = React.useRef(null);
  const lang = useLang();
  const dispatch = useDispatch();

  const [iconPath, setIconPath] = useState<any>();

  useEffect(()=>{
    if(gender && gender === "1") {
      setIconPath(maleIcon);
    } else if (gender && gender === "2") {
      setIconPath(femaleIcon);
    } else {
      setIconPath(undefined)
    }
  },[]);


  const ContactDetail = () => {
    const [infoDetail, setInfoDetail] = useState<IContactDetails>({
      anchorEl: "",
      loading: false,
      showContact: false,
      userContactData: [],
      isEmailcopy: false,
      isHover: false,
    });

    const refContact = useRef();

    function showDetail() {
      gsap.timeline().to(".inner-email", {
        duration: 0.4,
        delay: 0.1,
        height: "auto",
        ease: "power4.out",
      });
    }

    const getContactDetail = () => {
      if (infoDetail.userContactData.length === 0) {
        setInfoDetail({ ...infoDetail, loading: true });
      }

      setTimeout(() => {
        setInfoDetail({
          ...infoDetail,
          loading: false,
          showContact: true,
          userContactData: [
            {
              userName: "Mohammad Ayman Walid Islam",
              emailaddress: "Pk@gmail.com",
              contactno: "+971-5-578344645",
            },
          ],
          isEmailcopy: false,
        });
        // showDetail();
      }, 1000);
      
    };


    const onHoverHandle = () => {
      setInfoDetail({ ...infoDetail, isHover: !infoDetail.isHover });
    };

    return (
      <>
        <tr>
          <td colSpan={2} className="contact-line">
            <div className="detail-botton" onMouseEnter={getContactDetail}>
              <LocalPhoneOutlinedIcon /> {infoDetail?.showContact}
              Contact Details
            </div>
          </td>
        </tr>

        {infoDetail.showContact && (
          <tr>
            <td colSpan={2} className={`contact-email`}>
              <p className="inner-email">
                <EmailOutlinedIcon /> &nbsp;&nbsp;
                <span id="input-email">
                  {infoDetail.userContactData[0]?.emailaddress}
                </span>
                <Tooltip
                  placement="top"
                  title={`${infoDetail.isEmailcopy ? "Email Copied" : "Copy"}`}
                  arrow
                >
                  <div
                    className="float-end copy-icon"
                    onMouseEnter={onHoverHandle}
                    onMouseLeave={onHoverHandle}
                  //   onClick={copyEmail}
                  >
                    {!infoDetail.isEmailcopy ? (
                      <img
                        //   src={
                        //     infoDetail.isHover
                        //       ? images.COPY_IMG
                        //       : images.COPY_IMG_NORMAL
                        //   }
                        src=""
                        width={14}
                        height={18}
                        alt=""
                      ></img>
                    ) : (
                      <div className="done-icon">
                        <Done />
                      </div>
                    )}
                  </div>
                </Tooltip>
              </p>

              {infoDetail?.userContactData && (
                <p className="inner-email">
                  <LocalPhoneOutlinedIcon /> &nbsp;&nbsp;
                  <span className="number">
                    {/* {infoDetail?.userContactData?.contactno} */}
                    +971-5-578344645
                  </span>
                </p>
              )}
            </td>
          </tr>
        )}

        <tr>
          <td colSpan={2} className="contact-line">
            {infoDetail.loading && <SpinnerGrow />}
          </td>
        </tr>
      </>
    );
  };

  const baseAvatarStyle = {
    width: "26px",
    height: "26px",
    fontSize: "11px",
    fontWeight: 400,
  };

  const ManageTooltipTitle = ({ title }) => {
    //   setTimeout(() => {
    //     domainInfo.current.parentElement.style.padding = 0;

    //     domainInfo.current.nextElementSibling.style.color = "#fff";
    //   }, 2);

    return (
      <div className="domain-title" ref={domainInfo}>
        <div className="row">
          <div className="col avatar-user-box">
            <>
              {
                lang == "ar" ?
                  <Avatar
                    src={iconPath}
                    className="custom-avt"

                  ></Avatar>
                  :
                  <Avatar
                    src={iconPath}
                    className="custom-avt"
                    {...stringAvatar(title?.toUpperCase())}
                  ></Avatar>
              }
            </>
          </div>
          <div className="col">
            <span className={"display-name-" + lang}>
              <LabelTitleSemibold2 text={title?.substring(0, 100)} isI18nKey={false} style={{ display: 'inline' }} />

            </span>
          </div>
        </div>

      </div>
    );
  };

  return (
    <>
      <div className="user-list domain-titlepp">
        <div className="user-section">

{/* Customized Tooltip for new Design */}
          {isnewDesign === true ?
            <HtmlTooltip title={""}>
              <AvatarGroup className="custom-grp-avt">
                {image != "" ? (
                  <>
                    <Avatar
                      // className={{isForComment?"custom-avt-comments":"custom-avt" }}
                      className={`${isAvtIconLarge == true ? "custom-avt-comments" : "custom-avt"}`}
                      src={`data:image/png;base64,${image}`}
                    // {...stringAvatar(name?.toUpperCase())}
                    ></Avatar>
                  </>
                ) : (
                  <>
                    {
                      lang == "ar" ?
                        <Avatar src={iconPath}
                          className={`${isAvtIconLarge == true ? "custom-avt-comments" : "custom-avt"}`}

                        ></Avatar>
                        :
                        <Avatar src={iconPath}
                          className={`${isAvtIconLarge == true ? "custom-avt-comments" : "custom-avt"}`}
                          {...stringAvatar(name?.toUpperCase())}
                        ></Avatar>
                    }
                    {/* <Avatar
                      className={`${isAvtIconLarge==true? "custom-avt-comments" : "custom-avt"}`}
                    {...stringAvatar(name?.toUpperCase())}
                  ></Avatar> */}
                  </>
                )}
              </AvatarGroup>

            </HtmlTooltip> : 
            /* Inner Screen Tooltips */
            <Tooltip
              placement="top"
              title={userid > 0 ? <ManageTooltipTitle title={lang == "ar" ? ((nameAr == "" || nameAr == null) ? name : nameAr) : name} /> : ""}
              arrow
              TransitionProps={{ timeout: 400 }}
            >


              {/* <HtmlTooltip title={<UserAvatarToolTip title={userid > 0 ? lang == "ar" ? ((nameAr == "" || nameAr == null) ? name : nameAr) : name : ""} iconPath={iconPath} />}> */}

              <AvatarGroup className="custom-grp-avt">
                {image != "" ? (
                  <>
                    <Avatar
                      // className={{isForComment?"custom-avt-comments":"custom-avt" }}
                      className={`${isAvtIconLarge == true ? "custom-avt-comments" : "custom-avt"}`}
                      src={`data:image/png;base64,${image}`}
                    // {...stringAvatar(name?.toUpperCase())}
                    ></Avatar>
                  </>
                ) : (
                  <>
                    {
                      lang == "ar" ?
                        <Avatar src={iconPath}
                          className={`${isAvtIconLarge == true ? "custom-avt-comments" : "custom-avt"}`}

                        ></Avatar>
                        :
                        <Avatar src={iconPath}
                          className={`${isAvtIconLarge == true ? "custom-avt-comments" : "custom-avt"}`}
                          {...stringAvatar(name?.toUpperCase())}
                        ></Avatar>
                    }
                    {/* <Avatar
                      className={`${isAvtIconLarge==true? "custom-avt-comments" : "custom-avt"}`}
                    {...stringAvatar(name?.toUpperCase())}
                  ></Avatar> */}
                  </>
                )}
              </AvatarGroup>

              {/* </HtmlTooltip> */}
            </Tooltip>

          }


          {isShowText && <p className="user-name mb-0 px-1">
            {isBold ? 
              <LabelTitleSemibold2 text={name} isI18nKey={false} style={{ display: 'inline' }} />
            :  <InfoLabels text={name} isI18nKey={false} style={{ display: 'inline' }} />
            }
          </p>}
        </div>
      </div>
    </>
  );
};

