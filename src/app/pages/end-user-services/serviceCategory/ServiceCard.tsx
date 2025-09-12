/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useEffect, useRef, useState } from "react";
import { BtnLabeltxtMedium2 } from "../../../modules/components/common/formsLabels/detailLabels";
import DOMPurify from "dompurify";
import RenderFontAwesome from "../../../modules/utils/RenderFontAwesome";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useIntl } from "react-intl";

type Props = {
  serviceId: number;
  serviceName: string;
  categoryColor: string;
  serviceDescription: string;
  categoryIconName?: string;
};

const ServiceCard: FC<Props> = ({
  serviceId,
  serviceName,
  categoryColor,
  serviceDescription,
  categoryIconName,
}) => {
  const [borderColor, setBorderColor] = useState("");
  const [icon, setIcon] = useState(categoryIconName);
  const [isShowDetail, setIsShowDetail] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const intl = useIntl();

  const handleShowDetailToggle = () => {
    setIsShowDetail((prev) => !prev);
  };

  const handleAddNewService = () => {
    navigate("/end-user/service-request-form", {
      state: {
        serviceId: serviceId,
        requestId: 0,
        isReadOnly: false,
        statusId: 0,
      },
    });
  };

  return (
    <div
      className="service-card-container pointer"
      style={{ borderRight: `10px solid ${categoryColor}` }}
      onClick={handleShowDetailToggle}
    >
      <div className="service-card-header border-0 w-100">
        <div className="border-0 domain-card-icon title-text">
          {/* <RenderFontAwesome
            size="lg"
            color={categoryColor}
            icon={icon}
            display={true}
          /> */}
          <span>
            <i
              className={`fa fa-light fa-lg ${categoryIconName}`}
              style={{ color: `${categoryColor}` }}
            />
          </span>
        </div>
        <div className="title-text w-87">{serviceName}</div>
        <div className="service-card-count title-text px-5">
          <button
            id="kt_modal_new_target_submit"
            className="btn MOD_btn btn-create w-100 pl-5 mx-3"
            onClick={handleAddNewService}
          >
            <FontAwesomeIcon
              icon={faPlus}
              size="lg"
              color={""}
            ></FontAwesomeIcon>
            <BtnLabeltxtMedium2
              text={intl.formatMessage({ id: "BUTTON.SELECT" })}
            />
          </button>
        </div>
      </div>

      <div
        ref={contentRef}
        className={`service-card-detail desc-text me-4 ${
          isShowDetail ? "open" : ""
        }`}
      >
        <span
          style={{ background: "transparent" }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(serviceDescription),
          }}
        ></span>
      </div>
    </div>
  );
};

export { ServiceCard };
