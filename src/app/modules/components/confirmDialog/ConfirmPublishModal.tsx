import { useState } from "react";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { generateUUID } from "../../utils/common";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
  InfoLabels,
  LabelHeadingMedium4,
  LabelHeadingSemibold3,
  LabelHeadingSemibold6,
} from "../common/formsLabels/detailLabels";

type props = {
  setShow: any;
  onConfirm: any;
  labelMessage: string;
};

export default function ConfirmPublishModal({ setShow, onConfirm, labelMessage }: props) {
  const lang = useLang();
  const [show2, setShow2] = useState(false);
  return (
    <>
      <div className="row">
        <div className="col-lg-12 col-md-12 col-sm-12 text-center">
          <LabelHeadingSemibold6 style={{}} text={labelMessage} />{" "}
          <br />
        </div>
      </div>

      <div className="row pt-2" id="controlPanelProjectSubmission">
        <div className="col-12 d-flex justify-content-center">
          <button
            onClick={() => {
              onConfirm();
            }}
            className="btn MOD_btn btn-create w-10 pl-5 mx-3"
            id={generateUUID()}
          >
            <BtnLabeltxtMedium2 text={"BUTTON.LABEL.YES"} />
          </button>
          <button
            onClick={() => {
              setShow(false);
            }}
            className="btn MOD_btn btn-cancel w-10"
            id={generateUUID()}
          >
            <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.NO"} />
          </button>
        </div>
      </div>
    </>
  );
}
