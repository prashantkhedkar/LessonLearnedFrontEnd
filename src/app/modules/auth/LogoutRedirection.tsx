import React from "react";
import { useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "../../../_metronic/helpers";
import "./Logout.css";

export function LogoutRedirection() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/home", {});
  };

  return (
    <React.Fragment>
      <div className="logout-container">
        <img
          src={toAbsoluteUrl(`/media/logos/png/logo.png`)}
          className="loginLogo"
          alt="logout-logo"
        />
        <div className="heading">تسجيل خروج</div>
        <hr className="hr-line"></hr>
        <div className="body-title">الشروط والأحكام</div>
        <div className="body-text">
          <ul>
            <li>
              استخدام خدمات نطاق التواصل في نطاق العمل و عدم استخدامه للأغراض
              الشخصية أو بأية طريقة تسيء لسمعة القوات المسلحة أو العاملين بها
              بأي شكل من الأشكال.
            </li>
            <li>ان نظام المعلومات المراد الاتصال به خاص بالقوات المسلحة.</li>
            <li>ان استخدام النظام قد يخضع للمراقبة بالإضافة للتسجيل.</li>
            <li>
              ان دخول غير المخولين للنظام يعتبر عرضة للعقوبات الجنائية و
              المدنية.
            </li>
            <li>
              ان استخدام الجهاز والدخول للنظام يعتبر إقرار من المستخدم بعلمه
              ببنود رسالة التنبيه و تحمله لكافة المسؤوليات التي وردت بها.
            </li>
          </ul>
        </div>
        <hr className="hr-line"></hr>
        <div className="continue-button" onClick={handleLogout}>
          العودة الى النظام
        </div>
      </div>
    </React.Fragment>
  );
}
