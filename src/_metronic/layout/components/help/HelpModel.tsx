import { Badge, Tooltip } from "@mui/material";
import { useLang } from "../../../i18n/Metronici18n";
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import { useState } from "react";
import { SpinnerGrow } from "../../../../app/modules/components/loader/SpinnerGrow";

export const HelpModel=({ sidebarModel, setSidebarModel })=>{
    const lang = useLang();
    const closeHanlde = () => {
        document
          .getElementsByClassName("notification_div")[0]
          .classList.remove("active");
        setTimeout(() => {
          setSidebarModel({
            ...sidebarModel,
            showModal: false,
          });
        }, 300);
      };
      const [modelData, setModelData] = useState({
        activeTab: sidebarModel.activeEle === "post" ? 4 : 0,
        notificationData: [],
        unReadData: [],
        assignedData: [],
        mentionedData: [],
        assginToCount: 0,
        mentionedToCount: 0,
        unreadCount: 0,
        unreadIds: "",
        notificationMsg: "No notification available!",
        loading: sidebarModel.activeEle === "post" ? false : true,
        pageNumber: 0,
        unReadPageNumber: 0,
      });
    return (
        <>
          <div
            className="noti_overlay active"
          // onClick={closeHanlde}
    
          ></div>
          <div className={lang==="ar" ? 'notification_right notification_div active' : 'notification_left notification_div active'}>
            <div
              className="row d-flex justify-content-start notification_header mb-6"
            // onClick={closeHanlde}
            >
    
              <div className="col-sm-9">{"Notifications"}</div>
              <div className="col-sm-3"> <Badge className="close_badge backArrow" onClick={closeHanlde} >
                <CloseSharpIcon />
              </Badge></div> 
            </div>
            <hr className="mb-5" />
            {modelData.unreadCount > 1 &&
              modelData.activeTab !== 4 &&
              (modelData.activeTab === 0 || modelData.activeTab === 1) && (
                <>
                  <Tooltip placement="top" title="Real all" arrow>
                    <div
                      className="fs-5 float-end p-3"
                      style={{ cursor: "pointer" }}
                    >
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                        
                        }}
                      >
                        Read All
                      </a>
                    </div>
                  </Tooltip>
                </>
              )}
    
            {
            modelData.notificationData.length > 0 && modelData.loading ? (
              <SpinnerGrow extraClass={"mt-5"} />
            ) : (
              <>
                <div
                  className={`${modelData.unreadCount > 0 ? "" : "mt-3"}`}
                  
                ></div>
    
                <div className="noti_overflow" style={{ paddingBottom: "6rem" }}>
                  {modelData.activeTab === 0 && (
                    <div className={`request tabnoti_con active`}>
                    
                    </div>
                  )}
    
    
                </div>
              </>
            )}
          </div>
        </>
      );
}