import csscardlbl from "./cardHeaderLabel.module.css";
import { useIntl } from "react-intl";
import { useEffect } from "react";
import { useLang } from "../../../../../_metronic/i18n/Metronici18n";
  
interface props {
style?: React.CSSProperties;
text?: string
numericVal?:string;
  //children: React.ReactNode;
}
const CardHeaderSubLabel = ({style,text,numericVal}: props) => {

    const intl = useIntl();
    const lang = useLang();

    useEffect(() => {

    }, []);

    return (
        <>
        <span className={csscardlbl["cardSubTitle"]} style={style}>

        {numericVal} {text !=""? intl.formatMessage({ id: text }) :""}
        </span>
        </>
    );
};

export default CardHeaderSubLabel;
