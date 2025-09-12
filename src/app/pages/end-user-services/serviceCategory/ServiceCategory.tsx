/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC } from "react";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { CategoryWithServiceCountModel } from "../../../models/global/serviceModel";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../../store";

const ServiceCategory: FC<CategoryWithServiceCountModel> = ({
  categoryNameEn,
  categoryNameAr,
  categoryIconName,
  categoryColor,
  serviceCount,
  categoryId,
}) => {
  const lang = useLang();
  const navigate = useNavigate();
  let dir = "ltr";

  const dispatch = useAppDispatch();

  if (lang.toLowerCase() == "ar") {
    dir = "rtl";
  }

  // const {
  //   [categoryIconName!]: icon,
  // } = require("@fortawesome/pro-light-svg-icons");

  const handleAddNewService = (
    categoryId: number,
    categoryColor: string,
    categoryIconName: string
  ) => {
    if (categoryId > 0)
      navigate("/service-category-list", {
        state: {
          categoryId: categoryId,
          categoryColor: categoryColor,
          categoryIconName: categoryIconName,
        },
      });
  };

  return (
    <>
      <div
        className="domain-card-container domain-card-hover pointer"
        onClick={(e) => {
          handleAddNewService(categoryId!, categoryColor!, categoryIconName!);
        }}
        style={{ borderColor: categoryColor }}
      >
        <div className="domain-card-icon">
          <span>
            <i
              className={`fa fa-light fa-lg ${categoryIconName}`}
              style={{ color: `${categoryColor}` }}
            />
          </span>
          {/* <FontAwesomeIcon
            icon={icon}
            size="xl"
            className="domain-card-icon"
            color={categoryColor}
          /> */}
        </div>
        <div className="domain-card-text">
          <div className="title-text">{categoryNameAr}</div>
          <div className="domain-card-count text-end">{serviceCount}</div>
        </div>
      </div>
    </>
  );
};

export { ServiceCategory };
