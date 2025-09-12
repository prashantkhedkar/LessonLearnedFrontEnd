import { Row as MyRow } from "../../../models/row";
import CommonFunctions from "../../utils/commonFunction";
import OverviewCardsCss from './OverviewCardsCss.module.css';
import OverviewCardsCssAr from './OverviewCardsCssAr.module.css';
import OverviewSingleCard from "./OverviewSingleCard";
import { Col, Row } from "react-bootstrap";
import { useIntl } from "react-intl";



function OverviewCards(props: { lang: string, data: MyRow[] }) {
    var dir = "ltr";
    var styles = OverviewCardsCss;
    const intl = useIntl();

    if (props.lang.toLowerCase() == "ar") {
        dir = "rtl";
        styles = OverviewCardsCssAr;
    }

    const commonFunctions = new CommonFunctions;

    const groupedData = commonFunctions.countDataByColumnName(props.data, "taskStatus", true);

    return (

        <>

            <Row>
                {Array.from(groupedData).length == 0 ?
                    <div className="sc-aXZVg jNIkof rdt_Table" role="table"><div className="sc-hmdomO cTsUPQ"><div style={{ padding: "24px", margin: "auto" }}>{intl.formatMessage({ id: "MESSAGE.NORECORDS" })}</div></div></div>
                    :
                    
                        Array.from(groupedData).map(([code, countObject]) => (

                            <Col>
                                <OverviewSingleCard styles={styles} dir={dir} lang={props.lang} count={countObject.count} myObject={countObject.myObject} />

                            </Col>

                        ))
                    
                }


            </Row>


        </>







    );


}

export default OverviewCards