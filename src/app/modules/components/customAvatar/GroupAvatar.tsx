import Tooltip, { } from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import React, { useEffect, useRef, useState } from "react";
import { generateUUID, stringAvatar } from "../../utils/common";
import { useAppDispatch } from "../../../../store";
import "./CustomAvatar.css";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { LabelTitleSemibold2 } from "../common/formsLabels/detailLabels";
import { Modal } from "react-bootstrap";

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



export const GroupAvatar = ({ data, showDefaultGroupIcon = false }) => {

    const [iconPath, setIconPath] = useState<any>();

    const lang = useLang();

    const TooltipTitle = () => {
        const elRef = useRef();

        return (
            <div className="user-list domain-title scrollable-height-setup">
                {
                    data && data.map((name) => {

                        return (
                            <div className="user-section">
                                <UserContactInfo
                                    name={name.groupName}
                                    groupId={name.groupId}
                                    image={""}
                                    customStyle={""}
                                    isShowText={true}
                                    members={name.groupMembers}
                                />
                            </div>
                        );
                    })
                }
            </div>
        );
    };

    const getIconByGender = (gender: string) => {
        if (gender && gender === "1") {
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
                                                            <Avatar className="custom-avt" src={getIconByGender(name.gender)}  {...stringAvatar(name.groupName)}></Avatar>
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
                                name={data[0].name}
                                groupId={data[0]?.groupId}
                                image={""}
                                customStyle={""}
                                isShowText={false}
                                members={data[0]?.groupMembers}
                            />
                        )
                    )
            }
        </>
    );
};

export const UserContactInfo = ({ groupId, name, image, customStyle, isShowText, isAvtIconLarge = false, members ,gender = "" }) => {
    const domainInfo = React.useRef(null);
    const lang = useLang();
    const dispatch = useAppDispatch();
    const [iconPath, setIconPath] = useState<any>();
    const [showMembers, setShowMembers] = useState(false);

    const baseAvatarStyle = {
        width: "26px",
        height: "26px",
        fontSize: "11px",
        fontWeight: 400,
    };

    useEffect(()=>{
      if(gender && gender === "1") {
        setIconPath(maleIcon);
      } else if (gender && gender === "2") {
        setIconPath(femaleIcon);
      } else {
        setIconPath(undefined)
      }
    },[]);
  

    const TooltipTitle = () => {
        const elRef = useRef();

        return (
            <div className="user-list domain-title scrollable-height-setup">
                {
                    members && members.map((name) => {

                        return (
                            <div className="user-section">
                                <UserContactInfo
                                    name={lang == "ar" ? (!name.nameAr || name.nameAr == "" ? name?.displayName : name.nameAr) : name?.displayName}
                                    groupId={name.userid}
                                    image={""}
                                    customStyle={""}
                                    isShowText={true}
                                    gender={name.gender && name.gender !== "" ? name.gender : undefined}
                                    members={[]}
                                />
                            </div>
                        );
                    })
                }
            </div>
        );
    };


    return (
        <>
            <div className="user-list domain-titlepp" >
                <div className="user-section">

                    {/* Customized Tooltip for new Design */}
                    <Tooltip
                        placement="top"
                        title={members && members.length > 0 ? <TooltipTitle /> : ""}
                        arrow
                        TransitionProps={{ timeout: 400 }}
                    >
                        <AvatarGroup className="custom-grp-avt">
                            {image != "" ? (
                                <>
                                    <Avatar
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
                                                // {...stringAvatar(name?.toUpperCase())}
                                                {...name}
                                            ></Avatar>
                                    }
                                </>
                            )}
                        </AvatarGroup>
                    </Tooltip>
                    {isShowText && <p className="user-name mb-0 px-1" ><LabelTitleSemibold2 text={name} isI18nKey={false} style={{ display: 'inline' }} /></p>}
                </div>
            </div>


            <Modal key={generateUUID()} show={showMembers} onHide={() => setShowMembers(false)} className="meeting-response-modal" backdrop="static" >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {JSON.stringify(members)}
                </Modal.Body>
            </Modal>
        </>
    );
};

