import { DetailLabels, LabelTitleSemibold1 } from "../common/formsLabels/detailLabels";
import "./CountWidget.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const CountWidget = ({
  iconColor = "",
  iconBgColor = "",
  name = "",
  count = "",
  iconName = "",
  style = {},
  iconFilled = false,
}) => {
  const { [iconName]: icon } = iconFilled
    ? require("@fortawesome/free-solid-svg-icons")
    : require("@fortawesome/free-regular-svg-icons");

  return (
    <div className="dashboard-count-widget" style={style}>
      <div className="d-flex align-items-center gap-3">
        <div className="icon-wrapper" style={{ backgroundColor: iconBgColor }}>
          <div className="icon-holder d-flex justify-content-center align-items-center">
            <FontAwesomeIcon
              icon={icon}
              size="xl"
              className="statsBox_img__MihSs icon"
              color={iconColor}
            />
          </div>
        </div>
        <div className="content-area d-flex flex-column">
          <div className="font-bold-1" style={{ color: "#868c97" }}>
            <LabelTitleSemibold1 text={name} isI18nKey={false} />
          </div>
          <div className="count font-bold-3">{count}</div>
        </div>
      </div>
    </div>
  );
};

export default CountWidget;
