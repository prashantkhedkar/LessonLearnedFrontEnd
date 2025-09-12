import csscardlbl from "./cardHeaderLabel.module.css";
import { useIntl } from "react-intl";
import { useEffect } from "react";
import { useLang } from "../../../../../_metronic/i18n/Metronici18n";
  
interface props {
style?: React.CSSProperties;
text: string
  //children: React.ReactNode;
}
const CardHeaderLabel = ({style,text}: props) => {

    const intl = useIntl();
    const lang = useLang();

    useEffect(() => {

    }, []);

    return (
        <>
        <span className={csscardlbl["cardTitle"]} style={style}>

          {intl.formatMessage({ id: text })}
        </span>
        </>
    );
};

export default CardHeaderLabel;
