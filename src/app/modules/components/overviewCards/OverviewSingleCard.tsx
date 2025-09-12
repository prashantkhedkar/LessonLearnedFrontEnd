import { Col, Row } from "react-bootstrap";
import RenderFontAwesome from "../../utils/RenderFontAwesome";
import CssFunctions from "../../utils/cssFunctions";
import { MyObject } from "../../../models/row";
import { useIntl } from "react-intl";


const cssFunctions = new CssFunctions;
function OverviewSingleCard(props: { lang: string, dir: string, myObject: MyObject, count: number, styles: { readonly [key: string]: string; } }) {
const code = props.myObject.lookupCode==null?"":props.myObject.lookupCode;
const value = props.lang=="ar"?props.myObject.lookupNameAr:props.myObject.lookupName;
const intl = useIntl();

var tasksText="MOD.TASKMANAGEMENT.TASKS";

if(props.lang=="ar")
var tasksText = props.count>1&&props.count<11?"MOD.TASKMANAGEMENT.TASKS":"MOD.TASKMANAGEMENT.TASK";
else
var tasksText = props.count>1?"MOD.TASKMANAGEMENT.TASKS":"MOD.TASKMANAGEMENT.TASK";

    return (
        <div className="card" style={{borderRadius:"8px",maxWidth:"350px"}}>

            <Row style={{margin:"19px"}}>

                <Col xs lg="2" className={props.styles[code]} style={{borderRadius:"8px"}}>
                    <RenderFontAwesome icon={cssFunctions.getStatusIcon(code)} display={true} size="2xl" />
                </Col>

                <Col>
                    <Row>
                        <div style={{marginBottom:"1px"}}>
                            {value}
                        </div>

                    </Row>

                    <Row >
                        <div className={props.styles.collapseMain}>
                            {props.count + " "+intl.formatMessage({ id: tasksText })}
                        </div>

                    </Row>
                </Col>


            </Row>

        </div>

    )

}

export default OverviewSingleCard;