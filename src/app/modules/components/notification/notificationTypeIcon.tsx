import cssNotify from "./notificationCard.module.css";
import { useIntl } from "react-intl";
import { useEffect } from "react";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch, useAppSelector } from "../../../../store";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
interface props {
style: React.CSSProperties;
className?: string
  //children: React.ReactNode;
}
const NotificationTypeIcon = ({style,className}: props) => {

    const dispatch = useAppDispatch();

    const intl = useIntl();
    const lang = useLang();

    useEffect(() => {

    }, []);



    return (
        <>
             <FiberManualRecordIcon style={style} className={className}/> 
        </>
    );
};

export default NotificationTypeIcon;
