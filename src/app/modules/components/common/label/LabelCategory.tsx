import css from './LabelCategory.module.css'
import moment from 'moment-with-locales-es6';
import 'moment/locale/ar';

export const LabelCategory = ({ value }) => {
    return (

        <span className={`menu-title ${css["applicationHeader"]}`} >

            {value}
        </span>
    )
}

export const LabelCategoryActive = ({ value }) => {
    return (

        <span className={`menu-title ${css["applicationHeaderActive"]}`} >

            {value}
        </span>
    )
}

export function GlobalLabel(props: { value, color?: string, fitContent?: boolean, required?: boolean, marginInlineStart?: string, marginInlineEnd?: string }) {
    return (

        <span className={css.globalLabel + (props.required ? " required" : "")}
            style={{
                color: props.color ? props.color : "#1f2937", width: props.fitContent ? "fit-content" : "100%"
                , marginInlineStart: props.marginInlineStart ? props.marginInlineStart : "0px"
                , marginInlineEnd: props.marginInlineEnd ? props.marginInlineEnd : "0px"
            }}
            dangerouslySetInnerHTML={{ __html: props.value }} >

        </span>
    )
}


export function dateToText(paramDate: Date, lang: string, showTime?: boolean) {
    const date = new Date(paramDate);
    if (!(date instanceof Date && !isNaN(date.getTime()))) {
        return "تاريخ غير صحيح";
    }

    var customLang = 'en-US';
    if (lang === "ar") {
        moment.locale('ar');
        customLang = "ar";
    }

    const dateFormatter = new Intl.DateTimeFormat(customLang, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    const timeFormatter = new Intl.DateTimeFormat(customLang, {
        hour: '2-digit',
        minute: '2-digit',
    });

    const myDate = dateFormatter.format(date);
    const myTime = timeFormatter.format(date);

    return myDate + (showTime ? " " + myTime : "");
}



export const LabelHeaderTextWithTag = ({ value ,css="" }) => {
    return (

        <span className={`fw-bold me-auto px-4 py-2  ${css}`}>{value}</span>
    )
}


export const LabelHeaderTextWithTag2 = ({ value ,css="" }) => {
    return (
        <span className={`fw-bold ${css}`}>{value}</span>
    )
}

export const LabelHeaderText = ({ value ,customClass="" }) => {
    return (

        <span className={`fw-bold me-auto px-4 py-2 ${customClass}`}>{value}</span>
    )
}
export const LabelHeaderText2 = ({ value }) => {
    return (

        <span className="fw-bold text-gold header-text-gold legalTitle">{value}</span>
    )
}
export const LabelHeaderText3 = ({ value ,customClass="" }) => {
    return (

        <span className={`fw-bolder ${customClass}`}>{value}</span>
    )
}

export const LabelHeaderText4 = ({ value ,customClass="" }) => {
    return (
        <span className={`font-family-light ${customClass}`}>{value}</span>
    )
}
