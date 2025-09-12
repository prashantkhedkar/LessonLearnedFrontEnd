import Paperclip from "../../../_metronic/assets/images/Paperclip.png";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import cssdash from "./DashboardPage.module.css";
import { motion } from "framer-motion";
import email from "../../../_metronic/assets/images/Email.png";
import React from "react";
import { useIntl } from "react-intl";
import CardHeaderLabel from "../../modules/components/common/CardHeaderLabel/cardHeaderLabel";
import CardHeaderSubLabel from "../../modules/components/common/CardHeaderLabel/cardHeaderSubLabel";
import { LabeltxtMedium2, LabeltxtSmallMedium, LabeltxtSmallRegular } from "../../modules/components/common/formsLabels/detailLabels";
import { useLang } from "../../../_metronic/i18n/Metronici18n";

export const RecentEmails = () => {
  const [isemailActive, setIsEmailActive] = React.useState(false);
  const intl = useIntl();
  const arrData = [1, 2, 3, 4, 5, 6, 7, 8];
  const lang = useLang();

  return (
    <div className={`card card-flush MOD-Card`}>
      <div className="card-header border-0 MOD-Card-header">
        <h3 className="card-title align-items-start flex-column MOD-card-title" style={{ display: "initial" }}>
          <CardHeaderLabel style={{}} text={"MOD.DASHBOARD.RECENTEMAIL"} />
          <CardHeaderSubLabel style={{}} text={""} numericVal={" (5) "} />
        </h3>
        <div className="card-toolbar MOD-card-toolbar">
          <a
            href="#"
            className={`btn btn-sm btn-light ${cssdash["link-email-icom"]}`}>
            <motion.img onMouseEnter={() => setIsEmailActive(!isemailActive)} onMouseLeave={() => setIsEmailActive(!isemailActive)}
              className={`${cssdash["banner-img"]}`}
              src={email}
              alt="Banner"
              animate={{
                rotate: isemailActive ? 90 : 0
              }}
            />
          </a>
        </div>
      </div>
      <div
        className={`card-body MOD-Cardbody-minHeight17`}>
        {arrData.map((item,index) => (
          <>
            <div key={index.toString()} className={`d-flex flex-stack ${cssdash["flex-custom"]}`}>
              <div className="d-flex align-items-center me-3">
                <FiberManualRecordIcon
                  className="me-2 w-20px fs-12"
                  style={{ color: "#F87171" }}
                />

                <div className="flex-grow-1">
                  <LabeltxtSmallMedium isI18nKey={false} text={(lang === 'en') ? "Communication Department" : "قسم الإتصالات"} style={{ color: "var(--text-6, #9ca3af)" }} />
                  <a
                    href="#"
                    className={cssdash["notification-subject"]}>
                    <LabeltxtMedium2 isI18nKey={false} text={(lang === 'en') ? "The new dates for the 24th session" : "المواعيد الجديدة للدورة الرابعة والعشرون"} />
                  </a>
                </div>
              </div>

              <div className="d-flex align-items-center text-end mw-125px">
                <div className="flex-grow-1">
                  <span className={cssdash["notification-time"]}>
                    <LabeltxtSmallRegular isI18nKey={false} text={(lang === 'en') ? "Today at 1124" : "اليوم في الساعة 1124"}  />
                  </span>
                  <a
                    href="#"
                    className="text-gray-800 text-hover-primary fs-5 fw-bold lh-0">
                    <img src={Paperclip} alt="Banner" />
                  </a>
                </div>
              </div>
            </div>

            <div className="my-3"></div>
          </>
        ))}
      </div>
    </div>
  )
}