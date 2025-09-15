import csslbl from "./detailLabels.module.css";
import { useIntl } from "react-intl";
import { useEffect } from "react";
import { useLang } from "../../../../../_metronic/i18n/Metronici18n";

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import _ from "lodash";
import React from "react";
interface props {
    style?: React.CSSProperties;
    text: string;
    isRequired?: boolean;
    customClassName?: string;
    isI18nKey?: boolean;
    //children: React.ReactNode;
}

export const DetailLabels = ({ style, text, isRequired, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>
            <label className={isRequired ? `${csslbl["detail-lbl-" + lang]} ${"required"} ${customClassName} ` : `${csslbl["detail-lbl-" + lang]} ${customClassName} `} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const DetailLabelsText5 = ({ style, text, isRequired, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>
            <label className={isRequired ? `${csslbl["detail-lbl-text5-" + lang]} ${"required"} ${customClassName} ` : `${csslbl["detail-lbl-text5-" + lang]} ${customClassName} `} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const InfoLabels = ({ style, text, isRequired, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>


            <label className={isRequired ? `${"required"} ${csslbl["info-lbl-" + lang]} ${customClassName} ` : `${csslbl["info-lbl-" + lang]} ${customClassName}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabelTitleMedium1 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <span className={`${csslbl["lbl-title-medium-1-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </span>
        </React.Fragment>
    );
};

export const HeaderLabels = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["header-lbl-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabelSemibold2 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["lbl-semibold2-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabelSemibold6 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["lbl-header-semibold6-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabelSemibold4 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["lbl-header-semibold4-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const Labelregular2 = ({ style, text, customClassName, isI18nKey = true }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${customClassName} ${csslbl["lbl-regular2-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const Labelregular1 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <span className={` ${customClassName} ${csslbl["lbl-regular1-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </span>
        </React.Fragment>
    );
};

export const LabelTitleRegular2 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <span className={` ${customClassName} ${csslbl["lbl-Title-regular2-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </span>
        </React.Fragment>
    );
};

export const LabeltxtMedium2 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["lbl-txt-medium-2-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabeltxtSmallMedium = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["lbl-text-small-medium-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabelTitleSemibold1 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["lbl-Title-semibold-1-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabelTextSemibold1 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["lbl-text-semibold1-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabelTextSemibold2 = ({ style, text, isI18nKey = true, customClassName = "" }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["lbl-text-semibold-2"]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabelTextMedium1 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={`${customClassName} ${csslbl["lbl-text-medium-1"]} lbl-text-medium-1`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};
export const LabelheadingSemibold5 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["lbl-heading-semibold-5"]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};
export const LabelTitleSemibold2 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["lbl-Title-semibold-2-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const BtnLabeltxtMedium2 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <span className={` ${customClassName} ${customClassName} ${csslbl["btn-lbl-txt-medium-2-" + lang]} `} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </span>
        </React.Fragment>
    );
};

export const BtnLabelCanceltxtMedium2 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <span className={` ${customClassName} ${csslbl["btn-cancel-lbl-txt-medium-2-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </span>
        </React.Fragment>
    );
};

export const LabelTitleSmallSemibold = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <span className={`${customClassName} ${csslbl["lbl-small-semibold-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </span>
        </React.Fragment>
    );
};

export const HighlightedText = ({ text = "", highlight = "", className = "" }) => {
    const intl = useIntl();
    const lang = useLang();

    // split text on highlight term, include term itself into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));


    return <span className={`${csslbl["lbl-Title-semibold-1-" + lang]} ${className}`}>{parts.map(part => part.toLowerCase() === highlight.toLowerCase() ? <span className={`highlight-text ${csslbl["lbl-Title-semibold-1-" + lang]} ${className}`}  >{part}</span> : part)}</span>;

};

export const LabelTitleSemibold1White = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} ${csslbl["lbl-Title-semibold-1white-" + lang]}`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const BtnLabeltxtbold2 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <>
            <span className={` ${customClassName} lbl-text-bold-2`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </span>
        </>
    );
};

export const LabelHeadingMedium4 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <>
            <span className={` ${customClassName} heading-medium-4`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </span>
        </>
    );
};

export const LabelHeadingSemibold3 = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} lbl-header-semibold3`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabeltxtSmallRegular = ({ style, text, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>

            <label className={` ${customClassName} lbl-text-small-regular`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabelHeadingSemibold6 = ({ style, text, customClassName, isI18nKey = true }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>
            <label className={` ${customClassName} lbl-heading-semibold-6`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};

export const LabelCaptionMedium = ({ style, text, customClassName, isI18nKey = true }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>
            <label className={` ${customClassName} lbl-caption-medium`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};


export const ErrorLabel = ({ style, text, customClassName, isI18nKey = true }: props) => {
    const intl = useIntl();
    const lang = useLang();

    useEffect(() => {

    }, []);

    return (
        <React.Fragment>
            <small className={` ${customClassName} text-danger mt-1`} style={style} aria-labelledby={isI18nKey ? text : ""}>
                {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </small>
        </React.Fragment>
    );
};


export const DetailLabelsWhite = ({ style, text, isRequired, isI18nKey = true, customClassName }: props) => {
    const intl = useIntl();
    const lang = useLang();
    useEffect(() => {
    }, []);
    return (
        <React.Fragment>
            <label className={isRequired ? `${csslbl["detail-lbl-white-" + lang]} ${"required"} ${customClassName} ` : `${csslbl["detail-lbl-white-" + lang]} ${customClassName} `} style={style} aria-labelledby={isI18nKey ? text : ""}>
               {text && text != "" ? ((isI18nKey) ? intl.formatMessage({ id: text }) : text) : ""}
            </label>
        </React.Fragment>
    );
};