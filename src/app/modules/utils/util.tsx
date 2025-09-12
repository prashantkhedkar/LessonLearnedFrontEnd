import Tooltip from "@mui/material/Tooltip";
import React from "react";
import "./utils.css";
import { DetailLabels } from "../components/common/formsLabels/detailLabels";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../../_metronic/i18n/Metronici18n";



interface TrimContentProps {
  style?: React.CSSProperties;
  value: string;
  length?: number;
  classNames?: string;
  tooltipValue?: string;
}
export const TrimContent = ({ value, tooltipValue = '', length = 20, style, classNames }: TrimContentProps) => {
  const lang = useLang();

  const ManageTooltipTitle = ({ title }) => {
    return (
      <div className="txt-trim-content">
        <span className={`txt-name text-capitalize ${classNames ? classNames : ""} `} dir={(lang === "en") ? 'ltr' : 'rtl'}>
          <div dangerouslySetInnerHTML={{ __html: title }} />
          {/* {title?.substring(0, 100)} */}
        </span>
      </div>
    );
  };

  return (
    <>
      {
        (value && value.length > 0) ?
          (
            <>
              <Tooltip
                placement="top"
                title={<ManageTooltipTitle title={tooltipValue === '' ? value : tooltipValue} />}
                arrow
                TransitionProps={{ timeout: 400 }}
              >
                {
                  value.length > length ?
                    (
                      <span className={`txt-name text-capitalize ${classNames} `} style={style}>{value.substring(0, length)}...</span>
                    ) :
                    (
                      <span className={`txt-name text-capitalize ${classNames} `} style={style}>{value}</span>
                    )
                }
              </Tooltip>
            </>
          )
          :
          (
            <span className={`txt-name text-capitalize ${classNames} `} style={style}>{""}</span>
          )
      }
    </>
  );
};

interface ViewAllLinkprops {
  style?: React.CSSProperties;
  linktext: string;
  tooltiptext: string;
  customClassName?: string;
  redirectUrl: string;
  onLinkClick?: any;
  //children: React.ReactNode;
}
export const CustomHyperLink = ({ linktext, tooltiptext, customClassName = "", style, redirectUrl = "", onLinkClick }: ViewAllLinkprops) => {
  const navigate = useNavigate();

  const handleClick = (redirectTo) => {
    navigate(redirectTo);
  };

  const ManageTooltipTitle = ({ title }) => {
    return (
      <div className="txt-trim-content">
        <span className="txt-name"><DetailLabels text={title.toString()} isI18nKey={true} /></span>
      </div>
    );
  };

  return (
    <>
      {
        (linktext && linktext.length > 0) ?
          (
            <>

              <Tooltip
                placement="top"
                title={<ManageTooltipTitle title={tooltiptext} />}
                arrow
                TransitionProps={{ timeout: 400 }}
              >
                {
                  //  <DetailLabels text={value} isI18nKey={true} customClassName="view-all-link"/>

                  <span className="txt-name" onClick={() => {onLinkClick ? onLinkClick() : handleClick(redirectUrl)}} ><DetailLabels text={linktext.toString()} isI18nKey={true} customClassName={customClassName} /></span>
                }
              </Tooltip>
            </>
          )
          :
          (
            <span className="txt-name text-capitalize">{""}</span>
          )
      }
    </>
  );
};

interface BadgeButtonProps {
  style?: React.CSSProperties;
  linktext: string;
  tooltiptext: string;
  customClassName: string;
  isDisabled: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}
export const JPBadgeButton = ({ linktext, tooltiptext, customClassName, style, isDisabled, onClick, children }: BadgeButtonProps) => {
  const navigate = useNavigate();


  const ManageTooltipTitle = ({ title }) => {
    return (
      <div className="txt-trim-content">
        <span className="txt-name"><DetailLabels text={title.toString()} isI18nKey={false} /></span>
      </div>
    );
  };

  return (
    <>
      {
        <>
          <Tooltip
            placement="top"
            title={<ManageTooltipTitle title={tooltiptext} />}
            arrow
            TransitionProps={{ timeout: 400 }}
          >
            {
              <button
                className={customClassName}
                aria-label="clear"
                onClick={onClick}
                disabled={isDisabled}>
                {children}
              </button>}
          </Tooltip>
        </>
      }
    </>
  );
};

export const TrimCenterContent = ({ value }) => {
  const ManageTooltipTitle = ({ title }) => {
    return (
      <div className="txt-trim-content">
        <span className="txt-name text-capitalize">{title}</span>
      </div>
    );
  };

  return (
    <>
      {
        (value && value.length > 0) ?
          (
            <>
              <Tooltip
                placement="top"
                title={<ManageTooltipTitle title={value} />}
                arrow
                TransitionProps={{ timeout: 400 }}
              >
                {
                  value.length > 20 ?
                    (
                      <span className="txt-name text-capitalize">{value.substring(0, 15)} ... {value.substring(value.length - 5, value.length)} </span>
                    ) :
                    (
                      <span className="txt-name text-capitalize">{value}</span>
                    )
                }
              </Tooltip>
            </>
          )
          :
          (
            <span className="txt-name text-capitalize">{""}</span>
          )
      }
    </>
  );
};

function getDatePickerLocale(lang) {
  var days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (lang == "ar") {
    var days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    var months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  }

  return {
    localize: {
      day: n => days[n],
      month: n => months[n]
    },
    formatLong: {
      date: () => 'dd/mm/yyyy'
    }
  }
}

export default getDatePickerLocale;

const allowedTags = ['a', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'ins'];

export function sanitizeDescription(description: string) {
  const doc = new DOMParser().parseFromString(description, 'text/html');

  doc.body.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.includes(element.nodeName.toLowerCase())) {
      element.remove();
    }
  });

  return doc.body.innerHTML;
}


export const handleOutsideClick = (event, containerRef, callback) => {
  try {
    if (!containerRef.current) return;

    // check the click is inside the widget
    if (containerRef.current && containerRef.current?.contains(event.target as Node)) {
      return;
    }
    callback();
  } catch (e) {
    console.log(e);
  }
}