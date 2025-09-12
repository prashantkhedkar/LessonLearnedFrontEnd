import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch } from "../../../../store";
import { generateUUID } from "../../utils/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
} from "../common/formsLabels/detailLabels";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

interface AddCommentsProps {
  onSubmit: (comment: string) => void;
}

const AddComments = ({ onSubmit }: AddCommentsProps) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const lang = useLang();
  const [showTextBox, setShowTextBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {}, []);

  const handleAddClick = () => {
    setShowTextBox(true);
    setError("");
  };

  const handleCancelClick = () => {
    setShowTextBox(false);
    setCommentText("");
    setError("");
  };

  const handleCommnetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = () => {
    if (commentText.trim()) {
      onSubmit(commentText.trim());
      setShowTextBox(false);
      setCommentText("");
      setError("");
    } else {
      setError(`${intl.formatMessage({ id: "LABEL.COMMENTREQUIRED" })}`);
    }
  };

  return (
    <>
      {!showTextBox && (
        <div className="d-flex gap-4 flex-column pt-5">
          <button
            onClick={() => handleAddClick()}
            className="btn MOD_btn btn-cancel min-w-75px w-100 align-self-end px-6"
            id={generateUUID()}
          >
            <FontAwesomeIcon
              icon={faPlus}
              size="lg"
              color="var(--text-2)"
            ></FontAwesomeIcon>
            <BtnLabelCanceltxtMedium2
              text={intl.formatMessage({ id: "LABEL.ADDCOMMENT" })}
            />
          </button>
        </div>
      )}

      {showTextBox && (
        <div className="d-flex gap-4 flex-column pt-5">
          <div className="row">
            <div className="col-10">
              <input
                type="text"
                autoComplete="off"
                maxLength={100}
                className="form-control form-control-solid active input5 lbl-text-regular-2"
                placeholder={intl.formatMessage({
                  id: "LABEL.ENTERCOMMENT",
                })}
                onChange={handleCommnetChange}
              />
              {error && <div className="error"> {error}</div>}
            </div>
            <div className="col">
              <div className="d-flex gap-4 justify-content-end">
                <button
                  onClick={() => handleSubmit()}
                  className="btn MOD_btn btn-create min-w-75px align-self-end px-6"
                  id={generateUUID()}
                >
                  <BtnLabeltxtMedium2 text={"LABEL.ADDCOMMENT"} />
                </button>
                <button
                  onClick={() => handleCancelClick()}
                  className="btn MOD_btn btn-cancel min-w-75px align-self-end px-6"
                  id={generateUUID()}
                >
                  <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.CANCEL"} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddComments;
